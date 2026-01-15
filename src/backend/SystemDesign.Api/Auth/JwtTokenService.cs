using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace SystemDesign.Api.Auth;

/// <summary>
/// Service để tạo và validate JWT tokens
/// </summary>
public class JwtTokenService(IConfiguration configuration)
{
    /// <summary>
    /// Generate JWT token cho user
    /// </summary>
    public string GenerateToken(string userId, string email, IEnumerable<string>? roles = null)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey missing");
        var issuer = jwtSettings["Issuer"] ?? throw new InvalidOperationException("JWT Issuer missing");
        var audience = jwtSettings["Audience"] ?? throw new InvalidOperationException("JWT Audience missing");
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "60");

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId),
            new(JwtRegisteredClaimNames.Email, email),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        // Thêm roles vào claims
        if (roles != null)
        {
            claims.AddRange(roles.Select(role => new Claim(ClaimTypes.Role, role)));
        }

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Validate JWT token (trả về claims nếu valid)
    /// </summary>
    public ClaimsPrincipal? ValidateToken(string token)
    {
        var jwtSettings = configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey missing");
        var issuer = jwtSettings["Issuer"] ?? throw new InvalidOperationException("JWT Issuer missing");
        var audience = jwtSettings["Audience"] ?? throw new InvalidOperationException("JWT Audience missing");

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(secretKey);

        try
        {
            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = issuer,
                ValidateAudience = true,
                ValidAudience = audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);

            return principal;
        }
        catch
        {
            return null;
        }
    }

    /// <summary>
    /// Extract User ID từ token
    /// </summary>
    public string? GetUserIdFromToken(string token)
    {
        var principal = ValidateToken(token);
        return principal?.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
    }
}
