using SystemDesign.Domain.Models;

namespace SystemDesign.Domain;

/// <summary>
/// Service tính toán metrics và KPI cho hệ thống
/// </summary>
public interface IMetricsCalculatorService
{
    /// <summary>
    /// Tính toán các chỉ số đánh giá hệ thống dựa trên DiagramContent
    /// </summary>
    SystemMetrics CalculateMetrics(DiagramContent diagramContent);

    /// <summary>
    /// Tính toán "What-if" analysis - Dự đoán metrics nếu thay đổi cấu hình
    /// </summary>
    SystemMetrics CalculateWhatIfScenario(DiagramContent diagramContent, string nodeId, int newInstanceCount);
}
