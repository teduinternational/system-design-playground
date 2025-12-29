# API Documentation

## Tổng quan kiến trúc

Hệ thống quản lý 3 thực thể chính:
1. **Diagrams**: Dự án tổng quát (vd: "Hệ thống E-commerce")
2. **Scenarios**: Các biến thể kiến trúc (vd: "Monolith" vs "Microservices")
3. **Runs**: Kết quả các lần simulation

## Endpoints

### 📦 Diagrams

#### Lấy tất cả diagrams
```http
GET /api/diagrams
GET /api/diagrams?userId=user123
GET /api/diagrams?search=ecommerce
```

#### Tạo diagram mới
```http
POST /api/diagrams
Content-Type: application/json

{
  "name": "E-Commerce System",
  "description": "Microservices architecture",
  "jsonData": "{...}",
  "createdBy": "user123"
}
```

#### Lấy diagram theo ID
```http
GET /api/diagrams/{id}
```

#### Cập nhật diagram
```http
PUT /api/diagrams/{id}
Content-Type: application/json

{
  "name": "E-Commerce System v2",
  "description": "Updated architecture",
  "jsonData": "{...}"
}
```

#### Xóa diagram (soft delete)
```http
DELETE /api/diagrams/{id}
```

---

### 🎯 Scenarios

#### Tạo scenario mới cho diagram
```http
POST /api/diagrams/{diagramId}/scenarios
Content-Type: application/json

{
  "name": "Phương án Microservices",
  "versionTag": "1.0.0",
  "contentJson": "{nodes: [...], edges: [...]}",
  "changeLog": "Thay đổi từ Monolith sang Microservices",
  "parentScenarioId": null,
  "isSnapshot": false
}
```

#### Lấy tất cả scenarios của diagram
```http
GET /api/diagrams/{diagramId}/scenarios
```

#### Lấy scenario theo ID
```http
GET /api/scenarios/{id}
```

#### Cập nhật scenario
```http
PUT /api/scenarios/{id}
Content-Type: application/json

{
  "name": "Phương án Microservices v2",
  "contentJson": "{nodes: [...], edges: [...]}",
  "changeLog": "Thêm Redis cache"
}
```

---

### 🚀 Runs (Simulation History)

#### Tạo run mới (bắt đầu simulation)
```http
POST /api/runs
Content-Type: application/json

{
  "scenarioId": "guid-here",
  "runName": "Test với 1000 concurrent users",
  "environmentParams": "{concurrentUsers: 1000, duration: 60}"
}
```

Response:
```json
{
  "id": "run-guid",
  "scenarioId": "scenario-guid",
  "runName": "Test với 1000 concurrent users",
  "status": "Pending",
  "createdAt": "2025-12-29T10:00:00Z"
}
```

#### Lấy lịch sử runs của scenario
```http
GET /api/scenarios/{scenarioId}/runs
```

Response:
```json
[
  {
    "id": "run-guid",
    "scenarioId": "scenario-guid",
    "runName": "Test với 1000 concurrent users",
    "status": "Completed",
    "startedAt": "2025-12-29T10:00:00Z",
    "completedAt": "2025-12-29T10:01:30Z",
    "durationMs": 90000,
    "averageLatencyMs": 125.5,
    "throughputRps": 850.3,
    "successfulRequests": 76527,
    "failedRequests": 473,
    "errorRate": 0.61,
    "resultJson": "{...detailed metrics...}",
    "createdAt": "2025-12-29T10:00:00Z"
  }
]
```

#### Lấy run theo ID
```http
GET /api/runs/{id}
```

#### Cập nhật trạng thái run
```http
PATCH /api/runs/{id}/status
Content-Type: application/json

{
  "status": "Completed",
  "averageLatencyMs": 125.5,
  "throughputRps": 850.3,
  "successfulRequests": 76527,
  "failedRequests": 473,
  "errorRate": 0.61,
  "resultJson": "{...detailed metrics per node...}"
}
```

## Run Status Flow

```
Pending -> Processing -> Completed
                      -> Failed
                      -> Cancelled
```

## OpenAPI Documentation

Khi chạy ở Development mode, truy cập:

- **OpenAPI JSON**: `http://localhost:5000/openapi/v1.json`
- **Scalar UI**: `http://localhost:5000/scalar/v1`

## Technologies

- **.NET 10** với Minimal API
- **MediatR** cho CQRS pattern
- **Primary Constructors** cho Dependency Injection
- **Result Pattern** thay vì Exceptions
- **Entity Framework Core** với SQL Server
- **Scalar** cho OpenAPI documentation UI
