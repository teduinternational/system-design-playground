using Microsoft.Extensions.Configuration;
using Microsoft.SemanticKernel;
using Microsoft.SemanticKernel.ChatCompletion;
using SystemDesign.Domain;

namespace SystemDesign.Infrastructure.Services;

public class AIService(IConfiguration configuration) : IAIService
{
    private readonly Kernel _kernel = CreateKernel(configuration);

    public async Task<string> GenerateResponseAsync(
        string systemPrompt, 
        string userPrompt, 
        CancellationToken cancellationToken = default)
    {
        var chatCompletionService = _kernel.GetRequiredService<IChatCompletionService>();
        
        var chatHistory = new ChatHistory();
        chatHistory.AddSystemMessage(systemPrompt);
        chatHistory.AddUserMessage(userPrompt);

        var response = await chatCompletionService.GetChatMessageContentAsync(
            chatHistory,
            cancellationToken: cancellationToken);

        return response.Content ?? string.Empty;
    }

    private static Kernel CreateKernel(IConfiguration configuration)
    {
        var apiKey = configuration["OpenAI:ApiKey"] 
            ?? throw new InvalidOperationException("OpenAI API key is not configured");
        var modelId = configuration["OpenAI:ModelId"] ?? "gpt-4o-mini";

        var builder = Kernel.CreateBuilder();
        builder.AddOpenAIChatCompletion(
            modelId: modelId,
            apiKey: apiKey);

        return builder.Build();
    }
}
