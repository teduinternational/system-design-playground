namespace SystemDesign.Domain.Models;

using SystemDesign.Domain.Enums;

/// <summary>
/// Thông số kỹ thuật cho mô phỏng node
/// </summary>
public record NodeSpecs(
    double LatencyBase,
    int MaxThroughput,
    double Reliability
);

/// <summary>
/// Logic routing và dependencies của node
/// </summary>
public record NodeLogic(
    List<string> CanReceiveFrom,
    List<string> CanSendTo
);

/// <summary>
/// Technical Props - Cấu hình kỹ thuật của node
/// </summary>
public record TechnicalProps(
    int? InstanceCount = null,
    bool? IsClustered = null,
    string? BackupPolicy = null,
    string? Region = null,
    Dictionary<string, object>? AdditionalProps = null
);

/// <summary>
/// Simulation Props - Thông số mô phỏng
/// </summary>
public record SimulationProps(
    double ProcessingTimeMs,
    double FailureRate,
    int? QueueSize = null,
    double? CurrentLoad = null
);

/// <summary>
/// Metadata đầy đủ cho node - chứa tất cả thông tin về node
/// </summary>
public record NodeMetadata(
    string Label,
    NodeCategory Category,
    NodeSpecs Specs,
    List<string>? Technologies = null,
    string? Provider = null,
    NodeLogic? Logic = null,
    TechnicalProps? Props = null,
    SimulationProps? Simulation = null,
    string? IconName = null,
    string? Status = null
);

/// <summary>
/// Vị trí node trên canvas
/// </summary>
public record Position(double X, double Y);

/// <summary>
/// Model node duy nhất - dùng cho cả Backend logic và React Flow visualization
/// </summary>
public record NodeModel(
    string Id,
    string Type,
    NodeMetadata Metadata,
    Position? Position = null
);
