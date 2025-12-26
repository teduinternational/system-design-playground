namespace SystemDesign.Domain.Models;

/// <summary>
/// Nội dung đầy đủ của diagram (nodes + edges) để serialize/deserialize từ JSON
/// </summary>
public record DiagramContent(
    List<SystemNode> Nodes,
    List<EdgeModel> Edges
);
