# Database Migrations Guide

## 📋 Tổng quan

Project sử dụng **Entity Framework Core** với **Code-First** approach. Migrations được tự động generate từ entities trong Domain layer.

## 🔧 Cấu hình

### ApplicationDbContextFactory
File [ApplicationDbContextFactory.cs](Persistence/ApplicationDbContextFactory.cs) cho phép EF Core tools tự động đọc connection string từ `appsettings.Development.json` khi chạy migrations.

```csharp
// Tự động đọc từ ../SystemDesign.Api/appsettings.Development.json
public ApplicationDbContext CreateDbContext(string[] args)
{
    var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "SystemDesign.Api");
    var configuration = new ConfigurationBuilder()
        .SetBasePath(basePath)
        .AddJsonFile("appsettings.json", optional: false)
        .AddJsonFile("appsettings.Development.json", optional: true)
        .Build();
    // ...
}
```

### Connection String
Connection string được định nghĩa trong [appsettings.Development.json](../SystemDesign.Api/appsettings.Development.json):

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SystemDesignPlayground;User Id=sa;Password=123654$;TrustServerCertificate=True;"
  }
}
```

## 📦 Entity Configurations

Mỗi entity có một configuration class riêng trong folder `Persistence/Configurations/`:

- **[DiagramConfiguration.cs](Persistence/Configurations/DiagramConfiguration.cs)** - Diagrams table config
- **[ScenarioConfiguration.cs](Persistence/Configurations/ScenarioConfiguration.cs)** - Scenarios table config  
- **[RunConfiguration.cs](Persistence/Configurations/RunConfiguration.cs)** - Runs table config

Các configs này định nghĩa:
- Table name và primary keys
- Column types, max lengths, required/optional
- Default values và SQL functions
- Foreign key relationships
- Indexes cho performance

## 🗃️ Database Schema

### Tables
```
Diagrams (Projects)
├── Id (PK)
├── Name, Description
├── JsonData (nvarchar(max))
├── Version, CreatedBy, UserId
└── CreatedAt, UpdatedAt, IsDeleted

Scenarios (Architecture versions)
├── Id (PK)
├── DiagramId (FK -> Diagrams)
├── ParentScenarioId (Self-reference)
├── Name, VersionTag, ChangeLog
├── ContentJson (nvarchar(max))
├── IsSnapshot
└── CreatedAt, UpdatedAt, IsDeleted

Runs (Simulation history)
├── Id (PK)
├── ScenarioId (FK -> Scenarios)
├── RunName, Status (enum)
├── StartedAt, CompletedAt, DurationMs
├── AverageLatencyMs, ThroughputRps
├── SuccessfulRequests, FailedRequests, ErrorRate
├── EnvironmentParams (JSON)
├── ResultJson (JSON)
├── ErrorMessage
└── CreatedAt, UpdatedAt, IsDeleted
```

### Relationships
- **Diagram → Scenarios** (1:N, Cascade delete)
- **Scenario → Runs** (1:N, Cascade delete)

### Indexes
- Primary keys (Clustered)
- Foreign keys
- IsDeleted (Soft delete filtering)
- CreatedAt (Sorting)
- Status (Runs filtering)

## 🚀 Commands

### 1. Tạo Migration mới
```bash
cd src/backend/SystemDesign.Infrastructure
dotnet ef migrations add <MigrationName> --output-dir Persistence/Migrations
```

Example:
```bash
dotnet ef migrations add AddUserEmailField --output-dir Persistence/Migrations
```

### 2. Apply Migrations (Update Database)
```bash
cd src/backend/SystemDesign.Infrastructure
dotnet ef database update
```

### 3. Rollback Migration
```bash
# Rollback to previous migration
dotnet ef database update <PreviousMigrationName>

# Rollback all migrations
dotnet ef database update 0
```

### 4. Remove Last Migration (chưa apply)
```bash
dotnet ef migrations remove
```

### 5. Generate SQL Script
```bash
# Generate SQL for all migrations
dotnet ef migrations script

# Generate SQL from specific migration
dotnet ef migrations script <FromMigration> <ToMigration>
```

### 6. List Migrations
```bash
dotnet ef migrations list
```

### 7. Drop Database (CAUTION!)
```bash
dotnet ef database drop --force
```

## 📝 Migration History

| Migration | Date | Description |
|-----------|------|-------------|
| InitialCreate | 2025-12-29 | Tạo tables Diagrams, Scenarios, Runs với basic structure |
| AddConfigurationsAndIndexes | 2025-12-29 | Thêm configurations, constraints, indexes |

## ⚡ Best Practices

### 1. Luôn test migrations trước khi deploy
```bash
# Tạo migration mới
dotnet ef migrations add TestMigration

# Review generated code
# Check: Persistence/Migrations/[timestamp]_TestMigration.cs

# Apply to local database
dotnet ef database update

# Test thoroughly

# If OK, commit to git
# If not OK, remove and fix
dotnet ef migrations remove
```

### 2. Naming Conventions
- **Add**: `AddUserEmailField`, `AddIndexOnDiagramName`
- **Update**: `UpdateScenarioTableStructure`
- **Remove**: `RemoveObsoleteColumn`
- **Rename**: `RenameUserFieldToCreatedBy`

### 3. Never modify applied migrations
❌ **Không** sửa migrations đã apply (đã chạy `dotnet ef database update`)  
✅ **Tạo** migration mới để fix

### 4. Always backup production database
```bash
# Before applying migrations to production
# 1. Backup database
# 2. Test on staging
# 3. Generate SQL script
dotnet ef migrations script --idempotent --output migration.sql
# 4. Review SQL
# 5. Apply manually or via deployment pipeline
```

## 🔍 Troubleshooting

### Issue: "Build failed" khi chạy migration
**Solution:** Build solution trước:
```bash
cd src/backend
dotnet build
cd SystemDesign.Infrastructure
dotnet ef migrations add YourMigration
```

### Issue: "No DbContext was found"
**Solution:** Đảm bảo `ApplicationDbContextFactory` tồn tại và đúng cấu hình.

### Issue: "Connection string not found"
**Solution:** Kiểm tra:
1. File `appsettings.Development.json` tồn tại trong `SystemDesign.Api`
2. Connection string có key `"DefaultConnection"`
3. Path trong `ApplicationDbContextFactory` đúng

### Issue: "Cannot connect to database"
**Solution:** Kiểm tra:
1. SQL Server đang chạy
2. Connection string đúng (Server, User, Password)
3. User có quyền tạo database

### Issue: Migration conflict (merge)
**Solution:**
```bash
# Remove conflicting migration
dotnet ef migrations remove

# Pull latest code
git pull

# Re-create migration
dotnet ef migrations add YourMigration
```

## 📚 Resources

- [EF Core Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [EF Core Design-time DbContext](https://learn.microsoft.com/en-us/ef/core/cli/dbcontext-creation)
- [Connection Strings](https://www.connectionstrings.com/sql-server/)
