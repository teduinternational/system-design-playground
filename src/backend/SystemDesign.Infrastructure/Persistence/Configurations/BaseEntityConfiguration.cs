using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace SystemDesign.Infrastructure.Persistence.Configurations;

/// <summary>
/// Base configuration class cho tất cả entities
/// Có thể override để thêm các cấu hình chung
/// </summary>
public abstract class BaseEntityConfiguration<TEntity> : IEntityTypeConfiguration<TEntity>
    where TEntity : class
{
    public virtual void Configure(EntityTypeBuilder<TEntity> builder)
    {
        // Các cấu hình chung cho tất cả entities có thể được thêm vào đây
        // Ví dụ: Auditable fields, Soft delete, etc.
    }
}
