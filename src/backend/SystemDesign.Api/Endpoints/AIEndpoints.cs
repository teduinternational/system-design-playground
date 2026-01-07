using SystemDesign.Application.Features.AI;
using SystemDesign.Domain;
using SystemDesign.Domain.Models;

namespace SystemDesign.Api.Endpoints;

/// <summary>
/// Extension methods để map AI endpoints
/// </summary>
public static class AIEndpoints
{
    public static IEndpointRouteBuilder MapAIEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/ai")
            .WithTags("AI");

        // GET /api/ai/test - Test AI service với câu hỏi về .NET Backend
        group.MapGet("/test", async (
            string? question,
            IAIService aiService,
            CancellationToken ct) =>
        {
            var userQuestion = question ?? "What are the benefits of using .NET 10 for backend development?";
            
            var systemPrompt = "You are an expert .NET backend developer. Provide clear, concise answers about .NET development.";
            
            var response = await aiService.GenerateResponseAsync(
                systemPrompt,
                userQuestion,
                ct);

            return Results.Ok(new
            {
                Question = userQuestion,
                Answer = response,
                Timestamp = DateTime.UtcNow
            });
        })
        .WithName("TestAI")
        .WithSummary("Test AI service với câu hỏi về .NET Backend")
        .WithDescription("Gửi câu hỏi (qua query param 'question') và nhận câu trả lời từ AI về .NET Backend");

        // POST /api/ai/chat - Chat với custom system và user prompts
        group.MapPost("/chat", async (
            ChatRequest request,
            IAIService aiService,
            CancellationToken ct) =>
        {
            var response = await aiService.GenerateResponseAsync(
                request.SystemPrompt ?? "You are a helpful assistant.",
                request.UserPrompt,
                ct);

            return Results.Ok(new ChatResponse(
                request.UserPrompt,
                response,
                DateTime.UtcNow
            ));
        })
        .WithName("ChatAI")
        .WithSummary("Chat với AI sử dụng custom prompts");

        // POST /api/ai/analyze-architecture - Phân tích kiến trúc hệ thống
        group.MapPost("/analyze-architecture", async (
            DiagramContent diagramData,
            ArchitectureAnalysisService analysisService,
            CancellationToken ct) =>
        {
            var analysis = await analysisService.AnalyzeArchitectureAsync(diagramData, ct);
            
            return Results.Ok(new
            {
                Analysis = analysis,
                Timestamp = DateTime.UtcNow
            });
        })
        .WithName("AnalyzeArchitecture")
        .WithSummary("Phân tích kiến trúc hệ thống bằng AI")
        .WithDescription("Gửi DiagramContent (nodes + edges) để nhận đánh giá và đề xuất từ AI");

        // POST /api/ai/suggest-performance - Đề xuất cải thiện performance
        group.MapPost("/suggest-performance", async (
            DiagramContent diagramData,
            ArchitectureAnalysisService analysisService,
            CancellationToken ct) =>
        {
            var suggestions = await analysisService.SuggestPerformanceImprovementsAsync(diagramData, ct);
            
            return Results.Ok(new
            {
                Suggestions = suggestions,
                Timestamp = DateTime.UtcNow
            });
        })
        .WithName("SuggestPerformance")
        .WithSummary("Đề xuất cải thiện performance cho hệ thống");

        // POST /api/ai/detect-security-issues - Phát hiện vấn đề bảo mật
        group.MapPost("/detect-security-issues", async (
            DiagramContent diagramData,
            ArchitectureAnalysisService analysisService,
            CancellationToken ct) =>
        {
            var securityReport = await analysisService.DetectSecurityIssuesAsync(diagramData, ct);
            
            return Results.Ok(new
            {
                SecurityReport = securityReport,
                Timestamp = DateTime.UtcNow
            });
        })
        .WithName("DetectSecurityIssues")
        .WithSummary("Phát hiện các vấn đề bảo mật tiềm ẩn");

        // POST /api/ai/generate-documentation - Tạo tài liệu kiến trúc
        group.MapPost("/generate-documentation", async (
            ArchitectureDocumentationRequest request,
            ArchitectureAnalysisService analysisService,
            CancellationToken ct) =>
        {
            var documentation = await analysisService.GenerateArchitectureDocumentationAsync(
                request.DiagramData,
                request.ProjectName,
                ct);
            
            return Results.Ok(new
            {
                Documentation = documentation,
                ProjectName = request.ProjectName,
                Timestamp = DateTime.UtcNow
            });
        })
        .WithName("GenerateDocumentation")
        .WithSummary("Tạo tài liệu kiến trúc chi tiết");

        // POST /api/ai/compare-patterns - So sánh với design patterns
        group.MapPost("/compare-patterns", async (
            DiagramContent diagramData,
            ArchitectureAnalysisService analysisService,
            CancellationToken ct) =>
        {
            var comparison = await analysisService.CompareWithDesignPatternsAsync(diagramData, ct);
            
            return Results.Ok(new
            {
                Comparison = comparison,
                Timestamp = DateTime.UtcNow
            });
        })
        .WithName("ComparePatterns")
        .WithSummary("So sánh kiến trúc với các design patterns phổ biến");

        // POST /api/ai/estimate-cost - Ước tính chi phí vận hành
        group.MapPost("/estimate-cost", async (
            CostEstimationRequest request,
            ArchitectureAnalysisService analysisService,
            CancellationToken ct) =>
        {
            var estimate = await analysisService.EstimateOperationalCostAsync(
                request.DiagramData,
                request.ExpectedTrafficPerDay,
                ct);
            
            return Results.Ok(new
            {
                CostEstimate = estimate,
                ExpectedTrafficPerDay = request.ExpectedTrafficPerDay,
                Timestamp = DateTime.UtcNow
            });
        })
        .WithName("EstimateCost")
        .WithSummary("Ước tính chi phí vận hành hệ thống");

        return app;
    }
}

/// <summary>
/// Request model cho chat endpoint
/// </summary>
public record ChatRequest(
    string UserPrompt,
    string? SystemPrompt = null
);

/// <summary>
/// Response model cho chat endpoint
/// </summary>
public record ChatResponse(
    string Question,
    string Answer,
    DateTime Timestamp
);

/// <summary>
/// Request model cho architecture documentation
/// </summary>
public record ArchitectureDocumentationRequest(
    DiagramContent DiagramData,
    string ProjectName
);

/// <summary>
/// Request model cho cost estimation
/// </summary>
public record CostEstimationRequest(
    DiagramContent DiagramData,
    int ExpectedTrafficPerDay
);
