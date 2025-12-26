namespace SystemDesign.Domain.Entities;

/// <summary>
/// Thực thể lưu trữ bản vẽ và JSON của từng scenario/version
/// </summary>
public sealed class Scenario : BaseEntity
{
    public Guid DiagramId { get; init; }
    
    /// <summary>
    /// Id của phiên bản cha (để tạo tree version)
    /// </summary>
    public Guid? ParentScenarioId { get; set; }
    
    public required string Name { get; set; }
    
    /// <summary>
    /// Version tag, ví dụ: "1.0.1"
    /// </summary>
    public required string VersionTag { get; set; }
    
    /// <summary>
    /// Mô tả ngắn gọn thay đổi
    /// </summary>
    public string ChangeLog { get; set; } = string.Empty;
    
    /// <summary>
    /// Nội dung JSON của diagram (nodes, edges)
    /// </summary>
    public required string ContentJson { get; set; }
    
    /// <summary>
    /// True nếu là bản lưu trữ (read-only), False nếu là bản đang edit
    /// </summary>
    public bool IsSnapshot { get; set; }
    
    // Navigation property
    public Diagram? Diagram { get; set; }
}
