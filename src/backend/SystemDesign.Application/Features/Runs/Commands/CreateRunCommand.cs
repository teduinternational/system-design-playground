using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;
using SystemDesign.Domain.Enums;

namespace SystemDesign.Application.Features.Runs.Commands;

/// <summary>
/// Command để tạo một run mới
/// </summary>
public sealed record CreateRunCommand(
    Guid ScenarioId,
    string? RunName = null,
    string? EnvironmentParams = null
) : IRequest<Result<RunDto>>;

/// <summary>
/// Handler xử lý CreateRunCommand
/// </summary>
public sealed class CreateRunHandler(IRepository<Run> runRepository, IRepository<Scenario> scenarioRepository) 
    : IRequestHandler<CreateRunCommand, Result<RunDto>>
{
    public async Task<Result<RunDto>> Handle(CreateRunCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Kiểm tra Scenario có tồn tại không
            var scenarioExists = await scenarioRepository.ExistsAsync(request.ScenarioId, cancellationToken);
            if (!scenarioExists)
                return Result<RunDto>.Failure("Scenario không tồn tại");

            // Tạo Run mới với status Pending
            var run = new Run
            {
                ScenarioId = request.ScenarioId,
                RunName = request.RunName ?? $"Run {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}",
                Status = RunStatus.Pending,
                EnvironmentParams = request.EnvironmentParams
            };

            var created = await runRepository.AddAsync(run, cancellationToken);
            await runRepository.SaveChangesAsync(cancellationToken);

            return Result<RunDto>.Success(created.ToDto());
        }
        catch (Exception ex)
        {
            return Result<RunDto>.Failure($"Lỗi khi tạo run: {ex.Message}");
        }
    }
}
