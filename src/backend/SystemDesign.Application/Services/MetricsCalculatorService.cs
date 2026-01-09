using SystemDesign.Domain;
using SystemDesign.Domain.Models;

namespace SystemDesign.Application.Services;

/// <summary>
/// Service tính toán metrics và KPI cho hệ thống
/// Dùng cho Dashboard và What-if Analysis
/// </summary>
public class MetricsCalculatorService : IMetricsCalculatorService
{
    // Cấu hình giá cơ sở cho từng loại node (USD/tháng)
    private static readonly Dictionary<string, NodePricingConfig> PricingTable = new()
    {
        ["EntryPoint"] = new("EntryPoint", 50m, 30m),      // Load Balancer, API Gateway
        ["TrafficManager"] = new("TrafficManager", 100m, 50m), // CDN, Rate Limiter
        ["Compute"] = new("Compute", 150m, 100m),          // API Server, Worker
        ["Storage"] = new("Storage", 200m, 80m),           // Database, Object Storage
        ["Middleware"] = new("Middleware", 80m, 40m)       // Message Queue, Cache
    };

    public SystemMetrics CalculateMetrics(DiagramContent diagramContent)
    {
        if (diagramContent?.Nodes == null || !diagramContent.Nodes.Any())
        {
            return CreateEmptyMetrics();
        }

        // 1. Tính toán Monthly Cost
        var (totalCost, costBreakdown) = CalculateMonthlyCost(diagramContent.Nodes);

        // 2. Tính toán Overall Error Rate
        var overallErrorRate = CalculateOverallErrorRate(diagramContent.Nodes);

        // 3. Phát hiện Bottlenecks
        var bottlenecks = DetectBottlenecks(diagramContent.Nodes, diagramContent.Edges);

        // 4. Tính Health Score
        var healthScore = CalculateHealthScore(overallErrorRate, bottlenecks.Count, diagramContent.Nodes);

        // 5. Đánh giá Efficiency Rating
        var efficiencyRating = DetermineEfficiencyRating(healthScore, overallErrorRate);

        // 6. Tính Availability Percentage
        var availabilityPercentage = CalculateAvailability(diagramContent.Nodes);

        return new SystemMetrics(
            totalCost,
            overallErrorRate,
            healthScore,
            efficiencyRating,
            availabilityPercentage,
            costBreakdown,
            bottlenecks
        );
    }

    public SystemMetrics CalculateWhatIfScenario(DiagramContent diagramContent, string nodeId, int newInstanceCount)
    {
        if (diagramContent?.Nodes == null)
        {
            return CreateEmptyMetrics();
        }

        // Clone diagram content và thay đổi instance count của node được chỉ định
        var modifiedNodes = diagramContent.Nodes.Select(n =>
        {
            if (n.Id == nodeId && n.Metadata.Props != null)
            {
                var newProps = n.Metadata.Props with { InstanceCount = newInstanceCount };
                var newMetadata = n.Metadata with { Props = newProps };
                return n with { Metadata = newMetadata };
            }
            return n;
        }).ToList();

        var modifiedContent = diagramContent with { Nodes = modifiedNodes };
        return CalculateMetrics(modifiedContent);
    }

    private (decimal totalCost, Dictionary<string, decimal> breakdown) CalculateMonthlyCost(List<NodeModel> nodes)
    {
        var breakdown = new Dictionary<string, decimal>();
        decimal totalCost = 0m;

        foreach (var node in nodes)
        {
            var category = node.Metadata.Category;
            var instanceCount = node.Metadata.Props?.InstanceCount ?? 1;

            if (PricingTable.TryGetValue(category, out var pricing))
            {
                var nodeCost = pricing.BasePrice + (pricing.PricePerInstance * instanceCount);
                totalCost += nodeCost;

                if (breakdown.ContainsKey(category))
                    breakdown[category] += nodeCost;
                else
                    breakdown[category] = nodeCost;
            }
        }

        return (totalCost, breakdown);
    }

    private double CalculateOverallErrorRate(List<NodeModel> nodes)
    {
        var nodesWithSimulation = nodes
            .Where(n => n.Metadata.Simulation?.FailureRate != null)
            .ToList();

        if (!nodesWithSimulation.Any())
            return 0.0;

        // Tính trung bình có trọng số dựa trên số lượng instances
        double totalWeightedError = 0;
        int totalWeight = 0;

        foreach (var node in nodesWithSimulation)
        {
            var instanceCount = node.Metadata.Props?.InstanceCount ?? 1;
            var failureRate = node.Metadata.Simulation!.FailureRate;

            // Khi có nhiều instances, error rate giảm (redundancy effect)
            var adjustedFailureRate = failureRate / Math.Sqrt(instanceCount);

            totalWeightedError += adjustedFailureRate * instanceCount;
            totalWeight += instanceCount;
        }

        return totalWeight > 0 ? totalWeightedError / totalWeight : 0.0;
    }

    private List<string> DetectBottlenecks(List<NodeModel> nodes, List<EdgeModel> edges)
    {
        var bottlenecks = new List<string>();

        foreach (var node in nodes)
        {
            // Bottleneck 1: Node có quá nhiều connections đến (single point of failure)
            var incomingEdges = edges.Count(e => e.Target == node.Id);
            if (incomingEdges > 5)
            {
                bottlenecks.Add($"{node.Metadata.Label}: Too many incoming connections ({incomingEdges})");
            }

            // Bottleneck 2: Node có InstanceCount thấp nhưng FailureRate cao
            var instanceCount = node.Metadata.Props?.InstanceCount ?? 1;
            var failureRate = node.Metadata.Simulation?.FailureRate ?? 0;

            if (instanceCount < 2 && failureRate > 0.05) // >5% failure rate với single instance
            {
                bottlenecks.Add($"{node.Metadata.Label}: Single instance with high failure rate ({failureRate:P0})");
            }

            // Bottleneck 3: Storage nodes không có backup policy
            if (node.Metadata.Category == "Storage" && string.IsNullOrEmpty(node.Metadata.Props?.BackupPolicy))
            {
                bottlenecks.Add($"{node.Metadata.Label}: No backup policy configured");
            }
        }

        return bottlenecks;
    }

    private int CalculateHealthScore(double errorRate, int bottleneckCount, List<NodeModel> nodes)
    {
        int score = 100;

        // Trừ điểm dựa trên error rate (tối đa -40 điểm)
        score -= (int)(errorRate * 400);

        // Trừ điểm cho mỗi bottleneck (mỗi cái -10 điểm)
        score -= bottleneckCount * 10;

        // Bonus điểm cho clustering và redundancy
        var clusteredNodes = nodes.Count(n => n.Metadata.Props?.IsClustered == true);
        var redundantNodes = nodes.Count(n => (n.Metadata.Props?.InstanceCount ?? 1) > 1);

        score += (clusteredNodes * 2);
        score += (redundantNodes * 3);

        // Đảm bảo score trong khoảng 0-100
        return Math.Clamp(score, 0, 100);
    }

    private string DetermineEfficiencyRating(int healthScore, double errorRate)
    {
        return (healthScore, errorRate) switch
        {
            ( >= 85, < 0.01) => "Excellent",
            ( >= 70, < 0.03) => "High Efficiency",
            ( >= 50, < 0.05) => "Medium Efficiency",
            _ => "Needs Optimization"
        };
    }

    private double CalculateAvailability(List<NodeModel> nodes)
    {
        if (!nodes.Any())
            return 100.0;

        // Tính availability dựa trên reliability của từng node
        double systemReliability = 1.0;

        foreach (var node in nodes)
        {
            var reliability = node.Metadata.Specs?.Reliability ?? 0.99;
            var instanceCount = node.Metadata.Props?.InstanceCount ?? 1;

            // Với nhiều instances, availability tăng (parallel redundancy)
            var nodeAvailability = 1.0 - Math.Pow(1.0 - reliability, instanceCount);

            // Các nodes nối tiếp nhau (series system)
            systemReliability *= nodeAvailability;
        }

        return systemReliability * 100.0;
    }

    private static SystemMetrics CreateEmptyMetrics()
    {
        return new SystemMetrics(
            0m,
            0.0,
            100,
            "No Data",
            100.0,
            new Dictionary<string, decimal>(),
            new List<string>()
        );
    }
}
