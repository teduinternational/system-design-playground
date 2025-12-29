using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Diagrams.Queries;

/// <summary>
/// Query để search diagrams theo tên
/// </summary>
public sealed record SearchDiagramsByNameQuery(string Keyword) : IRequest<Result<IEnumerable<DiagramDto>>>;

/// <summary>
/// Handler xử lý SearchDiagramsByNameQuery
/// </summary>
public sealed class SearchDiagramsByNameHandler(IRepository<Diagram> repository) 
    : IRequestHandler<SearchDiagramsByNameQuery, Result<IEnumerable<DiagramDto>>>
{
    public async Task<Result<IEnumerable<DiagramDto>>> Handle(SearchDiagramsByNameQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var diagrams = await repository.FindAsync(
                d => !d.IsDeleted && d.Name.Contains(request.Keyword),
                cancellationToken
            );
            
            return Result<IEnumerable<DiagramDto>>.Success(diagrams.ToDto());
        }
        catch (Exception ex)
        {
            return Result<IEnumerable<DiagramDto>>.Failure($"Lỗi khi tìm kiếm diagram: {ex.Message}");
        }
    }
}
