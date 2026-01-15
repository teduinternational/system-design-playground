using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Diagrams.Queries;

/// <summary>
/// Query để lấy diagrams theo user
/// </summary>
public sealed record GetDiagramsByUserQuery(string UserId) : IRequest<Result<IEnumerable<DiagramDto>>>;

/// <summary>
/// Handler xử lý GetDiagramsByUserQuery
/// </summary>
public sealed class GetDiagramsByUserHandler(IRepository<Diagram> repository) 
    : IRequestHandler<GetDiagramsByUserQuery, Result<IEnumerable<DiagramDto>>>
{
    public async Task<Result<IEnumerable<DiagramDto>>> Handle(GetDiagramsByUserQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var diagrams = await repository.FindAsync(
                d => !d.IsDeleted && d.OwnerId == request.UserId,
                cancellationToken
            );
            
            return Result<IEnumerable<DiagramDto>>.Success(diagrams.ToDto());
        }
        catch (Exception ex)
        {
            return Result<IEnumerable<DiagramDto>>.Failure($"Lỗi khi lấy diagram theo user: {ex.Message}");
        }
    }
}
