# Database Migrations Guide

## Quick Commands

Tất cả commands được chạy từ folder solution (`src/backend/SystemDesignPlayground/`).

### Tạo Migration
```powershell
dotnet ef migrations add <MigrationName> `
  --project SystemDesign.Infrastructure `
  --startup-project SystemDesign.Api `
  --output-dir Persistence/Migrations
```

### Áp dụng Migration
```powershell
dotnet ef database update `
  --project SystemDesign.Infrastructure `
  --startup-project SystemDesign.Api
```

### Rollback Migration
```powershell
# Rollback về migration trước đó
dotnet ef database update <PreviousMigrationName> `
  --project SystemDesign.Infrastructure `
  --startup-project SystemDesign.Api
```

### Xóa Migration chưa apply
```powershell
dotnet ef migrations remove `
  --project SystemDesign.Infrastructure `
  --startup-project SystemDesign.Api
```

### List Migrations
```powershell
dotnet ef migrations list `
  --project SystemDesign.Infrastructure `
  --startup-project SystemDesign.Api
```

### Generate SQL Script
```powershell
# Tạo script cho tất cả migrations
dotnet ef migrations script `
  --project SystemDesign.Infrastructure `
  --startup-project SystemDesign.Api `
  --output migrations.sql `
  --idempotent

# Tạo script từ migration cụ thể
dotnet ef migrations script <FromMigration> <ToMigration> `
  --project SystemDesign.Infrastructure `
  --startup-project SystemDesign.Api `
  --output update.sql
```

## Tips

1. Luôn review code migration trước khi apply
2. Backup database trước khi apply migration lên production
3. Sử dụng `--idempotent` flag khi tạo SQL scripts cho production
4. Test migrations trên local/dev environment trước
5. Đặt tên migration có ý nghĩa: `AddUserTable`, `UpdateProductIndex`, etc.
