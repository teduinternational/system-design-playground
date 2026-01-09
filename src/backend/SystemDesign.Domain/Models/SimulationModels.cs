namespace SystemDesign.Domain.Models;

/// <summary>
/// Request model cho simulation - sử dụng NodeModel và EdgeModel trực tiếp
/// </summary>
public sealed record SimulationRequest
{
    public required List<NodeModel> Nodes { get; init; }
    public required List<EdgeModel> Edges { get; init; }
    /// <summary>
    /// Số lượng concurrent requests để mô phỏng queuing delay
    /// </summary>
    public int ConcurrentRequests { get; init; } = 1;
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
    /// <summary>
    /// Danh sách các bottlenecks (điểm nghẽn) trong hệ thống
    /// </summary>
    public List<BottleneckInfo>? Bottlenecks { get; init; }
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

/// <summary>
/// Thông tin về bottleneck (điểm nghẽn) trong hệ thống
/// </summary>
public sealed record BottleneckInfo
{
    public required string NodeId { get; init; }
    public required string Reason { get; init; }
    public required double Utilization { get; init; }
    public required double Capacity { get; init; }
    public required double CurrentLoad { get; init; }
    public required string Severity { get; init; } // "Critical" (>95%), "High" (>90%), "Medium" (>80%)
}
