using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Diagrams.Commands;

/// <summary>
/// Command để cập nhật diagram
/// </summary>
public sealed record UpdateDiagramCommand(
    Guid Id,
    string Name,
    string? Description,
    string JsonData
) : IRequest<Result<DiagramDto>>;

/// <summary>
/// Handler xử lý UpdateDiagramCommand
/// </summary>
public sealed class UpdateDiagramHandler(IRepository<Diagram> repository) 
    : IRequestHandler<UpdateDiagramCommand, Result<DiagramDto>>
{
    public async Task<Result<DiagramDto>> Handle(UpdateDiagramCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var diagram = await repository.GetByIdAsync(request.Id, cancellationToken);
            
            if (diagram == null || diagram.IsDeleted)
                return Result<DiagramDto>.Failure("Không tìm thấy diagram");

            diagram.Name = request.Name;
            diagram.Description = request.Description;
            diagram.JsonData = request.JsonData;
            diagram.Version++;
            diagram.UpdatedAt = DateTime.UtcNow;

            await repository.UpdateAsync(diagram, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return Result<DiagramDto>.Success(diagram.ToDto());
        }
        catch (Exception ex)
        {
            return Result<DiagramDto>.Failure($"Lỗi khi cập nhật diagram: {ex.Message}");
        }
    }
}
