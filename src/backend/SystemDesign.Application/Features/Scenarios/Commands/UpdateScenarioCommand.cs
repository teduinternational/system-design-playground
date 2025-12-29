using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Scenarios.Commands;

/// <summary>
/// Command để cập nhật một scenario
/// </summary>
public sealed record UpdateScenarioCommand(
    Guid Id,
    string Name,
    string ContentJson,
    string ChangeLog = ""
) : IRequest<Result<ScenarioDto>>;

/// <summary>
/// Handler xử lý UpdateScenarioCommand
/// </summary>
public sealed class UpdateScenarioHandler(IRepository<Scenario> repository) 
    : IRequestHandler<UpdateScenarioCommand, Result<ScenarioDto>>
{
    public async Task<Result<ScenarioDto>> Handle(UpdateScenarioCommand request, CancellationToken cancellationToken)
    {
        try
        {
            var scenario = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (scenario == null || scenario.IsDeleted)
                return Result<ScenarioDto>.Failure("Scenario không tồn tại");

            scenario.Name = request.Name;
            scenario.ContentJson = request.ContentJson;
            scenario.ChangeLog = request.ChangeLog;
            scenario.UpdatedAt = DateTime.UtcNow;

            await repository.UpdateAsync(scenario, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return Result<ScenarioDto>.Success(scenario.ToDto());
        }
        catch (Exception ex)
        {
            return Result<ScenarioDto>.Failure($"Lỗi khi cập nhật scenario: {ex.Message}");
        }
    }
}
