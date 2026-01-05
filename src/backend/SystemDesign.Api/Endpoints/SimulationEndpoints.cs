using SystemDesign.Application.Services;
using SystemDesign.Domain.Models;

namespace SystemDesign.Api.Endpoints;

/// <summary>
/// Extension methods để map Simulation endpoints
/// </summary>
public static class SimulationEndpoints
{
    public static IEndpointRouteBuilder MapSimulationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/simulation")
            .WithTags("Simulation");

        // POST /api/simulation/longest-paths - Tính longest paths từ tất cả entry points
        group.MapPost("/longest-paths", async (
            SimulationRequest request,
            ISimulationEngine simulationEngine,
            CancellationToken ct) =>
        {
            var results = await simulationEngine.CalculateLongestPathsAsync(request, ct);
            return Results.Ok(new
            {
                totalPaths = results.Count,
                paths = results.Select(r => new
                {
                    entryNode = r.EntryNodeId,
                    endNode = r.EndNodeId,
                    path = r.Path,
                    totalLatencyMs = r.TotalLatencyMs,
                    pathLength = r.PathLength,
                    summary = r.Summary
                })
            });
        })
        .WithName("CalculateLongestPaths")
        .WithSummary("Tính toán longest paths và total latency từ tất cả entry points");

        // POST /api/simulation/longest-path/{nodeId} - Tính longest path từ một node cụ thể
        group.MapPost("/longest-path/{nodeId}", async (
            string nodeId,
            SimulationRequest request,
            ISimulationEngine simulationEngine,
            CancellationToken ct) =>
        {
            var result = await simulationEngine.CalculateLongestPathFromNodeAsync(request, nodeId, ct);
            
            if (result == null)
                return Results.NotFound(new { error = $"Node {nodeId} not found or no valid path exists" });

            return Results.Ok(new
            {
                entryNode = result.EntryNodeId,
                endNode = result.EndNodeId,
                path = result.Path,
                totalLatencyMs = result.TotalLatencyMs,
                pathLength = result.PathLength,
                summary = result.Summary
            });
        })
        .WithName("CalculateLongestPathFromNode")
        .WithSummary("Tính toán longest path và total latency từ một node cụ thể");

        // POST /api/simulation/analyze - Phân tích chi tiết performance
        group.MapPost("/analyze", async (
            SimulationRequest request,
            ISimulationEngine simulationEngine,
            CancellationToken ct) =>
        {
            var results = await simulationEngine.CalculateLongestPathsAsync(request, ct);
            
            if (results.Count == 0)
                return Results.Ok(new { message = "No valid paths found in the system" });

            // Tìm critical path (path với latency cao nhất)
            var criticalPath = results.MaxBy(r => r.TotalLatencyMs);
            var avgLatency = results.Average(r => r.TotalLatencyMs);
            var totalNodes = request.Nodes.Count;
            var totalEdges = request.Edges.Count;

            return Results.Ok(new
            {
                systemOverview = new
                {
                    totalNodes,
                    totalEdges,
                    entryPointsCount = results.Count
                },
                criticalPath = new
                {
                    from = criticalPath!.EntryNodeId,
                    to = criticalPath.EndNodeId,
                    totalLatencyMs = criticalPath.TotalLatencyMs,
                    path = criticalPath.Path,
                    pathLength = criticalPath.PathLength
                },
                statistics = new
                {
                    averagePathLatencyMs = avgLatency,
                    maxPathLatencyMs = results.Max(r => r.TotalLatencyMs),
                    minPathLatencyMs = results.Min(r => r.TotalLatencyMs),
                    totalPaths = results.Count
                },
                allPaths = results.Select(r => new
                {
                    entryNode = r.EntryNodeId,
                    endNode = r.EndNodeId,
                    latencyMs = r.TotalLatencyMs,
                    nodeCount = r.PathLength
                })
            });
        })
        .WithName("AnalyzeSystemPerformance")
        .WithSummary("Phân tích chi tiết performance của system architecture");

        // POST /api/simulation/percentiles/{nodeId} - Chạy 1000 simulations với jitter và queuing delay
        group.MapPost("/percentiles/{nodeId}", async (
            string nodeId,
            SimulationRequest request,
            ISimulationEngine simulationEngine,
            CancellationToken ct) =>
        {
            var result = await simulationEngine.SimulateWithPercentilesAsync(request, nodeId, ct);
            
            return Results.Ok(new
            {
                entryNodeId = result.EntryNodeId,
                simulationCount = result.SimulationCount,
                p50LatencyMs = result.P50LatencyMs,
                p95LatencyMs = result.P95LatencyMs,
                minLatencyMs = result.MinLatencyMs,
                maxLatencyMs = result.MaxLatencyMs,
                avgLatencyMs = result.AvgLatencyMs,
                overloadedNodes = result.OverloadedNodes?.Select(n => new
                {
                    nodeId = n.NodeId,
                    capacity = n.Capacity,
                    actualLoad = n.ActualLoad,
                    avgQueueingDelayMs = n.AvgQueueingDelayMs,
                    loadFactor = n.LoadFactor
                })
            });
        })
        .WithName("SimulateWithPercentiles")
        .WithSummary("Chạy 1000 simulations với random jitter và queuing delay, tính toán P50, P95");

        return app;
    }
}
