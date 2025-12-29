namespace SystemDesign.Domain.Entities;

/// <summary>
/// Entity đại diện cho một diagram (project) trong hệ thống
/// </summary>
public sealed class Diagram : BaseEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }

    /// <summary>
    /// User ID của người tạo hoặc owner
    /// </summary>
    public Guid? UserId { get; set; }

    /// <summary>
    /// Người tạo hoặc owner của diagram
    /// </summary>
    public string? CreatedBy { get; set; }

    // Lưu trữ JSON của sơ đồ từ React Flow
    public required string JsonData { get; set; }

    public int Version { get; set; } = 1;


    /// <summary>
    /// Quan hệ: 1 Diagram có nhiều Scenarios (versions)
    /// </summary>
    public ICollection<Scenario> Scenarios { get; set; } = new List<Scenario>();
}
