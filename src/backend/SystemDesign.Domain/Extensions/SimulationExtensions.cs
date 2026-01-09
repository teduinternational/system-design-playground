using SystemDesign.Domain.Models;

namespace SystemDesign.Domain.Extensions;

/// <summary>
/// Extension methods để truy cập các thuộc tính simulation từ NodeModel và EdgeModel
/// </summary>
public static class SimulationExtensions
{
    /// <summary>
    /// Lấy latency cơ bản của node từ Specs.LatencyBase
    /// </summary>
    public static double GetLatencyMs(this NodeModel node) 
        => node.Metadata.Specs.LatencyBase;

    /// <summary>
    /// Lấy jitter (biến động latency) của node từ Simulation.ProcessingTimeMs
    /// Jitter = 10% của ProcessingTimeMs nếu có, ngược lại = 0
    /// </summary>
    public static double? GetJitterMs(this NodeModel node) 
        => node.Metadata.Simulation != null 
            ? node.Metadata.Simulation.ProcessingTimeMs * 0.1 
            : null;

    /// <summary>
    /// Kiểm tra node có phải là Entry Point không
    /// </summary>
    public static bool IsEntryPoint(this NodeModel node) 
        => node.Metadata.Category == Enums.NodeCategory.EntryPoint;

    /// <summary>
    /// Lấy capacity (throughput tối đa) của node từ Specs.MaxThroughput
    /// </summary>
    public static double? GetCapacity(this NodeModel node) 
        => node.Metadata.Specs.MaxThroughput;

    /// <summary>
    /// Lấy network latency của edge từ EdgeData.NetworkLatency
    /// </summary>
    public static double GetLatencyMs(this EdgeModel edge) 
        => edge.Data?.NetworkLatency ?? 0;

    /// <summary>
    /// Lấy jitter của edge (hiện tại mặc định = 0)
    /// </summary>
    public static double? GetJitterMs(this EdgeModel edge) 
        => null;
}
