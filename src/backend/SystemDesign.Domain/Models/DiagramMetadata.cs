namespace SystemDesign.Domain.Models;

/// <summary>
/// Metadata thông tin về diagram
/// </summary>
public record DiagramMetadata(
    string Id,
    string Name,
    string? Description,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int Version,
    string? CreatedBy = null,
    List<string>? Tags = null
);
