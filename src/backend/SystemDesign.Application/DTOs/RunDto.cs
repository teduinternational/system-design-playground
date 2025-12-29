using SystemDesign.Domain.Enums;

namespace SystemDesign.Application.DTOs;

/// <summary>
/// DTO cho Run entity
/// </summary>
public sealed record RunDto
{
    public required Guid Id { get; init; }
    public required Guid ScenarioId { get; init; }
    public string? RunName { get; init; }
    public required RunStatus Status { get; init; }
    public DateTime? StartedAt { get; init; }
    public DateTime? CompletedAt { get; init; }
    public long? DurationMs { get; init; }
    public double? AverageLatencyMs { get; init; }
    public double? ThroughputRps { get; init; }
    public int? SuccessfulRequests { get; init; }
    public int? FailedRequests { get; init; }
    public double? ErrorRate { get; init; }
    public string? EnvironmentParams { get; init; }
    public string? ResultJson { get; init; }
    public string? ErrorMessage { get; init; }
    public required DateTime CreatedAt { get; init; }
}

public sealed record CreateRunDto
{
    public required Guid ScenarioId { get; init; }
    public string? RunName { get; init; }
    public string? EnvironmentParams { get; init; }
}

public sealed record UpdateRunStatusDto
{
    public required RunStatus Status { get; init; }
    public double? AverageLatencyMs { get; init; }
    public double? ThroughputRps { get; init; }
    public int? SuccessfulRequests { get; init; }
    public int? FailedRequests { get; init; }
    public double? ErrorRate { get; init; }
    public string? ResultJson { get; init; }
    public string? ErrorMessage { get; init; }
}
