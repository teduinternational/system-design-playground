using SystemDesign.Application.Common;
using SystemDesign.Application.DTOs;
using SystemDesign.Application.Interfaces;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Application.Services;

/// <summary>
/// Service xử lý logic cho Diagram
/// Sử dụng Primary Constructor cho DI
/// </summary>
public sealed class DiagramService(IRepository<Diagram> repository) : IDiagramService
{
    public async Task<Result<DiagramDto>> CreateAsync(CreateDiagramDto dto, CancellationToken cancellationToken = default)
    {
        try
        {
            var diagram = new Diagram
            {
                Name = dto.Name,
                Description = dto.Description,
                JsonData = dto.JsonData,
                CreatedBy = dto.CreatedBy
            };

            var created = await repository.AddAsync(diagram, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return Result<DiagramDto>.Success(MapToDto(created));
        }
        catch (Exception ex)
        {
            return Result<DiagramDto>.Failure($"Lỗi khi tạo diagram: {ex.Message}");
        }
    }

    public async Task<Result<DiagramDto>> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var diagram = await repository.GetByIdAsync(id, cancellationToken);
            
            if (diagram == null || diagram.IsDeleted)
                return Result<DiagramDto>.Failure("Không tìm thấy diagram");

            return Result<DiagramDto>.Success(MapToDto(diagram));
        }
        catch (Exception ex)
        {
            return Result<DiagramDto>.Failure($"Lỗi khi lấy diagram: {ex.Message}");
        }
    }

    public async Task<Result<IEnumerable<DiagramDto>>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var diagrams = await repository.GetAllAsync(cancellationToken);
            var activeDiagrams = diagrams
                .Where(d => !d.IsDeleted)
                .Select(MapToDto);

            return Result<IEnumerable<DiagramDto>>.Success(activeDiagrams);
        }
        catch (Exception ex)
        {
            return Result<IEnumerable<DiagramDto>>.Failure($"Lỗi khi lấy danh sách diagram: {ex.Message}");
        }
    }

    public async Task<Result<IEnumerable<DiagramDto>>> GetByUserAsync(string userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var diagrams = await repository.FindAsync(
                d => !d.IsDeleted && d.CreatedBy == userId,
                cancellationToken
            );
            
            var dtos = diagrams.Select(MapToDto);
            return Result<IEnumerable<DiagramDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result<IEnumerable<DiagramDto>>.Failure($"Lỗi khi lấy diagram theo user: {ex.Message}");
        }
    }

    public async Task<Result<IEnumerable<DiagramDto>>> SearchByNameAsync(string keyword, CancellationToken cancellationToken = default)
    {
        try
        {
            var diagrams = await repository.FindAsync(
                d => !d.IsDeleted && d.Name.Contains(keyword),
                cancellationToken
            );
            
            var dtos = diagrams.Select(MapToDto);
            return Result<IEnumerable<DiagramDto>>.Success(dtos);
        }
        catch (Exception ex)
        {
            return Result<IEnumerable<DiagramDto>>.Failure($"Lỗi khi tìm kiếm diagram: {ex.Message}");
        }
    }

    public async Task<Result<DiagramDto>> UpdateAsync(Guid id, UpdateDiagramDto dto, CancellationToken cancellationToken = default)
    {
        try
        {
            var diagram = await repository.GetByIdAsync(id, cancellationToken);
            
            if (diagram == null || diagram.IsDeleted)
                return Result<DiagramDto>.Failure("Không tìm thấy diagram");

            diagram.Name = dto.Name;
            diagram.Description = dto.Description;
            diagram.JsonData = dto.JsonData;
            diagram.Version++;
            diagram.UpdatedAt = DateTime.UtcNow;

            await repository.UpdateAsync(diagram, cancellationToken);
            await repository.SaveChangesAsync(cancellationToken);

            return Result<DiagramDto>.Success(MapToDto(diagram));
        }
        catch (Exception ex)
        {
            return Result<DiagramDto>.Failure($"Lỗi khi cập nhật diagram: {ex.Message}");
        }
    }

    public async Task<Result> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        try
        {
            var diagram = await repository.GetByIdAsync(id, cancellationToken);
            
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

    private static DiagramDto MapToDto(Diagram diagram) => new()
    {
        Id = diagram.Id,
        Name = diagram.Name,
        Description = diagram.Description,
        JsonData = diagram.JsonData,
        Version = diagram.Version,
        CreatedBy = diagram.CreatedBy,
        CreatedAt = diagram.CreatedAt,
        UpdatedAt = diagram.UpdatedAt
    };
}
