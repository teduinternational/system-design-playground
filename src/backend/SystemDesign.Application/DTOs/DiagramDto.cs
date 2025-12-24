namespace SystemDesign.Application.DTOs;

public sealed record CreateDiagramDto
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required string JsonData { get; init; }
    public string? CreatedBy { get; init; }
}

public sealed record UpdateDiagramDto
{
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required string JsonData { get; init; }
}

public sealed record DiagramDto
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required string JsonData { get; init; }
    public required int Version { get; init; }
    public string? CreatedBy { get; init; }
    public required DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
}
