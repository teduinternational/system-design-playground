# Entity Configurations

Folder này chứa các Entity Type Configuration classes cho Entity Framework Core.

## Quy tắc
- Mỗi entity sẽ có một file configuration riêng
- Sử dụng Fluent API để cấu hình entities
- Implement interface `IEntityTypeConfiguration<TEntity>`

## Ví dụ

```csharp
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Infrastructure.Persistence.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(p => p.Price)
            .HasPrecision(18, 2);
    }
}
```
