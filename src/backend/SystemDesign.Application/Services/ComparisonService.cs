using System.Text.Json;
using SystemDesign.Application.DTOs;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;
using SystemDesign.Domain.Models;

namespace SystemDesign.Application.Services;

/// <summary>
/// Service implementation để so sánh scenarios
/// </summary>
public class ComparisonService(
    IRepository<Scenario> repository,
    ISimulationEngine simulationEngine) : IComparisonService
{
    public async Task<ComparisonResult> CompareScenarios(
        Guid scenario1Id,
        Guid scenario2Id,
        CancellationToken ct = default)
    {
        // Load scenarios from repository
        var scenario1 = await repository.GetByIdAsync(scenario1Id, ct);
        var scenario2 = await repository.GetByIdAsync(scenario2Id, ct);

        if (scenario1 == null)
            throw new InvalidOperationException($"Scenario {scenario1Id} not found");
        if (scenario2 == null)
            throw new InvalidOperationException($"Scenario {scenario2Id} not found");

        // Parse content JSON as DiagramContent
        var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
        var diagram1 = JsonSerializer.Deserialize<DiagramContent>(scenario1.ContentJson, options);
        var diagram2 = JsonSerializer.Deserialize<DiagramContent>(scenario2.ContentJson, options);

        if (diagram1 == null || diagram2 == null)
            throw new InvalidOperationException("Failed to deserialize scenario content");

        // Create SimulationRequest directly from DiagramContent (no mapping needed)
        var request1 = new SimulationRequest
        {
            Nodes = diagram1.Nodes,
            Edges = diagram1.Edges,
            ConcurrentRequests = 1
        };

        var request2 = new SimulationRequest
        {
            Nodes = diagram2.Nodes,
            Edges = diagram2.Edges,
            ConcurrentRequests = 1
        };

        // Run simulations using CalculateLongestPathsAsync
        var results1 = await simulationEngine.CalculateLongestPathsAsync(request1, ct);
        var results2 = await simulationEngine.CalculateLongestPathsAsync(request2, ct);

        if (results1.Count == 0 || results2.Count == 0)
            throw new InvalidOperationException("No valid paths found in one or both scenarios");

        // Find critical path (highest latency) for each scenario
        var criticalPath1 = results1.MaxBy(r => r.TotalLatencyMs)!;
        var criticalPath2 = results2.MaxBy(r => r.TotalLatencyMs)!;

        // Calculate metrics
        var metrics1 = new ScenarioMetrics(
            scenario1.Id,
            scenario1.Name,
            criticalPath1.TotalLatencyMs,
            CalculateThroughput(request1),
            EstimateCost(request1)
        );

        var metrics2 = new ScenarioMetrics(
            scenario2.Id,
            scenario2.Name,
            criticalPath2.TotalLatencyMs,
            CalculateThroughput(request2),
            EstimateCost(request2)
        );

        // Calculate differences
        var latencyDiff = metrics2.TotalLatencyMs - metrics1.TotalLatencyMs;
        var latencyPercent = metrics1.TotalLatencyMs > 0
            ? (latencyDiff / metrics1.TotalLatencyMs) * 100
            : 0;

        var throughputDiff = metrics2.ThroughputRps - metrics1.ThroughputRps;
        var throughputPercent = metrics1.ThroughputRps > 0
            ? (throughputDiff / metrics1.ThroughputRps) * 100
            : 0;

        var costDiff = metrics2.EstimatedCostUsd - metrics1.EstimatedCostUsd;
        var costPercent = metrics1.EstimatedCostUsd > 0
            ? (costDiff / metrics1.EstimatedCostUsd) * 100
            : 0;

        var differences = new ComparisonDifferences(
            latencyDiff,
            latencyPercent,
            throughputDiff,
            throughputPercent,
            costDiff,
            costPercent
        );

        return new ComparisonResult(metrics1, metrics2, differences);
    }

    private double CalculateThroughput(SimulationRequest request)
    {
        // Simple heuristic: base throughput on entry point capacities
        var entryNodes = request.Nodes
            .Where(n => n.Metadata.Category.Equals("EntryPoint", StringComparison.OrdinalIgnoreCase) ||
                       n.Metadata.Category.Equals("Entry Point", StringComparison.OrdinalIgnoreCase))
            .ToList();
        
        if (entryNodes.Count == 0)
            return 0;

        // Sum capacities (MaxThroughput) of all entry points
        var totalCapacity = entryNodes.Sum(n => n.Metadata.Specs.MaxThroughput);
        return totalCapacity;
    }

    private double EstimateCost(SimulationRequest request)
    {
        // Rough cost estimation based on node types and counts
        // This is a placeholder - in real scenario, you'd have proper cost models
        double totalCost = 0;

        foreach (var node in request.Nodes)
        {
            var category = node.Metadata.Category.Replace(" ", "");
            var baseCost = category switch
            {
                "Storage" => 50.0,  // $50/month
                "Middleware" => 30.0,
                "TrafficManager" => 20.0,
                "Compute" => 40.0,
                "EntryPoint" => 20.0,
                _ => 35.0
            };

            // Multiply by capacity factor
            var capacityFactor = node.Metadata.Specs.MaxThroughput / 1000.0;
            totalCost += baseCost * capacityFactor;
        }

        return totalCost;
    }
}
