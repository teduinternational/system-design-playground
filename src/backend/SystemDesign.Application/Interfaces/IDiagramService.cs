using SystemDesign.Application.DTOs;
using SystemDesign.Application.Common;

namespace SystemDesign.Application.Interfaces;

/// <summary>
/// Interface cho Diagram Service
/// </summary>
public interface IDiagramService
{
    Task<Result<DiagramDto>> CreateAsync(CreateDiagramDto dto, CancellationToken cancellationToken = default);
    Task<Result<DiagramDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<DiagramDto>>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<DiagramDto>>> GetByUserAsync(string userId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<DiagramDto>>> SearchByNameAsync(string keyword, CancellationToken cancellationToken = default);
    Task<Result<DiagramDto>> UpdateAsync(Guid id, UpdateDiagramDto dto, CancellationToken cancellationToken = default);
    Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
