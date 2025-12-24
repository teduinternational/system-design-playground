namespace SystemDesign.Domain.Entities;

/// <summary>
/// Entity đại diện cho một diagram trong hệ thống
/// </summary>
public sealed class Diagram : BaseEntity
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    
    /// <summary>
    /// Lưu trữ dữ liệu diagram dưới dạng JSON (React Flow nodes, edges)
    /// </summary>
    public required string JsonData { get; set; }
    
    /// <summary>
    /// Version của diagram để theo dõi thay đổi
    /// </summary>
    public int Version { get; set; } = 1;
    
    /// <summary>
    /// Người tạo hoặc owner của diagram
    /// </summary>
    public string? CreatedBy { get; set; }
}
