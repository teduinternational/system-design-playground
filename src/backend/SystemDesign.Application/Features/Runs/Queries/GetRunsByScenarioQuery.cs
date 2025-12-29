using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Runs.Queries;

/// <summary>
/// Query để lấy danh sách runs của một scenario
/// </summary>
public sealed record GetRunsByScenarioQuery(Guid ScenarioId) : IRequest<Result<IEnumerable<RunDto>>>;

/// <summary>
/// Handler xử lý GetRunsByScenarioQuery
/// </summary>
public sealed class GetRunsByScenarioHandler(IRepository<Run> repository) 
    : IRequestHandler<GetRunsByScenarioQuery, Result<IEnumerable<RunDto>>>
{
    public async Task<Result<IEnumerable<RunDto>>> Handle(GetRunsByScenarioQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var runs = await repository.FindAsync(
                r => r.ScenarioId == request.ScenarioId && !r.IsDeleted,
                cancellationToken
            );

            var dtos = runs
                .OrderByDescending(r => r.CreatedAt)
                .ToDto();
            
            return Result<IEnumerable<RunDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result<IEnumerable<RunDto>>.Failure($"Lỗi khi lấy runs: {ex.Message}");
        }
    }
}
