using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Api.Auth.Handlers;

/// <summary>
/// Handler để kiểm tra user có phải Owner của resource
/// Resource phải implement IOwnable interface
/// </summary>
public class OwnerAuthorizationHandler : AuthorizationHandler<Requirements.OwnerRequirement, IOwnable>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        Requirements.OwnerRequirement requirement,
        IOwnable resource)
    {
        // Lấy userId từ claims
        var userId = context.User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                  ?? context.User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userId))
        {
            return Task.CompletedTask; // Fail - không có userId
        }

        // Kiểm tra user có phải owner không
        if (resource.OwnerId == userId)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}