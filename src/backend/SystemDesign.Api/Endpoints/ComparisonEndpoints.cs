using SystemDesign.Application.DTOs;
using SystemDesign.Application.Services;

namespace SystemDesign.Api.Endpoints;

/// <summary>
/// Endpoints để so sánh scenarios
/// </summary>
public static class ComparisonEndpoints
{
    public static IEndpointRouteBuilder MapComparisonEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/comparison")
            .WithTags("Comparison");

        // POST /api/comparison/compare - So sánh 2 scenarios
        group.MapPost("/compare", async (
            CompareScenarioRequest request,
            IComparisonService comparisonService,
            CancellationToken ct) =>
        {
            if (request.ScenarioIds.Count != 2)
            {
                return Results.BadRequest(new { error = "Exactly 2 scenario IDs are required for comparison" });
            }

            try
            {
                var result = await comparisonService.CompareScenarios(
                    request.ScenarioIds[0],
                    request.ScenarioIds[1],
                    ct);

                return Results.Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return Results.NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                return Results.Problem(
                    detail: ex.Message,
                    statusCode: 500,
                    title: "Comparison failed");
            }
        })
        .WithName("CompareScenarios")
        .WithSummary("So sánh performance metrics của 2 scenarios")
        .WithDescription("Chạy simulation cho 2 scenarios và trả về comparison metrics: Latency, Throughput, Cost");

        return app;
    }
}
