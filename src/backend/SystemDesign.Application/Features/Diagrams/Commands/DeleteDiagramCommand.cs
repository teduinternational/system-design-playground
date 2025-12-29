using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Diagrams.Commands;

/// <summary>
/// Command để xóa diagram (soft delete)
/// </summary>
public sealed record DeleteDiagramCommand(Guid Id) : IRequest<Result>;

/// <summary>
/// Handler xử lý DeleteDiagramCommand
/// </summary>
public sealed class DeleteDiagramHandler(IRepository<Diagram> repository) 
    : IRequestHandler<DeleteDiagramCommand, Result>
{
    public async Task<Result> Handle(DeleteDiagramCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var diagram = await repository.GetByIdAsync(request.Id, cancellationToken);
            
            if (diagram == null || diagram.IsDeleted)
                return Result.Failure("Không tìm thấy diagram");

            // Soft delete
            diagram.IsDeleted = true;
            diagram.UpdatedAt = DateTime.UtcNow;

            await repository.UpdateAsync(diagram, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure($"Lỗi khi xóa diagram: {ex.Message}");
        }
    }
}
