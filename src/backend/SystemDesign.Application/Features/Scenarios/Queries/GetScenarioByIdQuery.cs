using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Scenarios.Queries;

/// <summary>
/// Query để lấy một scenario theo ID
/// </summary>
public sealed record GetScenarioByIdQuery(Guid Id) : IRequest<Result<ScenarioDto>>;

/// <summary>
/// Handler xử lý GetScenarioByIdQuery
/// </summary>
public sealed class GetScenarioByIdHandler(IRepository<Scenario> repository) 
    : IRequestHandler<GetScenarioByIdQuery, Result<ScenarioDto>>
{
    public async Task<Result<ScenarioDto>> Handle(GetScenarioByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var scenario = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (scenario == null || scenario.IsDeleted)
                return Result<ScenarioDto>.Failure("Scenario không tồn tại");

            return Result<ScenarioDto>.Success(scenario.ToDto());
        }
        catch (Exception ex)
        {
            return Result<ScenarioDto>.Failure($"Lỗi khi lấy scenario: {ex.Message}");
        }
    }
}
