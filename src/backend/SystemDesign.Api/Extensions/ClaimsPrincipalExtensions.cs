using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace SystemDesign.Api.Extensions;

/// <summary>
/// Extension methods cho ClaimsPrincipal
/// </summary>
public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// Lấy User ID từ JWT claims
    /// Thử lấy từ "sub" claim (JwtRegisteredClaimNames.Sub) hoặc NameIdentifier
    /// </summary>
    public static string? GetUserId(this ClaimsPrincipal user)
    {
        // Thử lấy từ "sub" claim (standard JWT claim)
        var userId = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        
        // Fallback: Thử lấy từ NameIdentifier nếu không có "sub"
        if (string.IsNullOrEmpty(userId))
        {
            userId = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        }
        
        return userId;
    }

    /// <summary>
    /// Lấy Email từ JWT claims
    /// </summary>
    public static string? GetUserEmail(this ClaimsPrincipal user)
    {
        return user.FindFirst(JwtRegisteredClaimNames.Email)?.Value 
            ?? user.FindFirst(ClaimTypes.Email)?.Value;
    }

    /// <summary>
    /// Lấy danh sách Roles từ JWT claims
    /// </summary>
    public static IEnumerable<string> GetUserRoles(this ClaimsPrincipal user)
    {
        return user.FindAll(ClaimTypes.Role).Select(c => c.Value);
    }

    /// <summary>
    /// Kiểm tra user có role cụ thể hay không
    /// </summary>
    public static bool HasRole(this ClaimsPrincipal user, string role)
    {
        return user.IsInRole(role);
    }
}
