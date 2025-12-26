namespace SystemDesign.Domain.Models;

/// <summary>
/// Dữ liệu edge (connection) giữa các nodes
/// </summary>
public record EdgeData(
    string Protocol,
    string? Auth = null,
    double TrafficWeight = 1.0,
    double NetworkLatency = 0
);

/// <summary>
/// Model edge đầy đủ cho React Flow
/// </summary>
public record EdgeModel(
    string Id,
    string Source,
    string Target,
    string? Label = null,
    EdgeData? Data = null
);
