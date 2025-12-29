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
    /// Helper class để lưu path information
    /// </summary>
    private sealed record PathInfo(List<string> Path, double TotalLatency);
}
