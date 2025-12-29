using SystemDesign.Application.DTOs;
using SystemDesign.Application.Interfaces;

namespace SystemDesign.Api.Endpoints;

/// <summary>
/// Extension methods để map Diagram endpoints
/// </summary>
public static class DiagramEndpoints
{
    public static IEndpointRouteBuilder MapDiagramEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/diagrams")
            .WithTags("Diagrams")
            .WithOpenApi();

        // POST /api/diagrams - Tạo diagram mới
        group.MapPost("/", async (CreateDiagramDto dto, IDiagramService service, CancellationToken ct) =>
        {
            var result = await service.CreateAsync(dto, ct);
            return result.IsSuccess
                ? Results.Created($"/api/diagrams/{result.Value!.Id}", result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("CreateDiagram")
        .WithSummary("Tạo diagram mới");

        // GET /api/diagrams - Lấy tất cả diagrams (với optional query params)
        group.MapGet("/", async (string? userId, string? search, IDiagramService service, CancellationToken ct) =>
        {
            Result<IEnumerable<DiagramDto>> result;
            
            if (!string.IsNullOrWhiteSpace(userId))
            {
                result = await service.GetByUserAsync(userId, ct);
            }
            else if (!string.IsNullOrWhiteSpace(search))
            {
                result = await service.SearchByNameAsync(search, ct);
            }
            else
            {
                result = await service.GetAllAsync(ct);
            }
            
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.BadRequest(new { error = result.Error });
        })
        .WithName("GetAllDiagrams")
        .WithSummary("Lấy diagrams (hỗ trợ filter theo userId hoặc search theo name)");

        // GET /api/diagrams/{id} - Lấy diagram theo ID
        group.MapGet("/{id:guid}", async (Guid id, IDiagramService service, CancellationToken ct) =>
        {
            var result = await service.GetByIdAsync(id, ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("GetDiagramById")
        .WithSummary("Lấy diagram theo ID");

        // PUT /api/diagrams/{id} - Cập nhật diagram
        group.MapPut("/{id:guid}", async (Guid id, UpdateDiagramDto dto, IDiagramService service, CancellationToken ct) =>
        {
            var result = await service.UpdateAsync(id, dto, ct);
            return result.IsSuccess
                ? Results.Ok(result.Value)
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("UpdateDiagram")
        .WithSummary("Cập nhật diagram");

        // DELETE /api/diagrams/{id} - Xóa diagram (soft delete)
        group.MapDelete("/{id:guid}", async (Guid id, IDiagramService service, CancellationToken ct) =>
        {
            var result = await service.DeleteAsync(id, ct);
            return result.IsSuccess
                ? Results.NoContent()
                : Results.NotFound(new { error = result.Error });
        })
        .WithName("DeleteDiagram")
        .WithSummary("Xóa diagram (soft delete)");

        return app;
    }
}
