using SystemDesign.Domain;
using SystemDesign.Domain.Models;

namespace SystemDesign.Api.Endpoints;

/// <summary>
/// Extension methods để map Metrics endpoints
/// </summary>
public static class MetricsEndpoints
{
    public static IEndpointRouteBuilder MapMetricsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/metrics")
            .WithTags("Metrics");

        // POST /api/metrics/calculate - Tính toán metrics cho diagram
        group.MapPost("/calculate", (DiagramContent diagramContent, IMetricsCalculatorService metricsService) =>
        {
            try
            {
                var metrics = metricsService.CalculateMetrics(diagramContent);
                return Results.Ok(metrics);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("CalculateMetrics")
        .WithSummary("Tính toán các chỉ số KPI cho diagram")
        .WithDescription("Tính toán Monthly Cost, Error Rate, Health Score, và Availability dựa trên cấu hình nodes");

        // POST /api/metrics/what-if - What-if Analysis
        group.MapPost("/what-if", (WhatIfRequest request, IMetricsCalculatorService metricsService) =>
        {
            try
            {
                var metrics = metricsService.CalculateWhatIfScenario(
                    request.DiagramContent,
                    request.NodeId,
                    request.NewInstanceCount
                );
                return Results.Ok(metrics);
            }
            catch (Exception ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
        })
        .WithName("WhatIfAnalysis")
        .WithSummary("Phân tích giả định khi thay đổi cấu hình")
        .WithDescription("Tính toán metrics khi thay đổi số lượng instances của một node");

        return app;
    }
}

/// <summary>
/// Request model cho What-if Analysis
/// </summary>
public record WhatIfRequest(
    DiagramContent DiagramContent,
    string NodeId,
    int NewInstanceCount
);
