namespace SystemDesign.Domain.Models;

/// <summary>
/// Request model cho simulation
/// </summary>
public sealed record SimulationRequest
{
    public required List<SimulationNode> Nodes { get; init; }
    public required List<SimulationEdge> Edges { get; init; }
}

/// <summary>
/// Node trong simulation graph
/// </summary>
public sealed record SimulationNode
{
    public required string Id { get; init; }
    public required string Type { get; init; }
    public double LatencyMs { get; init; } = 0;
    public bool IsEntryPoint { get; init; } = false;
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
