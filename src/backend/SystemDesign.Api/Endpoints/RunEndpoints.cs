using MediatR;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Features.Runs.Commands;
using SystemDesign.Application.Features.Runs.Queries;

namespace SystemDesign.Api.Endpoints;

/// <summary>
/// Extension methods để map Run endpoints
/// </summary>
public static class RunEndpoints
{
    public static IEndpointRouteBuilder MapRunEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/runs")
            .WithTags("Runs");

        // POST /api/runs - Tạo một run mới (bắt đầu simulation)
        group.MapPost("/", async (CreateRunDto dto, IMediator mediator, CancellationToken ct) =>
        {
            var command = new CreateRunCommand(dto.ScenarioId, dto.RunName, dto.EnvironmentParams);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Created($"/api/runs/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CreateRun")
        .WithSummary("Tạo run mới để bắt đầu simulation");

        // GET /api/scenarios/{scenarioId}/runs - Lấy lịch sử runs của một scenario
        app.MapGet("/api/scenarios/{scenarioId:guid}/runs", 
            async (Guid scenarioId, IMediator mediator, CancellationToken ct) =>
        {
            var query = new GetRunsByScenarioQuery(scenarioId);
            var result = await mediator.Send(query, ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetRunsByScenario")
        .WithSummary("Lấy lịch sử các lần simulation của một scenario");

        // GET /api/runs/{id} - Lấy run theo ID
        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator, CancellationToken ct) =>
        {
            var query = new GetRunByIdQuery(id);
            var result = await mediator.Send(query, ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("GetRunById")
        .WithSummary("Lấy run theo ID");

        // PATCH /api/runs/{id}/status - Cập nhật trạng thái của run
        group.MapPatch("/{id:guid}/status", 
            async (Guid id, UpdateRunStatusDto dto, IMediator mediator, CancellationToken ct) =>
        {
            var command = new UpdateRunStatusCommand(
                id,
                dto.Status,
                dto.AverageLatencyMs,
                dto.ThroughputRps,
                dto.SuccessfulRequests,
                dto.FailedRequests,
                dto.ErrorRate,
                dto.ResultJson,
                dto.ErrorMessage
            );

            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("UpdateRunStatus")
        .WithSummary("Cập nhật trạng thái và metrics của run");

        return app;
    }
}
