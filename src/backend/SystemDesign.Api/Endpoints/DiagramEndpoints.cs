using MediatR;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Features.Diagrams.Commands;
using SystemDesign.Application.Features.Diagrams.Queries;

namespace SystemDesign.Api.Endpoints;

/// <summary>
/// Extension methods để map Diagram endpoints
/// </summary>
public static class DiagramEndpoints
{
    public static IEndpointRouteBuilder MapDiagramEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/diagrams")
            .WithTags("Diagrams");

        // POST /api/diagrams - Tạo diagram mới
        group.MapPost("/", async (CreateDiagramDto dto, IMediator mediator, CancellationToken ct) =>
        {
            var command = new CreateDiagramCommand(dto.Name, dto.Description, dto.JsonData, dto.CreatedBy);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Created($"/api/diagrams/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CreateDiagram")
        .WithSummary("Tạo diagram mới");

        // GET /api/diagrams - Lấy tất cả diagrams (với optional query params)
        group.MapGet("/", async (string? userId, string? search, IMediator mediator, CancellationToken ct) =>
        {
            if (!string.IsNullOrWhiteSpace(userId))
            {
                var query = new GetDiagramsByUserQuery(userId);
                var result = await mediator.Send(query, ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(new { error = result.Error });
            }
            else if (!string.IsNullOrWhiteSpace(search))
            {
                var query = new SearchDiagramsByNameQuery(search);
                var result = await mediator.Send(query, ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(new { error = result.Error });
            }
            else
            {
                var query = new GetAllDiagramsQuery();
                var result = await mediator.Send(query, ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(new { error = result.Error });
            }
        })
        .WithName("GetAllDiagrams")
        .WithSummary("Lấy diagrams (hỗ trợ filter theo userId hoặc search theo name)");

        // GET /api/diagrams/{id} - Lấy diagram theo ID
        group.MapGet("/{id:guid}", async (Guid id, IMediator mediator, CancellationToken ct) =>
        {
            var query = new GetDiagramByIdQuery(id);
            var result = await mediator.Send(query, ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("GetDiagramById")
        .WithSummary("Lấy diagram theo ID");

        // PUT /api/diagrams/{id} - Cập nhật diagram
        group.MapPut("/{id:guid}", async (Guid id, UpdateDiagramDto dto, IMediator mediator, CancellationToken ct) =>
        {
            var command = new UpdateDiagramCommand(id, dto.Name, dto.Description, dto.JsonData);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("UpdateDiagram")
        .WithSummary("Cập nhật diagram");

        // DELETE /api/diagrams/{id} - Xóa diagram (soft delete)
        group.MapDelete("/{id:guid}", async (Guid id, IMediator mediator, CancellationToken ct) =>
        {
            var command = new DeleteDiagramCommand(id);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.NoContent()
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("DeleteDiagram")
        .WithSummary("Xóa diagram (soft delete)");

        return app;
    }
}
