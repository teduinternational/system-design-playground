# System Design Playground - Architecture Summary

## 🎯 3 Thực thể chính

```
┌─────────────────────────────────────────────────────────────────┐
│                         DIAGRAMS                                │
│  (Dự án tổng quát - vd: "Hệ thống E-commerce")                 │
│                                                                 │
│  Fields:                                                        │
│  • Id, Name, Description                                        │
│  • JsonData (lưu diagram từ React Flow)                        │
│  • Version, CreatedBy, UserId                                   │
│  • CreatedAt, UpdatedAt, IsDeleted                             │
└────────────────────┬────────────────────────────────────────────┘
                     │ 1:N
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        SCENARIOS                                │
│  (Các phương án thiết kế - vd: "Monolith" vs "Microservices")  │
│                                                                 │
│  Fields:                                                        │
│  • Id, DiagramId, ParentScenarioId                             │
│  • Name, VersionTag, ChangeLog                                 │
│  • ContentJson (bản JSON riêng từ React Flow)                  │
│  • IsSnapshot (snapshot/editing mode)                          │
│  • CreatedAt, UpdatedAt, IsDeleted                             │
└────────────────────┬────────────────────────────────────────────┘
                     │ 1:N
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                          RUNS                                   │
│  (Lịch sử simulation - metrics của mỗi lần test)               │
│                                                                 │
│  Fields:                                                        │
│  • Id, ScenarioId, RunName                                     │
│  • Status (Pending → Processing → Completed/Failed)            │
│  • StartedAt, CompletedAt, DurationMs                          │
│  • AverageLatencyMs, ThroughputRps                             │
│  • SuccessfulRequests, FailedRequests, ErrorRate               │
│  • EnvironmentParams (JSON), ResultJson (JSON)                 │
│  • ErrorMessage                                                │
│  • CreatedAt, UpdatedAt, IsDeleted                             │
└─────────────────────────────────────────────────────────────────┘
```

## 🏗️ Clean Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                       SystemDesign.Api                          │
│                    (Presentation Layer)                         │
│                                                                 │
│  • Program.cs - Minimal API configuration                      │
│  • Endpoints/ - Route definitions                              │
│    ├── DiagramEndpoints.cs                                     │
│    ├── ScenarioEndpoints.cs                                    │
│    └── RunEndpoints.cs                                         │
└───────────────────────────┬─────────────────────────────────────┘
                            │ depends on
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SystemDesign.Application                       │
│                    (Application Layer)                          │
│                                                                 │
│  • Features/ - CQRS với MediatR (100% Commands/Queries)        │
│    ├── Diagrams/                                                │
│    │   ├── Commands/                                            │
│    │   │   ├── CreateDiagramCommand.cs                         │
│    │   │   ├── UpdateDiagramCommand.cs                         │
│    │   │   └── DeleteDiagramCommand.cs                         │
│    │   └── Queries/                                             │
│    │       ├── GetDiagramByIdQuery.cs                          │
│    │       ├── GetAllDiagramsQuery.cs                          │
│    │       ├── GetDiagramsByUserQuery.cs                       │
│    │       └── SearchDiagramsByNameQuery.cs                    │
│    ├── Scenarios/                                               │
│    │   ├── Commands/                                            │
│    │   │   ├── SaveScenarioCommand.cs                          │
│    │   │   └── UpdateScenarioCommand.cs                        │
│    │   └── Queries/                                             │
│    │       ├── GetScenarioByIdQuery.cs                         │
│    │       └── GetScenariosByDiagramQuery.cs                   │
│    └── Runs/                                                    │
│        ├── Commands/                                            │
│        │   ├── CreateRunCommand.cs                             │
│        │   └── UpdateRunStatusCommand.cs                       │
│        └── Queries/                                             │
│            ├── GetRunByIdQuery.cs                              │
│            └── GetRunsByScenarioQuery.cs                       │
│  • DTOs/ - Data Transfer Objects                                │
│  • Common/ - Result Pattern                                     │
└───────────────────────────┬─────────────────────────────────────┘
                            │ depends on
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SystemDesign.Domain                          │
│                      (Domain Layer)                             │
│                                                                 │
│  • Entities/                                                    │
│    ├── BaseEntity.cs                                           │
│    ├── Diagram.cs                                              │
│    ├── Scenario.cs                                             │
│    └── Run.cs                                                  │
│  • Enums/                                                       │
│    ├── NodeType.cs, NodeCategory.cs                            │
│    └── RunStatus.cs                                            │
│  • Models/ - Value objects                                     │
│  • IRepository.cs - Repository interface                       │
└───────────────────────────┬─────────────────────────────────────┘
                            ▲ implements
                            │
┌─────────────────────────────────────────────────────────────────┐
│                 SystemDesign.Infrastructure                     │
│                   (Infrastructure Layer)                        │
│                                                                 │
│  • Persistence/                                                 │
│    └── ApplicationDbContext.cs                                 │
│  • Repositories/                                                │
│    └── Repository<T>.cs - Generic repository                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 CQRS Flow với MediatR

```
Frontend Request
      │
      ▼
┌──────────────┐
│   Endpoint   │ (Minimal API)
└──────┬───────┘
       │ Send(command/query)
       ▼
┌──────────────┐
│   MediatR    │ (Mediator pattern)
└──────┬───────┘
       │ Route to Handler
       ▼
┌──────────────┐
│   Handler    │ (Primary Constructor DI)
│              │
│  - Validate  │
│  - Business  │
│  - Repo call │
└──────┬───────┘
       │ Result<T>
       ▼
┌──────────────┐
│  Repository  │ (EF Core)
└──────┬───────┘
       │
       ▼
   Database
```

## 📡 API Routes Overview

```
/api/diagrams
  GET    /                           # Lấy tất cả (filter: ?userId= ?search=)
  POST   /                           # Tạo mới
  GET    /{id}                       # Lấy theo ID
  PUT    /{id}                       # Cập nhật
  DELETE /{id}                       # Xóa (soft delete)
  
  POST   /{diagramId}/scenarios     # Tạo scenario cho diagram
  GET    /{diagramId}/scenarios     # Lấy scenarios của diagram

/api/scenarios
  GET    /{id}                       # Lấy theo ID
  PUT    /{id}                       # Cập nhật
  
  GET    /{scenarioId}/runs         # Lấy runs của scenario

/api/runs
  POST   /                           # Tạo run mới (bắt đầu simulation)
  GET    /{id}                       # Lấy theo ID
  PATCH  /{id}/status                # Cập nhật trạng thái + metrics
```

## 🎯 Simulation Workflow

```
┌──────────────────────────────────────────────────────────────────┐
│  1. Frontend: User nhấn "Simulate" button                       │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  2. POST /api/runs                                               │
│     {                                                            │
│       "scenarioId": "...",                                       │
│       "runName": "Load test 1000 users",                        │
│       "environmentParams": "{...}"                               │
│     }                                                            │
│                                                                  │
│  Response: { "id": "run-guid", "status": "Pending" }            │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  3. Backend/Frontend: Bắt đầu simulation                         │
│     PATCH /api/runs/{id}/status                                  │
│     { "status": "Processing" }                                   │
│                                                                  │
│  => StartedAt được set                                           │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  4. Simulation Engine chạy (giả lập trong Frontend hoặc Worker) │
│     - Tính toán latency, throughput                              │
│     - Track requests success/failed                              │
│     - Collect metrics per node                                   │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  5. Khi xong: PATCH /api/runs/{id}/status                        │
│     {                                                            │
│       "status": "Completed",                                     │
│       "averageLatencyMs": 125.5,                                │
│       "throughputRps": 850.3,                                   │
│       "successfulRequests": 76527,                              │
│       "failedRequests": 473,                                    │
│       "errorRate": 0.61,                                        │
│       "resultJson": "{...per-node metrics...}"                  │
│     }                                                            │
│                                                                  │
│  => CompletedAt và DurationMs được tính                          │
└────────────────────────┬─────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│  6. Frontend: Hiển thị results, lưu vào history                  │
│     GET /api/scenarios/{scenarioId}/runs                         │
│                                                                  │
│  => User có thể xem và so sánh các lần chạy trước đó            │
└──────────────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

- **.NET 10** (C# 14) - Primary Constructors
- **Minimal API** - Không Controllers
- **MediatR** - CQRS pattern
- **Entity Framework Core** - ORM
- **SQL Server** - Database
- **Result Pattern** - Error handling thay exceptions
- **Scalar** - OpenAPI documentation UI
- **Clean Architecture** - Separation of concerns

## 📚 Key Features

✅ **CQRS Pattern** với MediatR Commands/Queries  
✅ **Result Pattern** thay vì throw exceptions  
✅ **Primary Constructors** cho DI (.NET 10)  
✅ **Generic Repository** với Expression support  
✅ **Soft Delete** cho tất cả entities  
✅ **Version Tracking** cho scenarios  
✅ **Simulation History** với detailed metrics  
✅ **OpenAPI/Swagger** documentation  
✅ **Async/await** everywhere  
✅ **CancellationToken** support  

## 🔗 Useful Links

- **API Documentation**: `docs/API_DOCUMENTATION.md`
- **Backend README**: `src/backend/README.md`
- **Coding Standards**: `.github/copilot-instructions.md`
- **HTTP Tests**: `src/backend/SystemDesign.Api/api-tests.http`
