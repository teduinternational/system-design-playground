using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Diagrams.Queries;

/// <summary>
/// Query để lấy diagram theo ID
/// </summary>
public sealed record GetDiagramByIdQuery(Guid Id) : IRequest<Result<DiagramDto>>;

/// <summary>
/// Handler xử lý GetDiagramByIdQuery
/// </summary>
public sealed class GetDiagramByIdHandler(IRepository<Diagram> repository) 
    : IRequestHandler<GetDiagramByIdQuery, Result<DiagramDto>>
{
    public async Task<Result<DiagramDto>> Handle(GetDiagramByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var diagram = await repository.GetByIdAsync(request.Id, cancellationToken);
            
            if (diagram == null || diagram.IsDeleted)
                return Result<DiagramDto>.Failure("Không tìm thấy diagram");

            return Result<DiagramDto>.Success(diagram.ToDto());
        }
        catch (Exception ex)
        {
            return Result<DiagramDto>.Failure($"Lỗi khi lấy diagram: {ex.Message}");
        }
    }
}
