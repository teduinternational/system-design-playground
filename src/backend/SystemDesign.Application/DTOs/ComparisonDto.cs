namespace SystemDesign.Application.DTOs;

/// <summary>
/// Request để so sánh nhiều scenarios
/// </summary>
public record CompareScenarioRequest(
    List<Guid> ScenarioIds
);

/// <summary>
/// Metrics của một scenario
/// </summary>
public record ScenarioMetrics(
    Guid ScenarioId,
    string ScenarioName,
    double TotalLatencyMs,
    double ThroughputRps,
    double EstimatedCostUsd
);

/// <summary>
/// Kết quả so sánh giữa các scenarios
/// </summary>
public record ComparisonResult(
    ScenarioMetrics Scenario1,
    ScenarioMetrics Scenario2,
    ComparisonDifferences Differences
);

/// <summary>
/// Các chỉ số chênh lệch
/// </summary>
public record ComparisonDifferences(
    double LatencyDiff,
    double LatencyPercent,
    double ThroughputDiff,
    double ThroughputPercent,
    double CostDiff,
    double CostPercent
);
