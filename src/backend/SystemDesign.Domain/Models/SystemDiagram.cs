namespace SystemDesign.Domain.Models;

/// <summary>
/// System Diagram đầy đủ - bao gồm metadata, nodes và edges
/// Tương đương với SystemDiagram interface trong TypeScript
/// </summary>
public record SystemDiagram(
    DiagramMetadata Metadata,
    List<SystemNode> Nodes,
    List<EdgeModel> Edges
);
