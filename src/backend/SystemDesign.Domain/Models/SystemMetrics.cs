namespace SystemDesign.Domain.Models;

/// <summary>
/// Chỉ số đánh giá hệ thống - dùng cho KPI Dashboard
/// </summary>
public record SystemMetrics(
    decimal MonthlyCost,
    double OverallErrorRate,
    int HealthScore,
    string EfficiencyRating,
    double AvailabilityPercentage,
    Dictionary<string, decimal>? CostBreakdown = null,
    List<string>? Bottlenecks = null
);

/// <summary>
/// Cấu hình giá cơ sở cho từng loại node (theo Category)
/// </summary>
public record NodePricingConfig(
    string Category,
    decimal BasePrice,
    decimal PricePerInstance
);
