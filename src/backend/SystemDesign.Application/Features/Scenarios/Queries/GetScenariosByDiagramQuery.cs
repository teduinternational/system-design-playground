using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Scenarios.Queries;

/// <summary>
/// Query để lấy danh sách scenarios của một diagram
/// </summary>
public sealed record GetScenariosByDiagramQuery(Guid DiagramId) : IRequest<Result<IEnumerable<ScenarioDto>>>;

/// <summary>
/// Handler xử lý GetScenariosByDiagramQuery
/// </summary>
public sealed class GetScenariosByDiagramHandler(IRepository<Scenario> repository) 
    : IRequestHandler<GetScenariosByDiagramQuery, Result<IEnumerable<ScenarioDto>>>
{
    public async Task<Result<IEnumerable<ScenarioDto>>> Handle(GetScenariosByDiagramQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var scenarios = await repository.FindAsync(
                s => s.DiagramId == request.DiagramId && !s.IsDeleted,
                cancellationToken
            );

            return Result<IEnumerable<ScenarioDto>>.Success(scenarios.ToDto());
        }
        catch (Exception ex)
        {
            return Result<IEnumerable<ScenarioDto>>.Failure($"Lỗi khi lấy scenarios: {ex.Message}");
        }
    }
}
