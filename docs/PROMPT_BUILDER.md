# PromptBuilder - AI Architecture Analysis

## Tổng quan

`PromptBuilder` là một class trong `SystemDesign.Application.Services` được thiết kế để chuyển đổi `DiagramContent` (cấu trúc diagram với nodes và edges) thành một chuỗi văn bản mô tả chi tiết hệ thống, phù hợp để làm prompt cho AI.

## Cấu trúc

### PromptBuilder

**Namespace:** `SystemDesign.Application.Services`

**Phương thức chính:**

```csharp
public string BuildFromDiagram(DiagramContent diagramData)
```

### Output Format

Prompt được tạo ra bao gồm các phần sau:

1. **Header** - Tiêu đề và tổng quan
2. **Components Detail** - Mô tả chi tiết từng component (node)
3. **Data Flow & Connections** - Mô tả các kết nối và luồng dữ liệu
4. **Architecture Summary** - Tóm tắt kiến trúc

## Sử dụng

### 1. Basic Usage

```csharp
using SystemDesign.Application.Services;
using SystemDesign.Domain.Models;

var builder = new PromptBuilder();

var diagramData = new DiagramContent(
    Nodes: new List<SystemNode> { /* ... */ },
    Edges: new List<EdgeModel> { /* ... */ }
);

string prompt = builder.BuildFromDiagram(diagramData);
```

### 2. Tích hợp với AI Service

```csharp
using SystemDesign.Application.Features.AI;
using SystemDesign.Domain;

public class MyService(
    IAIService aiService,
    PromptBuilder promptBuilder)
{
    public async Task<string> AnalyzeAsync(DiagramContent diagram)
    {
        // Build prompt
        var systemDescription = promptBuilder.BuildFromDiagram(diagram);
        
        // Gọi AI
        var analysis = await aiService.GenerateResponseAsync(
            systemPrompt: "Bạn là kiến trúc sư hệ thống...",
            userPrompt: systemDescription,
            cancellationToken: default
        );
        
        return analysis;
    }
}
```

### 3. Sử dụng với ArchitectureAnalysisService

Service này đã tích hợp sẵn `PromptBuilder` và cung cấp nhiều phương thức phân tích:

```csharp
using SystemDesign.Application.Features.AI;

public class MyController(ArchitectureAnalysisService analysisService)
{
    public async Task<string> Analyze(DiagramContent diagram)
    {
        // Phân tích tổng quan
        var analysis = await analysisService.AnalyzeArchitectureAsync(diagram);
        
        // Đề xuất cải thiện performance
        var perfSuggestions = await analysisService.SuggestPerformanceImprovementsAsync(diagram);
        
        // Phát hiện vấn đề bảo mật
        var securityReport = await analysisService.DetectSecurityIssuesAsync(diagram);
        
        // Tạo tài liệu
        var docs = await analysisService.GenerateArchitectureDocumentationAsync(
            diagram, 
            "My Project"
        );
        
        return analysis;
    }
}
```

## API Endpoints

Sau khi đăng ký services trong DI container, các endpoints sau sẽ khả dụng:

### POST /api/ai/analyze-architecture
Phân tích kiến trúc tổng thể, đưa ra đánh giá và đề xuất.

### POST /api/ai/suggest-performance
Đề xuất các cải thiện về performance (latency, throughput, scalability).

### POST /api/ai/detect-security-issues
Phát hiện các vấn đề bảo mật tiềm ẩn trong kiến trúc.

### POST /api/ai/generate-documentation
Tạo tài liệu kiến trúc chi tiết theo format Markdown.

### POST /api/ai/compare-patterns
So sánh kiến trúc với các design patterns phổ biến (Microservices, Event-Driven, CQRS, v.v.).

### POST /api/ai/estimate-cost
Ước tính chi phí vận hành hệ thống dựa trên cấu hình và traffic dự kiến.

## Ví dụ Request

```http
POST http://localhost:5000/api/ai/analyze-architecture
Content-Type: application/json

{
  "nodes": [
    {
      "id": "node_1",
      "type": "customNode",
      "metadata": {
        "label": "API Gateway",
        "category": "TrafficManager",
        "specs": {
          "latencyBase": 10,
          "maxThroughput": 5000,
          "reliability": 0.999
        },
        "technologies": ["NGINX", "Kong"],
        "provider": "AWS",
        "props": {
          "instanceCount": 3,
          "isClustered": true,
          "region": "us-east-1"
        }
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": "node_1",
      "target": "node_2",
      "data": {
        "protocol": "HTTPS",
        "auth": "JWT"
      }
    }
  ]
}
```

## Ví dụ Output

```
=== SYSTEM ARCHITECTURE DESCRIPTION ===

Total Components: 3
Total Connections: 2

--- COMPONENTS DETAIL ---

[API Gateway] (ID: node_1)
  Type: customNode
  Category: TrafficManager
  Technologies: NGINX, Kong
  Provider: AWS
  Specifications:
    - Latency Base: 10ms
    - Max Throughput: 5000 req/s
    - Reliability: 99.90%
  Configuration:
    - Instance Count: 3
    - Clustered: True
    - Region: us-east-1

[User Service] (ID: node_2)
  Type: customNode
  Category: Compute
  Technologies: Node.js, Express
  Provider: AWS
  ...

--- DATA FLOW & CONNECTIONS ---

Connection: [API Gateway] → [User Service]
  Edge ID: edge_1
  Label: HTTP Request
  Connection Details:
    - Protocol: HTTPS
    - Authentication: JWT
    - Traffic Weight: 1.00
    - Network Latency: 5ms

--- ARCHITECTURE SUMMARY ---

Components by Category:
  - TrafficManager: 1 component(s)
    * API Gateway
  - Compute: 1 component(s)
    * User Service
  - Storage: 1 component(s)
    * PostgreSQL

Technologies Used:
  - NGINX (used in 1 component(s))
  - Kong (used in 1 component(s))
  - Node.js (used in 1 component(s))
  ...

System Complexity Score: 14.50
  (Based on nodes, edges, and configuration complexity)
```

## Dependency Injection Setup

Trong `SystemDesign.Application/DependencyInjection.cs`:

```csharp
public static IServiceCollection AddApplication(this IServiceCollection services)
{
    // ...
    
    // Đăng ký AI Services
    services.AddScoped<PromptBuilder>();
    services.AddScoped<ArchitectureAnalysisService>();
    
    return services;
}
```

## Testing

Xem file `SystemDesign.Tests/Services/PromptBuilderTests.cs` để tham khảo các test cases:

```bash
cd src/backend
dotnet test --filter "FullyQualifiedName~PromptBuilderTests"
```

## Mở rộng

Bạn có thể mở rộng `PromptBuilder` để:

1. **Thêm các phân tích chuyên sâu:**
   - Cost analysis
   - Performance bottleneck detection
   - Security vulnerability scanning

2. **Customize format output:**
   - JSON format
   - YAML format
   - Markdown format

3. **Tích hợp với các AI models khác:**
   - OpenAI GPT-4
   - Anthropic Claude
   - Google Gemini

## Best Practices

1. **Cache prompts** nếu diagram không thay đổi thường xuyên
2. **Validate input** trước khi build prompt
3. **Log prompts** để debug và improve
4. **Set timeout** cho AI service calls
5. **Handle errors** gracefully khi AI service không khả dụng

## Related Files

- `SystemDesign.Application/Services/PromptBuilder.cs` - Main implementation
- `SystemDesign.Application/Features/AI/ArchitectureAnalysisService.cs` - AI analysis service
- `SystemDesign.Api/Endpoints/AIEndpoints.cs` - API endpoints
- `SystemDesign.Tests/Services/PromptBuilderTests.cs` - Unit tests
- `SystemDesign.Api/prompt-builder-tests.http` - HTTP test file

## License

Part of SystemDesignPlayground project.
