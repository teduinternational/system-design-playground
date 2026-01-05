using SystemDesign.Domain.Models;

namespace SystemDesign.Application.Services;

/// <summary>
/// Service xử lý simulation và tính toán latency của system architecture
/// Sử dụng BFS để tìm đường đi dài nhất (longest path) từ entry points
/// </summary>
public interface ISimulationEngine
{
    /// <summary>
    /// Tính toán đường đi dài nhất và tổng latency từ tất cả entry points
    /// </summary>
    Task<List<SimulationResult>> CalculateLongestPathsAsync(SimulationRequest request, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Tính toán đường đi dài nhất từ một node cụ thể
    /// </summary>
    Task<SimulationResult?> CalculateLongestPathFromNodeAsync(SimulationRequest request, string startNodeId, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Giả lập 1000 lần request và tính toán P50, P95 latency
    /// </summary>
    Task<PercentileSimulationResult> SimulateWithPercentilesAsync(SimulationRequest request, string startNodeId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Implementation của Simulation Engine sử dụng BFS algorithm
/// Primary Constructor được dùng cho dependency injection
/// </summary>
public sealed class SimulationEngine : ISimulationEngine
{
    /// <summary>
    /// Tính toán đường đi dài nhất từ tất cả entry points
    /// </summary>
    public Task<List<SimulationResult>> CalculateLongestPathsAsync(
        SimulationRequest request,
        CancellationToken cancellationToken = default)
    {
        var results = new List<SimulationResult>();

        // Tìm tất cả entry points (nodes không có incoming edges hoặc được đánh dấu IsEntryPoint)
        var entryNodes = FindEntryNodes(request);

        // Tính longest path từ mỗi entry point
        foreach (var entryNode in entryNodes)
        {
            var result = CalculateLongestPathFromNode(request, entryNode.Id);
            if (result != null)
            {
                results.Add(result);
            }
        }

        return Task.FromResult(results);
    }

    /// <summary>
    /// Tính toán đường đi dài nhất từ một node cụ thể
    /// </summary>
    public Task<SimulationResult?> CalculateLongestPathFromNodeAsync(
        SimulationRequest request,
        string startNodeId,
        CancellationToken cancellationToken = default)
    {
        var result = CalculateLongestPathFromNode(request, startNodeId);
        return Task.FromResult(result);
    }

    /// <summary>
    /// Giả lập 1000 lần request và tính toán P50, P95 latency với random jitter và queuing delay
    /// </summary>
    public Task<PercentileSimulationResult> SimulateWithPercentilesAsync(
        SimulationRequest request,
        string startNodeId,
        CancellationToken cancellationToken = default)
    {
        const int SimulationCount = 1000;
        var random = new Random();
        var latencies = new List<double>(SimulationCount);
        
        // Track node load để tính queuing delay
        var nodeLoadCounter = new Dictionary<string, int>();
        var nodeQueueingDelays = new Dictionary<string, List<double>>();

        // Giả lập 1000 lần request
        for (int i = 0; i < SimulationCount; i++)
        {
            var (totalLatency, pathNodes) = CalculatePathLatencyWithJitterAndQueuing(
                request, startNodeId, random, nodeLoadCounter, nodeQueueingDelays);
            
            if (totalLatency.HasValue)
            {
                latencies.Add(totalLatency.Value);
            }
        }

        // Sắp xếp để tính percentiles
        latencies.Sort();

        // Tính toán overloaded nodes
        var overloadedNodes = CalculateOverloadedNodes(request, nodeLoadCounter, nodeQueueingDelays, SimulationCount);

        // Phân tích bottlenecks (điểm nghẽn)
        var bottlenecks = AnalyzeBottlenecks(request, nodeLoadCounter, SimulationCount);

        var result = new PercentileSimulationResult
        {
            EntryNodeId = startNodeId,
            SimulationCount = latencies.Count,
            P50LatencyMs = latencies.Count > 0 ? latencies[latencies.Count / 2] : 0,
            P95LatencyMs = latencies.Count > 0 ? latencies[(int)(latencies.Count * 0.95)] : 0,
            MinLatencyMs = latencies.Count > 0 ? latencies[0] : 0,
            MaxLatencyMs = latencies.Count > 0 ? latencies[^1] : 0,
            AvgLatencyMs = latencies.Count > 0 ? latencies.Average() : 0,
            OverloadedNodes = overloadedNodes,
            Bottlenecks = bottlenecks
        };

        return Task.FromResult(result);
    }

    /// <summary>
    /// Tính toán latency của một path với random jitter cho mỗi node
    /// </summary>
    private double? CalculatePathLatencyWithJitter(SimulationRequest request, string startNodeId, Random random)
    {
        var startNode = request.Nodes.FirstOrDefault(n => n.Id == startNodeId);
        if (startNode == null)
            return null;

        // Build adjacency list
        var adjacencyList = BuildAdjacencyList(request);
        
        // Tìm longest path (giống như method cũ)
        var longestPaths = new Dictionary<string, PathInfo>();
        var queue = new Queue<(string NodeId, List<string> Path, double Latency)>();
        
        // Tính latency với jitter: BaseLatency + (Random * Jitter)
        var startLatency = startNode.LatencyMs + (random.NextDouble() * (startNode.JitterMs ?? 0));
        queue.Enqueue((startNodeId, [startNodeId], startLatency));
        longestPaths[startNodeId] = new PathInfo([startNodeId], startLatency);

        while (queue.Count > 0)
        {
            var (currentNodeId, currentPath, currentLatency) = queue.Dequeue();
            
            if (!adjacencyList.TryGetValue(currentNodeId, out var neighbors))
                continue;

            foreach (var (neighborId, edge) in neighbors)
            {
                var neighborNode = request.Nodes.First(n => n.Id == neighborId);
                
                // Tính latency với jitter cho neighbor node
                var neighborLatency = neighborNode.LatencyMs + (random.NextDouble() * (neighborNode.JitterMs ?? 0));
                var edgeLatency = edge.LatencyMs + (random.NextDouble() * (edge.JitterMs ?? 0));
                var newLatency = currentLatency + edgeLatency + neighborLatency;
                var newPath = new List<string>(currentPath) { neighborId };

                if (!longestPaths.TryGetValue(neighborId, out var existingPath) ||
                    newLatency > existingPath.TotalLatency)
                {
                    longestPaths[neighborId] = new PathInfo(newPath, newLatency);
                    queue.Enqueue((neighborId, newPath, newLatency));
                }
            }
        }

        // Tìm end node với longest latency
        var endNodes = FindEndNodes(request, adjacencyList);
        var maxLatency = 0.0;
        
        foreach (var endNode in endNodes)
        {
            if (longestPaths.TryGetValue(endNode.Id, out var pathInfo))
            {
                if (pathInfo.TotalLatency > maxLatency)
                {
                    maxLatency = pathInfo.TotalLatency;
                }
            }
        }

        return maxLatency > 0 ? maxLatency : null;
    }

    /// <summary>
    /// Core BFS algorithm để tìm longest path và tính tổng latency
    /// </summary>
    private SimulationResult? CalculateLongestPathFromNode(SimulationRequest request, string startNodeId)
    {
        var startNode = request.Nodes.FirstOrDefault(n => n.Id == startNodeId);
        if (startNode == null)
            return null;

        // Build adjacency list cho graph
        var adjacencyList = BuildAdjacencyList(request);
        
        // Dictionary lưu trữ longest path đến mỗi node
        var longestPaths = new Dictionary<string, PathInfo>();
        
        // BFS queue: (currentNodeId, currentPath, currentLatency)
        var queue = new Queue<(string NodeId, List<string> Path, double Latency)>();
        
        // Khởi tạo với start node
        queue.Enqueue((startNodeId, [startNodeId], startNode.LatencyMs));
        longestPaths[startNodeId] = new PathInfo([startNodeId], startNode.LatencyMs);

        // BFS traversal
        while (queue.Count > 0)
        {
            var (currentNodeId, currentPath, currentLatency) = queue.Dequeue();
            
            // Lấy tất cả neighbors (adjacent nodes)
            if (!adjacencyList.TryGetValue(currentNodeId, out var neighbors))
                continue;

            foreach (var (neighborId, edge) in neighbors)
            {
                var neighborNode = request.Nodes.First(n => n.Id == neighborId);
                
                // Tính latency mới: current latency + edge latency + neighbor node latency
                var newLatency = currentLatency + edge.LatencyMs + neighborNode.LatencyMs;
                var newPath = new List<string>(currentPath) { neighborId };

                // Kiểm tra xem đây có phải longest path đến neighbor này không
                if (!longestPaths.TryGetValue(neighborId, out var existingPath) ||
                    newLatency > existingPath.TotalLatency)
                {
                    longestPaths[neighborId] = new PathInfo(newPath, newLatency);
                    queue.Enqueue((neighborId, newPath, newLatency));
                }
            }
        }

        // Tìm node cuối cùng có longest path (node không có outgoing edges)
        var endNodes = FindEndNodes(request, adjacencyList);
        
        PathInfo? longestOverall = null;
        string? endNodeId = null;

        foreach (var endNode in endNodes)
        {
            if (longestPaths.TryGetValue(endNode.Id, out var pathInfo))
            {
                if (longestOverall == null || pathInfo.TotalLatency > longestOverall.TotalLatency)
                {
                    longestOverall = pathInfo;
                    endNodeId = endNode.Id;
                }
            }
        }

        if (longestOverall == null || endNodeId == null)
            return null;

        return new SimulationResult
        {
            EntryNodeId = startNodeId,
            EndNodeId = endNodeId,
            Path = longestOverall.Path,
            TotalLatencyMs = longestOverall.TotalLatency,
            PathLength = longestOverall.Path.Count,
            Summary = $"Longest path from {startNodeId} to {endNodeId}: {longestOverall.Path.Count} nodes, {longestOverall.TotalLatency:F2}ms total latency"
        };
    }

    /// <summary>
    /// Build adjacency list representation của graph
    /// </summary>
    private Dictionary<string, List<(string TargetNodeId, SimulationEdge Edge)>> BuildAdjacencyList(SimulationRequest request)
    {
        var adjacencyList = new Dictionary<string, List<(string, SimulationEdge)>>();

        foreach (var edge in request.Edges)
        {
            if (!adjacencyList.ContainsKey(edge.Source))
            {
                adjacencyList[edge.Source] = [];
            }
            adjacencyList[edge.Source].Add((edge.Target, edge));
        }

        return adjacencyList;
    }

    /// <summary>
    /// Tìm tất cả entry nodes (nodes không có incoming edges hoặc marked as entry)
    /// </summary>
    private List<SimulationNode> FindEntryNodes(SimulationRequest request)
    {
        var nodesWithIncoming = new HashSet<string>(request.Edges.Select(e => e.Target));
        
        return request.Nodes
            .Where(n => n.IsEntryPoint || !nodesWithIncoming.Contains(n.Id))
            .ToList();
    }

    /// <summary>
    /// Tìm tất cả end nodes (nodes không có outgoing edges)
    /// </summary>
    private List<SimulationNode> FindEndNodes(
        SimulationRequest request,
        Dictionary<string, List<(string, SimulationEdge)>> adjacencyList)
    {
        return request.Nodes
            .Where(n => !adjacencyList.ContainsKey(n.Id) || adjacencyList[n.Id].Count == 0)
            .ToList();
    }

    /// <summary>
    /// Tính toán latency với jitter và queuing delay khi node bị overload
    /// </summary>
    private (double? TotalLatency, List<string> Path) CalculatePathLatencyWithJitterAndQueuing(
        SimulationRequest request,
        string startNodeId,
        Random random,
        Dictionary<string, int> nodeLoadCounter,
        Dictionary<string, List<double>> nodeQueueingDelays)
    {
        var startNode = request.Nodes.FirstOrDefault(n => n.Id == startNodeId);
        if (startNode == null)
            return (null, []);

        var adjacencyList = BuildAdjacencyList(request);
        var longestPaths = new Dictionary<string, PathInfo>();
        var queue = new Queue<(string NodeId, List<string> Path, double Latency)>();
        
        // Track node loads trong path này
        var currentPathNodes = new HashSet<string>();
        
        // Tính latency với jitter cho start node
        var startLatency = CalculateNodeLatencyWithJitter(startNode, random);
        
        // Áp dụng queuing delay nếu node bị overload
        var startQueueingDelay = CalculateQueueingDelay(startNode, nodeLoadCounter, request.ConcurrentRequests);
        startLatency += startQueueingDelay;
        
        // Track load và queuing delay
        TrackNodeLoad(startNodeId, startQueueingDelay, nodeLoadCounter, nodeQueueingDelays);
        
        queue.Enqueue((startNodeId, new List<string> { startNodeId }, startLatency));
        longestPaths[startNodeId] = new PathInfo(new List<string> { startNodeId }, startLatency);
        currentPathNodes.Add(startNodeId);

        while (queue.Count > 0)
        {
            var (currentNodeId, currentPath, currentLatency) = queue.Dequeue();
            
            if (!adjacencyList.TryGetValue(currentNodeId, out var neighbors))
                continue;

            foreach (var (neighborId, edge) in neighbors)
            {
                var neighborNode = request.Nodes.First(n => n.Id == neighborId);
                
                // Tính latency với jitter
                var neighborLatency = CalculateNodeLatencyWithJitter(neighborNode, random);
                var edgeLatency = edge.LatencyMs + (random.NextDouble() * (edge.JitterMs ?? 0));
                
                // Áp dụng queuing delay nếu neighbor node bị overload
                var queueingDelay = CalculateQueueingDelay(neighborNode, nodeLoadCounter, request.ConcurrentRequests);
                neighborLatency += queueingDelay;
                
                // Track load
                if (!currentPathNodes.Contains(neighborId))
                {
                    TrackNodeLoad(neighborId, queueingDelay, nodeLoadCounter, nodeQueueingDelays);
                    currentPathNodes.Add(neighborId);
                }
                
                var newLatency = currentLatency + edgeLatency + neighborLatency;
                var newPath = new List<string>(currentPath) { neighborId };

                if (!longestPaths.TryGetValue(neighborId, out var existingPath) ||
                    newLatency > existingPath.TotalLatency)
                {
                    longestPaths[neighborId] = new PathInfo(newPath, newLatency);
                    queue.Enqueue((neighborId, newPath, newLatency));
                }
            }
        }

        // Tìm end node với longest latency
        var endNodes = FindEndNodes(request, adjacencyList);
        var maxLatency = 0.0;
        List<string>? finalPath = null;
        
        foreach (var endNode in endNodes)
        {
            if (longestPaths.TryGetValue(endNode.Id, out var pathInfo))
            {
                if (pathInfo.TotalLatency > maxLatency)
                {
                    maxLatency = pathInfo.TotalLatency;
                    finalPath = pathInfo.Path;
                }
            }
        }

        return (maxLatency > 0 ? maxLatency : null, finalPath ?? []);
    }

    /// <summary>
    /// Tính toán queuing delay dựa trên load factor (exponential growth)
    /// Công thức: BaseLatency * (LoadFactor ^ 2) khi LoadFactor > 1
    /// </summary>
    private double CalculateQueueingDelay(
        SimulationNode node,
        Dictionary<string, int> nodeLoadCounter,
        int concurrentRequests)
    {
        if (node.Capacity == null || node.Capacity <= 0)
            return 0;

        // Tính load factor: số requests hiện tại / capacity
        var currentLoad = nodeLoadCounter.GetValueOrDefault(node.Id, 0) + concurrentRequests;
        var loadFactor = currentLoad / node.Capacity.Value;

        // Nếu không overload, không có queuing delay
        if (loadFactor <= 1.0)
            return 0;

        // Queuing delay tăng theo cấp số nhân khi overload
        // Công thức: BaseLatency * (LoadFactor - 1)^2
        var queuingDelay = node.LatencyMs * Math.Pow(loadFactor - 1, 2);
        
        return queuingDelay;
    }

    /// <summary>
    /// Tính node latency với jitter
    /// </summary>
    private double CalculateNodeLatencyWithJitter(SimulationNode node, Random random)
    {
        return node.LatencyMs + (random.NextDouble() * (node.JitterMs ?? 0));
    }

    /// <summary>
    /// Track node load và queuing delay
    /// </summary>
    private void TrackNodeLoad(
        string nodeId,
        double queueingDelay,
        Dictionary<string, int> nodeLoadCounter,
        Dictionary<string, List<double>> nodeQueueingDelays)
    {
        nodeLoadCounter[nodeId] = nodeLoadCounter.GetValueOrDefault(nodeId, 0) + 1;
        
        if (!nodeQueueingDelays.ContainsKey(nodeId))
        {
            nodeQueueingDelays[nodeId] = [];
        }
        nodeQueueingDelays[nodeId].Add(queueingDelay);
    }

    /// <summary>
    /// Tính toán thông tin về các nodes bị overload
    /// </summary>
    private List<NodeQueueingInfo>? CalculateOverloadedNodes(
        SimulationRequest request,
        Dictionary<string, int> nodeLoadCounter,
        Dictionary<string, List<double>> nodeQueueingDelays,
        int totalSimulations)
    {
        var overloadedNodes = new List<NodeQueueingInfo>();

        foreach (var node in request.Nodes.Where(n => n.Capacity.HasValue))
        {
            var actualLoad = nodeLoadCounter.GetValueOrDefault(node.Id, 0);
            var loadFactor = actualLoad / (double)totalSimulations;
            var capacity = node.Capacity!.Value;

            // Chỉ báo cáo nếu node bị overload
            if (loadFactor > capacity)
            {
                var avgQueueingDelay = nodeQueueingDelays.ContainsKey(node.Id)
                    ? nodeQueueingDelays[node.Id].Average()
                    : 0;

                overloadedNodes.Add(new NodeQueueingInfo
                {
                    NodeId = node.Id,
                    Capacity = capacity,
                    ActualLoad = loadFactor,
                    AvgQueueingDelayMs = avgQueueingDelay,
                    LoadFactor = loadFactor / capacity
                });
            }
        }

        return overloadedNodes.Count > 0 ? overloadedNodes : null;
    }

    /// <summary>
    /// Phân tích bottlenecks (điểm nghẽn) trong hệ thống
    /// Bottleneck là node có utilization cao (>80%) có thể gây nghẽn cho toàn bộ flow
    /// </summary>
    private List<BottleneckInfo>? AnalyzeBottlenecks(
        SimulationRequest request,
        Dictionary<string, int> nodeLoadCounter,
        int totalSimulations)
    {
        var bottlenecks = new List<BottleneckInfo>();

        foreach (var node in request.Nodes.Where(n => n.Capacity.HasValue && n.Capacity > 0))
        {
            var actualLoad = nodeLoadCounter.GetValueOrDefault(node.Id, 0);
            var capacity = node.Capacity!.Value;
            
            // Tính utilization: số requests thực tế / capacity
            // Chia cho totalSimulations để chuẩn hóa về tỷ lệ per simulation
            var currentLoad = (double)actualLoad / totalSimulations;
            var utilization = currentLoad / capacity;

            // Phân loại severity dựa trên utilization
            string? severity = null;
            string? reason = null;

            if (utilization >= 0.95)
            {
                severity = "Critical";
                reason = $"Node đang chạy ở mức {utilization:P0} capacity. Đây là bottleneck nghiêm trọng - cần scale up NGAY hoặc thêm instances để tránh hệ thống sập.";
            }
            else if (utilization >= 0.90)
            {
                severity = "High";
                reason = $"Node đang chạm ngưỡng giới hạn ({utilization:P0} capacity). Cần tăng thêm Instances hoặc scale-up để tránh bottleneck.";
            }
            else if (utilization >= 0.80)
            {
                severity = "Medium";
                reason = $"Node đang chạy ở mức {utilization:P0} capacity. Nên cân nhắc scale up để đảm bảo performance ổn định.";
            }

            if (severity != null && reason != null)
            {
                bottlenecks.Add(new BottleneckInfo
                {
                    NodeId = node.Id,
                    Reason = reason,
                    Utilization = utilization,
                    Capacity = capacity,
                    CurrentLoad = currentLoad,
                    Severity = severity
                });
            }
        }

        // Sắp xếp theo utilization giảm dần (bottleneck nghiêm trọng nhất lên đầu)
        bottlenecks = bottlenecks.OrderByDescending(b => b.Utilization).ToList();

        return bottlenecks.Count > 0 ? bottlenecks : null;
    }

    /// <summary>
    /// Helper class để lưu path information
    /// </summary>
    private sealed record PathInfo(List<string> Path, double TotalLatency);
}
