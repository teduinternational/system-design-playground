using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace SystemDesign.Infrastructure.Persistence.Interceptors;

/// <summary>
/// Interceptor để tự động cập nhật CreatedAt, UpdatedAt fields
/// Bỏ comment khi có base entity với auditable fields
/// </summary>
public sealed class AuditableEntityInterceptor : SaveChangesInterceptor
{
    public override InterceptionResult<int> SavingChanges(
        DbContextEventData eventData,
        InterceptionResult<int> result)
    {
        UpdateAuditableEntities(eventData.Context);
        return base.SavingChanges(eventData, result);
    }

    public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
        DbContextEventData eventData,
        InterceptionResult<int> result,
        CancellationToken cancellationToken = default)
    {
        UpdateAuditableEntities(eventData.Context);
        return base.SavingChangesAsync(eventData, result, cancellationToken);
    }

    private static void UpdateAuditableEntities(DbContext? context)
    {
        if (context is null) return;

        var now = DateTime.UtcNow;

        foreach (var entry in context.ChangeTracker.Entries())
        {
            // Ví dụ với IAuditableEntity interface
            // if (entry.Entity is IAuditableEntity auditableEntity)
            // {
            //     if (entry.State == EntityState.Added)
            //     {
            //         auditableEntity.CreatedAt = now;
            //     }
            //
            //     if (entry.State == EntityState.Modified)
            //     {
            //         auditableEntity.UpdatedAt = now;
            //     }
            // }
        }
    }
}
