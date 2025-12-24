# SystemDesign.Infrastructure

Infrastructure layer cho SystemDesign Playground project, chứa các implementation cụ thể cho database, external services, và các technical concerns khác.

## Cấu trúc

```
├── Persistence/
│   ├── ApplicationDbContext.cs          # Main DbContext
│   ├── DependencyInjection.cs           # Service registration
│   ├── Configurations/                   # Entity configurations
│   │   ├── BaseEntityConfiguration.cs
│   │   └── [EntityName]Configuration.cs
│   └── Interceptors/                     # EF Core interceptors
│       └── AuditableEntityInterceptor.cs
```

## Kết nối Database

Connection string được định nghĩa trong `appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SystemDesignPlayground;User Id=sa;Password=YourPassword;TrustServerCertificate=True;"
  }
}
```

## Sử dụng Migrations

### Tạo migration mới

```powershell
# Từ thư mục solution
dotnet ef migrations add InitialCreate --project SystemDesign.Infrastructure --startup-project SystemDesign.Api --output-dir Persistence/Migrations

# Hoặc với context name cụ thể
dotnet ef migrations add InitialCreate --context ApplicationDbContext --project SystemDesign.Infrastructure --startup-project SystemDesign.Api
```

### Cập nhật database

```powershell
# Áp dụng migrations
dotnet ef database update --project SystemDesign.Infrastructure --startup-project SystemDesign.Api

# Áp dụng migration cụ thể
dotnet ef database update MigrationName --project SystemDesign.Infrastructure --startup-project SystemDesign.Api
```

### Xóa migration cuối cùng

```powershell
dotnet ef migrations remove --project SystemDesign.Infrastructure --startup-project SystemDesign.Api
```

### Tạo script SQL

```powershell
# Tạo script cho tất cả migrations
dotnet ef migrations script --project SystemDesign.Infrastructure --startup-project SystemDesign.Api --output migrations.sql

# Tạo script từ migration A đến B
dotnet ef migrations script FromMigration ToMigration --project SystemDesign.Infrastructure --startup-project SystemDesign.Api
```

## Thêm Entity mới

1. **Tạo Entity trong Domain project**
```csharp
public class Product
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
}
```

2. **Tạo Configuration trong Infrastructure/Persistence/Configurations**
```csharp
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.ToTable("Products");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).HasMaxLength(200).IsRequired();
        builder.Property(p => p.Price).HasPrecision(18, 2);
    }
}
```

3. **Thêm DbSet vào ApplicationDbContext**
```csharp
public DbSet<Product> Products => Set<Product>();
```

4. **Tạo và áp dụng migration**
```powershell
dotnet ef migrations add AddProduct --project SystemDesign.Infrastructure --startup-project SystemDesign.Api
dotnet ef database update --project SystemDesign.Infrastructure --startup-project SystemDesign.Api
```

## Packages được sử dụng

- `Microsoft.EntityFrameworkCore` (10.0.0) - EF Core framework
- `Microsoft.EntityFrameworkCore.SqlServer` (10.0.0) - SQL Server provider
- `Microsoft.EntityFrameworkCore.Design` (10.0.0) - Design-time tools cho migrations

## Features

- ✅ SQL Server integration
- ✅ Entity configurations với Fluent API
- ✅ Automatic configuration discovery
- ✅ Connection resilience (retry on failure)
- ✅ Command timeout configuration
- ✅ Interceptors support (auditable entities)
- ✅ Migration support

## Best Practices

1. **Entity Configurations**: Mỗi entity có một file configuration riêng
2. **Migrations**: Luôn review migration trước khi apply lên production
3. **Connection String**: Sử dụng User Secrets hoặc Environment Variables cho production
4. **Transactions**: Sử dụng `DbContext.Database.BeginTransaction()` cho complex operations
5. **Performance**: Sử dụng `.AsNoTracking()` cho read-only queries
