using MediatR;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Features.Scenarios.Commands;
using SystemDesign.Application.Features.Scenarios.Queries;

namespace SystemDesign.Api.Endpoints;

/// <summary>
/// Extension methods để map Scenario endpoints
/// </summary>
public static class ScenarioEndpoints
{
    public static IEndpointRouteBuilder MapScenarioEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/scenarios")
            .WithTags("Scenarios");

        // POST /api/diagrams/{diagramId}/scenarios - Lưu scenario mới cho một diagram
        app.MapPost("/api/diagrams/{diagramId:guid}/scenarios", 
            async (Guid diagramId, CreateScenarioDto dto, IMediator mediator, CancellationToken ct) =>
        {
            var command = new SaveScenarioCommand(
                diagramId,
                dto.Name,
                dto.VersionTag,
                dto.ContentJson,
                dto.ChangeLog,
                dto.ParentScenarioId,
                dto.IsSnapshot
            );

            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Created($"/api/scenarios/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CreateScenario")
        .WithSummary("Tạo scenario mới cho một diagram");

        // GET /api/diagrams/{diagramId}/scenarios - Lấy tất cả scenarios của một diagram
        app.MapGet("/api/diagrams/{diagramId:guid}/scenarios", 
            async (Guid diagramId, IMediator mediator, CancellationToken ct) =>
        {
            var query = new GetScenariosByDiagramQuery(diagramId);
            var result = await mediator.Send(query, ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetScenariosByDiagram")
        .WithSummary("Lấy tất cả scenarios của một diagram");

        // GET /api/scenarios/{id} - Lấy scenario theo ID
        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator, CancellationToken ct) =>
        {
            var query = new GetScenarioByIdQuery(id);
            var result = await mediator.Send(query, ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("GetScenarioById")
        .WithSummary("Lấy scenario theo ID");

        // PUT /api/scenarios/{id} - Cập nhật scenario
        group.MapPut("/{id:guid}", async (Guid id, UpdateScenarioDto dto, IMediator mediator, CancellationToken ct) =>
        {
            var command = new UpdateScenarioCommand(id, dto.Name, dto.ContentJson, dto.ChangeLog);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("UpdateScenario")
        .WithSummary("Cập nhật scenario");

        return app;
    }
}
