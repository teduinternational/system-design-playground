namespace SystemDesign.Application.DTOs;

/// <summary>
/// DTO cho Scenario entity
/// </summary>
public sealed record ScenarioDto
{
    public required Guid Id { get; init; }
    public required Guid DiagramId { get; init; }
    public Guid? ParentScenarioId { get; init; }
    public required string Name { get; init; }
    public required string VersionTag { get; init; }
    public string ChangeLog { get; init; } = string.Empty;
    public required string ContentJson { get; init; }
    public bool IsSnapshot { get; init; }
    public required DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}

public sealed record CreateScenarioDto
{
    public required Guid DiagramId { get; init; }
    public required string Name { get; init; }
    public required string VersionTag { get; init; }
    public string ChangeLog { get; init; } = string.Empty;
    public required string ContentJson { get; init; }
    public Guid? ParentScenarioId { get; init; }
    public bool IsSnapshot { get; init; } = false;
}

public sealed record UpdateScenarioDto
{
    public required string Name { get; init; }
    public required string ContentJson { get; init; }
    public string ChangeLog { get; init; } = string.Empty;
}
