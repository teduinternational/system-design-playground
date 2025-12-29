using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Diagrams.Commands;

/// <summary>
/// Command để tạo diagram mới
/// </summary>
public sealed record CreateDiagramCommand(
    string Name,
    string? Description,
    string JsonData,
    string? CreatedBy
) : IRequest<Result<DiagramDto>>;

/// <summary>
/// Handler xử lý CreateDiagramCommand - sử dụng Primary Constructor
/// </summary>
public sealed class CreateDiagramHandler(IRepository<Diagram> repository) 
    : IRequestHandler<CreateDiagramCommand, Result<DiagramDto>>
{
    public async Task<Result<DiagramDto>> Handle(CreateDiagramCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var diagram = new Diagram
            {
                Name = request.Name,
                Description = request.Description,
                JsonData = request.JsonData,
                CreatedBy = request.CreatedBy
            };

            var created = await repository.AddAsync(diagram, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return Result<DiagramDto>.Success(created.ToDto());
        }
        catch (Exception ex)
        {
            return Result<DiagramDto>.Failure($"Lỗi khi tạo diagram: {ex.Message}");
        }
    }
}
