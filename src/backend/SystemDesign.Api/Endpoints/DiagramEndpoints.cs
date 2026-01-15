using Microsoft.AspNetCore.Authorization;
using MediatR;
using SystemDesign.Api.Extensions;
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
        group.MapPost("/", [Authorize] async (CreateDiagramDto dto, HttpContext context, IMediator mediator, CancellationToken ct) =>
        {
            // Lấy userId từ JWT claims
            var userId = context.User.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            var command = new CreateDiagramCommand(dto.Name, dto.Description, dto.JsonData, userId);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Created($"/api/diagrams/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CreateDiagram")
        .WithSummary("Tạo diagram mới")
        .RequireAuthorization();

        // GET /api/diagrams - Lấy diagrams của user đang login (với optional search)
        group.MapGet("/", [Authorize] async (string? search, HttpContext context, IMediator mediator, CancellationToken ct) =>
        {
            // Lấy userId từ JWT claims
            var userId = context.User.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            // Luôn filter theo userId của user đang login
            if (!string.IsNullOrWhiteSpace(search))
            {
                var query = new SearchDiagramsByNameQuery(search);
                var result = await mediator.Send(query, ct);

                // Filter kết quả theo ownerId
                if (result.IsSuccess && result.Value != null)
                {
                    var filteredDiagrams = result.Value.Where(d => d.OwnerId == userId).ToList();
                    return Results.Ok(filteredDiagrams);
                }

                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(new { error = result.Error });
            }
            else
            {
                var query = new GetDiagramsByUserQuery(userId);
                var result = await mediator.Send(query, ct);
                return result.IsSuccess
                    ? Results.Ok(result.Value)
                    : Results.BadRequest(new { error = result.Error });
            }
        })
        .WithName("GetAllDiagrams")
        .WithSummary("Lấy diagrams của user đang login (với optional search theo name)")
        .RequireAuthorization();

        // GET /api/diagrams/{id} - Lấy diagram theo ID (kiểm tra ownership)
        group.MapGet("/{id:guid}", [Authorize] async (Guid id, HttpContext context, IMediator mediator, CancellationToken ct) =>
        {
            var userId = context.User.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            var query = new GetDiagramByIdQuery(id);
            var result = await mediator.Send(query, ct);

            if (!result.IsSuccess)
            {
                return Results.NotFound(new { error = result.Error });
            }

            // Kiểm tra ownership
            if (result.Value?.OwnerId != userId)
            {
                return Results.Forbid();
            }

            return Results.Ok(result.Value);
        })
        .WithName("GetDiagramById")
        .WithSummary("Lấy diagram theo ID (chỉ owner)")
        .RequireAuthorization();

        // PUT /api/diagrams/{id} - Cập nhật diagram (kiểm tra ownership)
        group.MapPut("/{id:guid}", [Authorize] async (Guid id, UpdateDiagramDto dto, HttpContext context, IMediator mediator, CancellationToken ct) =>
        {
            var userId = context.User.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            // Kiểm tra ownership trước khi update
            var getQuery = new GetDiagramByIdQuery(id);
            var getResult = await mediator.Send(getQuery, ct);

            if (!getResult.IsSuccess)
            {
                return Results.NotFound(new { error = getResult.Error });
            }

            if (getResult.Value?.OwnerId != userId)
            {
                return Results.Forbid();
            }

            // Thực hiện update
            var command = new UpdateDiagramCommand(id, dto.Name, dto.Description, dto.JsonData);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("UpdateDiagram")
        .WithSummary("Cập nhật diagram (chỉ owner)")
        .RequireAuthorization();

        // DELETE /api/diagrams/{id} - Xóa diagram (soft delete, kiểm tra ownership)
        group.MapDelete("/{id:guid}", [Authorize] async (Guid id, HttpContext context, IMediator mediator, CancellationToken ct) =>
        {
            var userId = context.User.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            // Kiểm tra ownership trước khi delete
            var getQuery = new GetDiagramByIdQuery(id);
            var getResult = await mediator.Send(getQuery, ct);

            if (!getResult.IsSuccess)
            {
                return Results.NotFound(new { error = getResult.Error });
            }

            if (getResult.Value?.OwnerId != userId)
            {
                return Results.Forbid();
            }

            // Thực hiện delete
            var command = new DeleteDiagramCommand(id);
            var result = await mediator.Send(command, ct);
            return result.IsSuccess
                ? Results.NoContent()
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("DeleteDiagram")
        .WithSummary("Xóa diagram (soft delete, chỉ owner)")
        .RequireAuthorization();

        return app;
    }
}
