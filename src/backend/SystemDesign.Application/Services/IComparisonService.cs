using SystemDesign.Application.DTOs;
using SystemDesign.Domain.Models;

namespace SystemDesign.Application.Services;

/// <summary>
/// Service để so sánh performance giữa các scenarios
/// </summary>
public interface IComparisonService
{
    /// <summary>
    /// So sánh 2 scenarios và trả về metrics
    /// </summary>
    Task<ComparisonResult> CompareScenarios(Guid scenario1Id, Guid scenario2Id, CancellationToken ct = default);
}
