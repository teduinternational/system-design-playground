using SystemDesign.Application.DTOs;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Mappings;

/// <summary>
/// Extension methods để mapping Run entity sang DTO
/// </summary>
public static class RunMappings
{
    public static RunDto ToDto(this Run run)
    {
        return new RunDto
        {
            Id = run.Id,
            ScenarioId = run.ScenarioId,
            RunName = run.RunName,
            Status = run.Status,
            StartedAt = run.StartedAt,
            CompletedAt = run.CompletedAt,
            DurationMs = run.DurationMs,
            AverageLatencyMs = run.AverageLatencyMs,
            ThroughputRps = run.ThroughputRps,
            SuccessfulRequests = run.SuccessfulRequests,
            FailedRequests = run.FailedRequests,
            ErrorRate = run.ErrorRate,
            EnvironmentParams = run.EnvironmentParams,
            ResultJson = run.ResultJson,
            ErrorMessage = run.ErrorMessage,
            CreatedAt = run.CreatedAt
        };
    }

    public static IEnumerable<RunDto> ToDto(this IEnumerable<Run> runs)
    {
        return runs.Select(r => r.ToDto());
    }
}
