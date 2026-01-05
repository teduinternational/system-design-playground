namespace SystemDesign.Domain;

public interface IAIService
{
    Task<string> GenerateResponseAsync(string systemPrompt, string userPrompt, CancellationToken cancellationToken = default);
}
