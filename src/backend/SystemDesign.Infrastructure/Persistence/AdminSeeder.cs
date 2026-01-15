using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Infrastructure.Persistence;

/// <summary>
/// Seeds initial admin user and roles into the database
/// </summary>
public static class AdminSeeder
{
    private const string AdminRole = "Admin";
    private const string UserRole = "User";
    
    private const string AdminEmail = "admin@playground.tedu.com.vn";
    private const string AdminPassword = "Admin@123456";
    private const string AdminFullName = "System Administrator";

    /// <summary>
    /// Initialize roles and admin user. Called automatically on app startup
    /// </summary>
    public static async Task InitializeAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<ApplicationDbContext>>();

        try
        {
            // Create roles if they don't exist
            await EnsureRoleAsync(roleManager, AdminRole);
            await EnsureRoleAsync(roleManager, UserRole);
            
            // Create admin user if doesn't exist
            var adminUser = await userManager.FindByEmailAsync(AdminEmail);
            if (adminUser == null)
            {
                adminUser = new ApplicationUser
                {
                    UserName = AdminEmail,
                    Email = AdminEmail,
                    EmailConfirmed = true,
                    FullName = AdminFullName,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                var result = await userManager.CreateAsync(adminUser, AdminPassword);
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(adminUser, AdminRole);
                    logger.LogInformation("Admin user created successfully: {Email}", AdminEmail);
                }
                else
                {
                    var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                    logger.LogError("Failed to create admin user: {Errors}", errors);
                }
            }
            else
            {
                logger.LogInformation("Admin user already exists: {Email}", AdminEmail);
                
                // Ensure admin has Admin role
                if (!await userManager.IsInRoleAsync(adminUser, AdminRole))
                {
                    await userManager.AddToRoleAsync(adminUser, AdminRole);
                    logger.LogInformation("Admin role assigned to existing user: {Email}", AdminEmail);
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An error occurred while seeding admin user");
        }
    }

    private static async Task EnsureRoleAsync(RoleManager<IdentityRole> roleManager, string roleName)
    {
        if (!await roleManager.RoleExistsAsync(roleName))
        {
            await roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }
}
