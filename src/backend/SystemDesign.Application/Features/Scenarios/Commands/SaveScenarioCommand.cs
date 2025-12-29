using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Scenarios.Commands;

/// <summary>
/// Command để lưu một scenario mới
/// </summary>
public sealed record SaveScenarioCommand(
    Guid DiagramId,
    string Name,
    string VersionTag,
    string ContentJson,
    string ChangeLog = "",
    Guid? ParentScenarioId = null,
    bool IsSnapshot = false
) : IRequest<Result<ScenarioDto>>;

/// <summary>
/// Handler xử lý SaveScenarioCommand - sử dụng Primary Constructor
/// </summary>
public sealed class SaveScenarioHandler(IRepository<Scenario> scenarioRepository, IRepository<Diagram> diagramRepository) 
    : IRequestHandler<SaveScenarioCommand, Result<ScenarioDto>>
{
    public async Task<Result<ScenarioDto>> Handle(SaveScenarioCommand request, CancellationToken cancellationToken)
    {
        try
        {
            // Kiểm tra Diagram có tồn tại không
            var diagramExists = await diagramRepository.ExistsAsync(request.DiagramId, cancellationToken);
            if (!diagramExists)
                return Result<ScenarioDto>.Failure("Diagram không tồn tại");

            // Tạo Scenario mới
            var scenario = new Scenario
            {
                DiagramId = request.DiagramId,
                Name = request.Name,
                VersionTag = request.VersionTag,
                ContentJson = request.ContentJson,
                ChangeLog = request.ChangeLog,
                ParentScenarioId = request.ParentScenarioId,
                IsSnapshot = request.IsSnapshot
            };

            var created = await scenarioRepository.AddAsync(scenario, cancellationToken);
            await scenarioRepository.SaveChangesAsync(cancellationToken);

            return Result<ScenarioDto>.Success(created.ToDto());
        }
        catch (Exception ex)
        {
            return Result<ScenarioDto>.Failure($"Lỗi khi lưu scenario: {ex.Message}");
        }
    }
}
