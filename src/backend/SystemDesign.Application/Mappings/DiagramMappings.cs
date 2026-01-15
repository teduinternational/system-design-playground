using SystemDesign.Application.DTOs;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Mappings;

/// <summary>
/// Extension methods để mapping Diagram entity sang DTO
/// </summary>
public static class DiagramMappings
{
    public static DiagramDto ToDto(this Diagram diagram)
    {
        return new DiagramDto
        {
            Id = diagram.Id,
            Name = diagram.Name,
            Description = diagram.Description,
            JsonData = diagram.JsonData,
            Version = diagram.Version,
            CreatedBy = diagram.CreatedBy,
            CreatedAt = diagram.CreatedAt,
            UpdatedAt = diagram.UpdatedAt,
            OwnerId = diagram.OwnerId
        };
    }

    public static IEnumerable<DiagramDto> ToDto(this IEnumerable<Diagram> diagrams)
    {
        return diagrams.Select(d => d.ToDto());
    }
}
