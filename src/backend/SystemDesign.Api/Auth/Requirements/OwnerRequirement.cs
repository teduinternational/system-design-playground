using Microsoft.AspNetCore.Authorization;

namespace SystemDesign.Api.Auth.Requirements;

/// <summary>
/// Requirement để kiểm tra user có phải Owner của resource không
/// </summary>
public class OwnerRequirement : IAuthorizationRequirement
{
    public OwnerRequirement()
    {
    }
}
