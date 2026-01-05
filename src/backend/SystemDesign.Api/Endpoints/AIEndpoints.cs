using SystemDesign.Domain;

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
