# System Design Playground - Backend API

## 🏗️ Kiến trúc

Dự án tuân thủ **Clean Architecture** với các layers:

```
SystemDesign.Api           # Presentation Layer (Minimal API)
  ├── Endpoints/           # Route definitions
  └── Program.cs

SystemDesign.Application   # Application Layer
  ├── Features/            # CQRS Commands & Queries (MediatR)
  │   ├── Diagrams/        # Diagram Commands & Queries
  │   ├── Scenarios/       # Scenario Commands & Queries
  │   └── Runs/            # Run Commands & Queries
  ├── Mappings/            # Entity to DTO mappings (Extensions)
  ├── DTOs/                # Data Transfer Objects
  └── Common/              # Result Pattern

SystemDesign.Domain        # Domain Layer
  ├── Entities/            # Domain entities
  ├── Enums/               # Domain enums
  └── Models/              # Value objects

SystemDesign.Infrastructure # Infrastructure Layer
  ├── Persistence/         # DbContext
  └── Repositories/        # Data access
```

## 🚀 Công nghệ sử dụng

- **.NET 10** (C# 14) với Primary Constructors
- **Minimal API** (không dùng Controllers)
- **MediatR** - CQRS pattern
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **Scalar** - OpenAPI documentation UI
- **Result Pattern** - Error handling

## 📦 3 Thực thể chính

### 1. Diagrams
Dự án tổng quát (vd: "Hệ thống E-commerce")

### 2. Scenarios  
Các phương án thiết kế khác nhau (vd: "Monolith" vs "Microservices")
- Mỗi scenario lưu một bản JSON riêng từ React Flow
- Hỗ trợ version tracking với `VersionTag` và `ChangeLog`

### 3. Runs
Lịch sử các lần simulation
- Trạng thái: `Pending -> Processing -> Completed/Failed`
- Lưu metrics: latency, throughput, error rate, etc.

## 🛠️ Setup & Chạy project

### 1. Cài đặt dependencies
```bash
cd src/backend
dotnet restore
```

### 2. Cấu hình Database
Sửa connection string trong `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=SystemDesignPlayground;Trusted_Connection=True;TrustServerCertificate=True"
  }
}
```

### 3. Tạo database migrations
```bash
cd src/backend/SystemDesign.Infrastructure

# Tạo migration
dotnet ef migrations add InitialCreate --output-dir Persistence/Migrations

# Apply migration
dotnet ef database update
```

📖 **Chi tiết về migrations**: Xem [SystemDesign.Infrastructure/MIGRATIONS.md](SystemDesign.Infrastructure/MIGRATIONS.md)

### 4. Chạy API
```bash
cd src/backend/SystemDesign.Api
dotnet run
```

API sẽ chạy tại: `https://localhost:7000` hoặc `http://localhost:5000`

### 5. Xem API Documentation
- **Scalar UI**: http://localhost:5000/scalar/v1
- **OpenAPI JSON**: http://localhost:5000/openapi/v1.json

## 📖 API Endpoints

### Diagrams
- `GET /api/diagrams` - Lấy tất cả diagrams
- `GET /api/diagrams?userId={id}` - Filter theo user
- `GET /api/diagrams?search={keyword}` - Search theo tên
- `POST /api/diagrams` - Tạo diagram mới
- `GET /api/diagrams/{id}` - Lấy diagram theo ID
- `PUT /api/diagrams/{id}` - Cập nhật diagram
- `DELETE /api/diagrams/{id}` - Xóa diagram (soft delete)

### Scenarios
- `POST /api/diagrams/{diagramId}/scenarios` - Tạo scenario mới
- `GET /api/diagrams/{diagramId}/scenarios` - Lấy scenarios của diagram
- `GET /api/scenarios/{id}` - Lấy scenario theo ID
- `PUT /api/scenarios/{id}` - Cập nhật scenario

### Runs
- `POST /api/runs` - Tạo run mới (bắt đầu simulation)
- `GET /api/scenarios/{scenarioId}/runs` - Lịch sử runs của scenario
- `GET /api/runs/{id}` - Lấy run theo ID
- `PATCH /api/runs/{id}/status` - Cập nhật trạng thái run

Chi tiết xem: [API_DOCUMENTATION.md](../../docs/API_DOCUMENTATION.md)

## 🎯 Ví dụ sử dụng

### 1. Tạo Diagram và Scenario
```bash
# 1. Tạo diagram
curl -X POST http://localhost:5000/api/diagrams \
  -H "Content-Type: application/json" \
  -d '{
    "name": "E-Commerce System",
    "description": "Microservices architecture",
    "jsonData": "{}",
    "createdBy": "user123"
  }'

# Response: { "id": "diagram-guid", ... }

# 2. Tạo scenario cho diagram
curl -X POST http://localhost:5000/api/diagrams/{diagram-guid}/scenarios \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Phương án Microservices",
    "versionTag": "1.0.0",
    "contentJson": "{nodes: [...], edges: [...]}",
    "changeLog": "Initial design"
  }'

# Response: { "id": "scenario-guid", ... }
```

### 2. Chạy Simulation
```bash
# 1. Tạo run
curl -X POST http://localhost:5000/api/runs \
  -H "Content-Type: application/json" \
  -d '{
    "scenarioId": "scenario-guid",
    "runName": "Load test 1000 users",
    "environmentParams": "{concurrentUsers: 1000}"
  }'

# Response: { "id": "run-guid", "status": "Pending", ... }

# 2. Cập nhật trạng thái run
curl -X PATCH http://localhost:5000/api/runs/{run-guid}/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "Completed",
    "averageLatencyMs": 125.5,
    "throughputRps": 850.3,
    "successfulRequests": 76527,
    "failedRequests": 473,
    "errorRate": 0.61
  }'

# 3. Xem lịch sử runs
curl http://localhost:5000/api/scenarios/{scenario-guid}/runs
```

## 🏛️ Design Patterns

### 1. CQRS với MediatR
```csharp
// Command
public record SaveScenarioCommand(...) : IRequest<Result<ScenarioDto>>;

// Handler với Primary Constructor
public sealed class SaveScenarioHandler(IRepository<Scenario> repo) 
    : IRequestHandler<SaveScenarioCommand, Result<ScenarioDto>>
{
    public async Task<Result<ScenarioDto>> Handle(...) 
    {
        var scenario = new Scenario { ... };
        var created = await repo.AddAsync(scenario);
        return Result<ScenarioDto>.Success(created.ToDto());
    }
}
```

### 2. Centralized Mapping với Extensions
```csharp
// Mappings/ScenarioMappings.cs
public static class ScenarioMappings
{
    public static ScenarioDto ToDto(this Scenario scenario) => new() { ... };
    public static IEnumerable<ScenarioDto> ToDto(this IEnumerable<Scenario> scenarios) 
        => scenarios.Select(s => s.ToDto());
}

// Usage
return Result<ScenarioDto>.Success(scenario.ToDto());
return Result<IEnumerable<ScenarioDto>>.Success(scenarios.ToDto());
```

### 3. Result Pattern (thay vì Exceptions)
```csharp
public async Task<Result<DiagramDto>> GetByIdAsync(Guid id)
{
    var diagram = await repository.GetByIdAsync(id);
    if (diagram == null)
        return Result<DiagramDto>.Failure("Không tìm thấy diagram");
    
    return Result<DiagramDto>.Success(MapToDto(diagram));
}
```

### 4. Repository Pattern
```csharp
public interface IRepository<T> where T : BaseEntity
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    // ...
}
```

## 🧪 Testing (TODO)
```bash
cd src/backend/SystemDesign.Tests
dotnet test
```

## 📝 Standards

- ✅ Primary Constructors cho DI
- ✅ Minimal API (không Controllers)
- ✅ Result Pattern (không throw exceptions)
- ✅ CQRS với MediatR
- ✅ Clean Architecture
- ✅ Async/await everywhere
- ✅ CancellationToken support

## 🤝 Contributing

Xem [copilot-instructions.md](../../.github/copilot-instructions.md) để biết coding standards.
