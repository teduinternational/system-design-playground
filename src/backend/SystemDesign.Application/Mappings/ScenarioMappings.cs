using SystemDesign.Application.DTOs;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Mappings;

/// <summary>
/// Extension methods để mapping Scenario entity sang DTO
/// </summary>
public static class ScenarioMappings
{
    public static ScenarioDto ToDto(this Scenario scenario)
    {
        return new ScenarioDto
        {
            Id = scenario.Id,
            DiagramId = scenario.DiagramId,
            ParentScenarioId = scenario.ParentScenarioId,
            Name = scenario.Name,
            VersionTag = scenario.VersionTag,
            ChangeLog = scenario.ChangeLog,
            ContentJson = scenario.ContentJson,
            IsSnapshot = scenario.IsSnapshot,
            CreatedAt = scenario.CreatedAt,
            UpdatedAt = scenario.UpdatedAt
        };
    }

    public static IEnumerable<ScenarioDto> ToDto(this IEnumerable<Scenario> scenarios)
    {
        return scenarios.Select(s => s.ToDto());
    }
}
