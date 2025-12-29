using MediatR;
using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Mappings;
using SystemDesign.Domain;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Features.Runs.Queries;

/// <summary>
/// Query để lấy một run theo ID
/// </summary>
public sealed record GetRunByIdQuery(Guid Id) : IRequest<Result<RunDto>>;

/// <summary>
/// Handler xử lý GetRunByIdQuery
/// </summary>
public sealed class GetRunByIdHandler(IRepository<Run> repository) 
    : IRequestHandler<GetRunByIdQuery, Result<RunDto>>
{
    public async Task<Result<RunDto>> Handle(GetRunByIdQuery request, CancellationToken cancellationToken)
    {
        try
        {
            var run = await repository.GetByIdAsync(request.Id, cancellationToken);
            if (run == null || run.IsDeleted)
                return Result<RunDto>.Failure("Run không tồn tại");

            return Result<RunDto>.Success(run.ToDto());
        }
        catch (Exception ex)
        {
            return Result<RunDto>.Failure($"Lỗi khi lấy run: {ex.Message}");
        }
    }
}
