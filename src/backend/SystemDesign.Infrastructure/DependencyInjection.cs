using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;
using SystemDesign.Infrastructure.Persistence;
using SystemDesign.Infrastructure.Services;

namespace SystemDesign.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // AI Service
        services.AddScoped<IAIService, AIService>();
        
        // ASP.NET Core Identity
        services.AddIdentity<ApplicationUser, IdentityRole>(options =>
        {
            // Password settings
            options.Password.RequireDigit = true;
            options.Password.RequireLowercase = true;
            options.Password.RequireUppercase = true;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 6;
            
            // User settings
            options.User.RequireUniqueEmail = true;
            
            // Lockout settings
            options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(5);
            options.Lockout.MaxFailedAccessAttempts = 5;
            options.Lockout.AllowedForNewUsers = true;
            
            // SignIn settings
            options.SignIn.RequireConfirmedEmail = false;
            options.SignIn.RequireConfirmedPhoneNumber = false;
        })
        .AddEntityFrameworkStores<ApplicationDbContext>()
        .AddDefaultTokenProviders();
        
        return services;
    }
}
