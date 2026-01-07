using System.Text;
using SystemDesign.Domain.Models;

namespace SystemDesign.Application.Services;

/// <summary>
/// Service để xây dựng prompt văn bản cho AI từ DiagramContent
/// </summary>
public class PromptBuilder
{
    /// <summary>
    /// Xây dựng prompt mô tả hệ thống từ DiagramContent
    /// </summary>
    /// <param name="diagramData">Dữ liệu diagram chứa nodes và edges</param>
    /// <returns>Chuỗi văn bản mô tả hệ thống dành cho AI</returns>
    public string BuildFromDiagram(DiagramContent diagramData)
    {
        var sb = new StringBuilder();

        // Header
        sb.AppendLine("=== SYSTEM ARCHITECTURE DESCRIPTION ===");
        sb.AppendLine();

        // Mô tả tổng quan
        sb.AppendLine($"Total Components: {diagramData.Nodes.Count}");
        sb.AppendLine($"Total Connections: {diagramData.Edges.Count}");
        sb.AppendLine();

        // Duyệt qua các nodes để mô tả từng thành phần
        sb.AppendLine("--- COMPONENTS DETAIL ---");
        sb.AppendLine();

        foreach (var node in diagramData.Nodes)
        {
            BuildNodeDescription(sb, node);
            sb.AppendLine();
        }

        // Duyệt qua các edges để mô tả luồng dữ liệu
        sb.AppendLine("--- DATA FLOW & CONNECTIONS ---");
        sb.AppendLine();

        foreach (var edge in diagramData.Edges)
        {
            BuildEdgeDescription(sb, edge, diagramData.Nodes);
            sb.AppendLine();
        }

        // Summary
        sb.AppendLine("--- ARCHITECTURE SUMMARY ---");
        BuildArchitectureSummary(sb, diagramData);

        return sb.ToString();
    }

    /// <summary>
    /// Xây dựng mô tả chi tiết cho một node
    /// </summary>
    private void BuildNodeDescription(StringBuilder sb, SystemNode node)
    {
        var metadata = node.Metadata;

        // Tiêu đề node
        sb.AppendLine($"[{metadata.Label}] (ID: {node.Id})");
        sb.AppendLine($"  Type: {node.Type}");
        sb.AppendLine($"  Category: {metadata.Category}");

        // Technologies
        if (metadata.Technologies != null && metadata.Technologies.Count > 0)
        {
            sb.AppendLine($"  Technologies: {string.Join(", ", metadata.Technologies)}");
        }

        // Provider
        if (!string.IsNullOrEmpty(metadata.Provider))
        {
            sb.AppendLine($"  Provider: {metadata.Provider}");
        }

        // Specs - Thông số kỹ thuật
        sb.AppendLine("  Specifications:");
        sb.AppendLine($"    - Latency Base: {metadata.Specs.LatencyBase}ms");
        sb.AppendLine($"    - Max Throughput: {metadata.Specs.MaxThroughput} req/s");
        sb.AppendLine($"    - Reliability: {metadata.Specs.Reliability * 100:F2}%");

        // Props - Cấu hình kỹ thuật
        if (metadata.Props != null)
        {
            sb.AppendLine("  Configuration:");

            if (metadata.Props.InstanceCount.HasValue)
                sb.AppendLine($"    - Instance Count: {metadata.Props.InstanceCount}");

            if (metadata.Props.IsClustered.HasValue)
                sb.AppendLine($"    - Clustered: {metadata.Props.IsClustered}");

            if (!string.IsNullOrEmpty(metadata.Props.BackupPolicy))
                sb.AppendLine($"    - Backup Policy: {metadata.Props.BackupPolicy}");

            if (!string.IsNullOrEmpty(metadata.Props.Region))
                sb.AppendLine($"    - Region: {metadata.Props.Region}");

            if (metadata.Props.AdditionalProps != null && metadata.Props.AdditionalProps.Count > 0)
            {
                sb.AppendLine("    - Additional Properties:");
                foreach (var prop in metadata.Props.AdditionalProps)
                {
                    sb.AppendLine($"      * {prop.Key}: {prop.Value}");
                }
            }
        }

        // Simulation Props
        if (metadata.Simulation != null)
        {
            sb.AppendLine("  Simulation Parameters:");
            sb.AppendLine($"    - Processing Time: {metadata.Simulation.ProcessingTimeMs}ms");
            sb.AppendLine($"    - Failure Rate: {metadata.Simulation.FailureRate * 100:F3}%");

            if (metadata.Simulation.QueueSize.HasValue)
                sb.AppendLine($"    - Queue Size: {metadata.Simulation.QueueSize}");

            if (metadata.Simulation.CurrentLoad.HasValue)
                sb.AppendLine($"    - Current Load: {metadata.Simulation.CurrentLoad * 100:F1}%");
        }

        // Logic - Routing và Dependencies
        if (metadata.Logic != null)
        {
            sb.AppendLine("  Routing Logic:");
            sb.AppendLine($"    - Can Receive From: {string.Join(", ", metadata.Logic.CanReceiveFrom)}");
            sb.AppendLine($"    - Can Send To: {string.Join(", ", metadata.Logic.CanSendTo)}");
        }

        // Position
        if (node.Position != null)
        {
            sb.AppendLine($"  Position: (X: {node.Position.X:F0}, Y: {node.Position.Y:F0})");
        }
    }

    /// <summary>
    /// Xây dựng mô tả cho một edge (connection)
    /// </summary>
    private void BuildEdgeDescription(StringBuilder sb, EdgeModel edge, List<SystemNode> nodes)
    {
        // Tìm source và target node
        var sourceNode = nodes.FirstOrDefault(n => n.Id == edge.Source);
        var targetNode = nodes.FirstOrDefault(n => n.Id == edge.Target);

        var sourceName = sourceNode?.Metadata.Label ?? edge.Source;
        var targetName = targetNode?.Metadata.Label ?? edge.Target;

        // Mô tả connection
        sb.AppendLine($"Connection: [{sourceName}] → [{targetName}]");
        sb.AppendLine($"  Edge ID: {edge.Id}");

        if (!string.IsNullOrEmpty(edge.Label))
        {
            sb.AppendLine($"  Label: {edge.Label}");
        }

        // Edge Data
        if (edge.Data != null)
        {
            sb.AppendLine("  Connection Details:");
            sb.AppendLine($"    - Protocol: {edge.Data.Protocol}");

            if (!string.IsNullOrEmpty(edge.Data.Auth))
                sb.AppendLine($"    - Authentication: {edge.Data.Auth}");

            sb.AppendLine($"    - Traffic Weight: {edge.Data.TrafficWeight:F2}");
            sb.AppendLine($"    - Network Latency: {edge.Data.NetworkLatency}ms");
        }
    }

    /// <summary>
    /// Xây dựng tóm tắt kiến trúc tổng thể
    /// </summary>
    private void BuildArchitectureSummary(StringBuilder sb, DiagramContent diagramData)
    {
        // Nhóm nodes theo category
        var nodesByCategory = diagramData.Nodes
            .GroupBy(n => n.Metadata.Category)
            .OrderBy(g => g.Key);

        sb.AppendLine("Components by Category:");
        foreach (var group in nodesByCategory)
        {
            sb.AppendLine($"  - {group.Key}: {group.Count()} component(s)");
            foreach (var node in group)
            {
                sb.AppendLine($"    * {node.Metadata.Label}");
            }
        }

        sb.AppendLine();

        // Thống kê technologies
        var allTechnologies = diagramData.Nodes
            .Where(n => n.Metadata.Technologies != null)
            .SelectMany(n => n.Metadata.Technologies!)
            .Distinct()
            .OrderBy(t => t);

        if (allTechnologies.Any())
        {
            sb.AppendLine("Technologies Used:");
            foreach (var tech in allTechnologies)
            {
                var count = diagramData.Nodes.Count(n =>
                    n.Metadata.Technologies != null && n.Metadata.Technologies.Contains(tech));
                sb.AppendLine($"  - {tech} (used in {count} component(s))");
            }
            sb.AppendLine();
        }

        // Thống kê protocols
        var protocols = diagramData.Edges
            .Where(e => e.Data != null)
            .Select(e => e.Data!.Protocol)
            .Distinct()
            .OrderBy(p => p);

        if (protocols.Any())
        {
            sb.AppendLine("Communication Protocols:");
            foreach (var protocol in protocols)
            {
                var count = diagramData.Edges.Count(e => e.Data?.Protocol == protocol);
                sb.AppendLine($"  - {protocol} ({count} connection(s))");
            }
            sb.AppendLine();
        }

        // Xác định entry points
        var entryPoints = diagramData.Nodes
            .Where(n => n.Metadata.Category == Domain.Enums.NodeCategory.EntryPoint)
            .ToList();

        if (entryPoints.Any())
        {
            sb.AppendLine("System Entry Points:");
            foreach (var entry in entryPoints)
            {
                sb.AppendLine($"  - {entry.Metadata.Label}");
            }
            sb.AppendLine();
        }

        // Tính toán độ phức tạp
        var totalComplexity = CalculateSystemComplexity(diagramData);
        sb.AppendLine($"System Complexity Score: {totalComplexity:F2}");
        sb.AppendLine($"  (Based on nodes, edges, and configuration complexity)");
    }

    /// <summary>
    /// Tính toán độ phức tạp của hệ thống
    /// </summary>
    private double CalculateSystemComplexity(DiagramContent diagramData)
    {
        // Công thức đơn giản: nodes + edges * 1.5 + cấu hình phức tạp
        var nodeComplexity = diagramData.Nodes.Count;
        var edgeComplexity = diagramData.Edges.Count * 1.5;

        var configComplexity = diagramData.Nodes.Sum(n =>
        {
            double score = 0;
            if (n.Metadata.Technologies?.Count > 0) score += n.Metadata.Technologies.Count * 0.5;
            if (n.Metadata.Props != null) score += 1;
            if (n.Metadata.Simulation != null) score += 1;
            if (n.Metadata.Logic != null) score += 1;
            return score;
        });

        return nodeComplexity + edgeComplexity + configComplexity;
    }
}
