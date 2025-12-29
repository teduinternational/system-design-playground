using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;
using SystemDesign.Domain.Enums;

namespace SystemDesign.Application.Features.Runs.Commands;

/// <summary>
/// Command để cập nhật trạng thái của một run
/// </summary>
public sealed record UpdateRunStatusCommand(
    Guid Id,
    RunStatus Status,
    double? AverageLatencyMs = null,
    double? ThroughputRps = null,
    int? SuccessfulRequests = null,
    int? FailedRequests = null,
    double? ErrorRate = null,
    string? ResultJson = null,
    string? ErrorMessage = null
) : IRequest<Result<RunDto>>;

/// <summary>
/// Handler xử lý UpdateRunStatusCommand
/// </summary>
public sealed class UpdateRunStatusHandler(IRepository<Run> repository) 
    : IRequestHandler<UpdateRunStatusCommand, Result<RunDto>>
{
    public async Task<Result<RunDto>> Handle(UpdateRunStatusCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var run = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (run == null || run.IsDeleted)
                return Result<RunDto>.Failure("Run không tồn tại");

            // Cập nhật trạng thái
            var previousStatus = run.Status;
            run.Status = request.Status;

            // Nếu chuyển sang Processing, set StartedAt
            if (previousStatus == RunStatus.Pending && request.Status == RunStatus.Processing)
            {
                run.StartedAt = DateTime.UtcNow;
            }

            // Nếu chuyển sang Completed hoặc Failed, set CompletedAt và DurationMs
            if ((request.Status == RunStatus.Completed || request.Status == RunStatus.Failed) && run.StartedAt.HasValue)
            {
                run.CompletedAt = DateTime.UtcNow;
                run.DurationMs = (long)(run.CompletedAt.Value - run.StartedAt.Value).TotalMilliseconds;
            }

            // Cập nhật metrics
            if (request.AverageLatencyMs.HasValue)
                run.AverageLatencyMs = request.AverageLatencyMs.Value;
            if (request.ThroughputRps.HasValue)
                run.ThroughputRps = request.ThroughputRps.Value;
            if (request.SuccessfulRequests.HasValue)
                run.SuccessfulRequests = request.SuccessfulRequests.Value;
            if (request.FailedRequests.HasValue)
                run.FailedRequests = request.FailedRequests.Value;
            if (request.ErrorRate.HasValue)
                run.ErrorRate = request.ErrorRate.Value;
            if (!string.IsNullOrEmpty(request.ResultJson))
                run.ResultJson = request.ResultJson;
            if (!string.IsNullOrEmpty(request.ErrorMessage))
                run.ErrorMessage = request.ErrorMessage;

            run.UpdatedAt = DateTime.UtcNow;

            await repository.UpdateAsync(run, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return Result<RunDto>.Success(run.ToDto());
        }
        catch (Exception ex)
        {
            return Result<RunDto>.Failure($"Lỗi khi cập nhật run: {ex.Message}");
        }
    }
}
