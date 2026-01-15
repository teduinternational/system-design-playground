using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SystemDesign.Api.Auth.Handlers;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Api.Endpoints;

/// <summary>
/// Demo endpoints cho Resource-based Authorization
/// </summary>
public static class ResourceAuthEndpoints
{
    public static void MapResourceAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/resources")
            .WithTags("Resource Authorization")
            .RequireAuthorization();

        // GET /api/resources/{id} - Get resource (Owner Only)
        group.MapGet("/{id}", async (
            string id,
            HttpContext context,
            IAuthorizationService authService) =>
        {
            // Mock resource - trong thực tế lấy từ database
            var resource = new DiagramResource
            {
                Id = id,
                Name = "My Architecture Diagram",
                OwnerId = context.User.FindFirst("sub")?.Value ?? "user-123",
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            };

            // Kiểm tra authorization với OwnerOnly policy
            var authResult = await authService.AuthorizeAsync(
                context.User, 
                resource, 
                "OwnerOnly");

            if (!authResult.Succeeded)
            {
                return Results.Forbid(); // 403 Forbidden
            }

            return Results.Ok(resource);
        })
        .WithName("GetResource")
        .WithSummary("Get resource by ID (Owner Only)")
        .Produces<DiagramResource>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status403Forbidden);

        // DELETE /api/resources/{id} - Delete resource (Owner Only)
        group.MapDelete("/{id}", async (
            string id,
            HttpContext context,
            IAuthorizationService authService) =>
        {
            // Mock resource
            var resource = new DiagramResource
            {
                Id = id,
                Name = "My Architecture Diagram",
                OwnerId = context.User.FindFirst("sub")?.Value ?? "user-123",
                CreatedAt = DateTime.UtcNow.AddDays(-7)
            };

            // Kiểm tra authorization
            var authResult = await authService.AuthorizeAsync(
                context.User,
                resource,
                "OwnerOnly");

            if (!authResult.Succeeded)
            {
                return Results.Problem(
                    title: "Forbidden",
                    detail: "You do not have permission to delete this resource.",
                    statusCode: StatusCodes.Status403Forbidden
                );
            }

            // Delete logic here
            return Results.Ok(new { Message = $"Resource {id} deleted successfully" });
        })
        .WithName("DeleteResource")
        .WithSummary("Delete resource by ID (Owner Only)")
        .Produces<object>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status403Forbidden);

        // GET /api/resources/admin-only - Admin only endpoint
        group.MapGet("/admin-only", [Authorize(Policy = "AdminOnly")] () =>
        {
            return Results.Ok(new { Message = "This is admin-only data" });
        })
        .WithName("GetAdminData")
        .WithSummary("Get admin data (Admin Only)")
        .RequireAuthorization("AdminOnly");

        // GET /api/resources/public - Any authenticated user
        group.MapGet("/public", [Authorize(Policy = "AuthenticatedUser")] () =>
        {
            return Results.Ok(new { Message = "This is accessible by any authenticated user" });
        })
        .WithName("GetPublicData")
        .WithSummary("Get public data (Any authenticated user)");
    }
}

/// <summary>
/// Example resource implementing IOwnable
/// </summary>
public class DiagramResource : IOwnable
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required string OwnerId { get; init; }
    public DateTime CreatedAt { get; init; }
}
