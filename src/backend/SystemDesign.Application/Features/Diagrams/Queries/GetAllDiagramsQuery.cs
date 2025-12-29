using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Diagrams.Queries;

/// <summary>
/// Query để lấy tất cả diagrams
/// </summary>
public sealed record GetAllDiagramsQuery() : IRequest<Result<IEnumerable<DiagramDto>>>;

/// <summary>
/// Handler xử lý GetAllDiagramsQuery
/// </summary>
public sealed class GetAllDiagramsHandler(IRepository<Diagram> repository) 
    : IRequestHandler<GetAllDiagramsQuery, Result<IEnumerable<DiagramDto>>>
{
    public async Task<Result<IEnumerable<DiagramDto>>> Handle(GetAllDiagramsQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var diagrams = await repository.GetAllAsync(cancellationToken);
            var activeDiagrams = diagrams
                .Where(d => !d.IsDeleted)
                .ToDto();

            return Result<IEnumerable<DiagramDto>>.Success(activeDiagrams);
        }
        catch (Exception ex)
        {
            return Result<IEnumerable<DiagramDto>>.Failure($"Lỗi khi lấy danh sách diagram: {ex.Message}");
        }
    }
}
