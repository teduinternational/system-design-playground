using Microsoft.EntityFrameworkCore;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Infrastructure.Persistence;

public sealed class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
    : DbContext(options)
{
    public DbSet<Diagram> Diagrams => Set<Diagram>();
    public DbSet<Scenario> Scenarios => Set<Scenario>();
    public DbSet<Run> Runs => Set<Run>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Áp dụng tất cả configurations từ assembly hiện tại
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);

        // Cấu hình thêm nếu cần (logging, lazy loading, etc.)
        optionsBuilder.EnableSensitiveDataLogging(false);
        optionsBuilder.EnableDetailedErrors(false);
    }
}
