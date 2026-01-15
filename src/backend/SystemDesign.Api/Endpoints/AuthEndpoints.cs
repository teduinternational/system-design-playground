using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using SystemDesign.Api.Auth;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Api.Endpoints;

/// <summary>
/// Auth endpoints - Login, Token generation with ASP.NET Core Identity
/// </summary>
public static class AuthEndpoints
{
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Authentication");

        // POST /api/auth/login - Authenticate user with database
        group.MapPost("/login", async (
            [FromBody] LoginRequest request, 
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            JwtTokenService jwtService) =>
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return Results.BadRequest(new { Message = "Email and password are required" });
            }

            // Find user by email
            var user = await userManager.FindByEmailAsync(request.Email);
            if (user == null || !user.IsActive)
            {
                return Results.Unauthorized();
            }

            // Verify password
            var result = await signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
            
            if (!result.Succeeded)
            {
                if (result.IsLockedOut)
                {
                    return Results.BadRequest(new { Message = "Account is locked. Please try again later." });
                }
                
                return Results.Unauthorized();
            }

            // Get user roles
            var roles = await userManager.GetRolesAsync(user);

            // Generate JWT token
            var token = jwtService.GenerateToken(
                userId: user.Id,
                email: user.Email!,
                roles: roles.ToArray()
            );

            return Results.Ok(new LoginResponse
            {
                Token = token,
                Email = user.Email!,
                FullName = user.FullName,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            });
        })
        .WithName("Login")
        .WithSummary("Authenticate user with email and password")
        .Produces<LoginResponse>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status400BadRequest);

        // GET /api/auth/me - Get current user info (protected endpoint)
        group.MapGet("/me", [Authorize] async (
            HttpContext context,
            UserManager<ApplicationUser> userManager) =>
        {
            var userId = context.User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            
            if (string.IsNullOrEmpty(userId))
            {
                return Results.Unauthorized();
            }

            var user = await userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return Results.NotFound(new { Message = "User not found" });
            }

            var roles = await userManager.GetRolesAsync(user);

            return Results.Ok(new
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = user.FullName,
                AvatarUrl = user.AvatarUrl,
                IsActive = user.IsActive,
                Roles = roles,
                CreatedAt = user.CreatedAt,
                Timestamp = DateTime.UtcNow
            });
        })
        .WithName("GetCurrentUser")
        .WithSummary("Get current authenticated user info from database")
        .RequireAuthorization()
        .Produces<object>(StatusCodes.Status200OK)
        .Produces(StatusCodes.Status401Unauthorized)
        .Produces(StatusCodes.Status404NotFound);

        // POST /api/auth/validate - Validate token
        group.MapPost("/validate", ([FromBody] ValidateTokenRequest request, JwtTokenService jwtService) =>
        {
            if (string.IsNullOrEmpty(request.Token))
            {
                return Results.BadRequest(new { Message = "Token is required" });
            }

            var principal = jwtService.ValidateToken(request.Token);
            
            if (principal == null)
            {
                return Results.Ok(new { IsValid = false, Message = "Token is invalid or expired" });
            }

            var userId = principal.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
            var email = principal.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email)?.Value;

            return Results.Ok(new
            {
                IsValid = true,
                UserId = userId,
                Email = email,
                Message = "Token is valid"
            });
        })
        .WithName("ValidateToken")
        .WithSummary("Validate JWT token")
        .Produces<object>(StatusCodes.Status200OK);
    }
}

// DTOs
public record LoginRequest(string Email, string Password);

public record LoginResponse
{
    public required string Token { get; init; }
    public required string Email { get; init; }
    public string? FullName { get; init; }
    public DateTime ExpiresAt { get; init; }
}

public record ValidateTokenRequest(string Token);
