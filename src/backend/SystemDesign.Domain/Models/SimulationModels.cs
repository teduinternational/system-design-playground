namespace SystemDesign.Domain.Models;

/// <summary>
/// Request model cho simulation
/// </summary>
public sealed record SimulationRequest
{
    public required List<SimulationNode> Nodes { get; init; }
    public required List<SimulationEdge> Edges { get; init; }
    /// <summary>
    /// Số lượng concurrent requests để mô phỏng queuing delay
    /// </summary>
    public int ConcurrentRequests { get; init; } = 1;
}

/// <summary>
/// Node trong simulation graph
/// </summary>
public sealed record SimulationNode
{
    public required string Id { get; init; }
    public required string Type { get; init; }
    public double LatencyMs { get; init; } = 0;
    public double? JitterMs { get; init; } = 0;
    public bool IsEntryPoint { get; init; } = false;
    /// <summary>
    /// Capacity tối đa (requests/second). Vượt quá sẽ gây queuing delay
    /// </summary>
    public double? Capacity { get; init; } = null;
}

/// <summary>
/// Edge trong simulation graph
/// </summary>
public sealed record SimulationEdge
{
    public required string Id { get; init; }
    public required string Source { get; init; }
    public required string Target { get; init; }
    public double LatencyMs { get; init; } = 0;
    public double? JitterMs { get; init; } = 0;
}

/// <summary>
/// Kết quả simulation
/// </summary>
public sealed record SimulationResult
{
    public required string EntryNodeId { get; init; }
    public required string EndNodeId { get; init; }
    public required List<string> Path { get; init; }
    public required double TotalLatencyMs { get; init; }
    public required int PathLength { get; init; }
    public required string Summary { get; init; }
}

/// <summary>
/// Kết quả simulation với percentiles (P50, P95) từ 1000 lần giả lập
/// </summary>
public sealed record PercentileSimulationResult
{
    public required string EntryNodeId { get; init; }
    public int SimulationCount { get; init; }
    public double P50LatencyMs { get; init; }
    public double P95LatencyMs { get; init; }
    public double MinLatencyMs { get; init; }
    public double MaxLatencyMs { get; init; }
    public double AvgLatencyMs { get; init; }
    /// <summary>
    /// Thông tin về các nodes bị overload và queuing delay
    /// </summary>
    public List<NodeQueueingInfo>? OverloadedNodes { get; init; }
}

/// <summary>
/// Thông tin về queuing delay của một node khi bị overload
/// </summary>
public sealed record NodeQueueingInfo
{
    public required string NodeId { get; init; }
    public required double Capacity { get; init; }
    public required double ActualLoad { get; init; }
    public required double AvgQueueingDelayMs { get; init; }
    public required double LoadFactor { get; init; } // ActualLoad / Capacity
}
