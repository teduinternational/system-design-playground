using Microsoft.AspNetCore.Identity;

namespace SystemDesign.Domain.Entities;

/// <summary>
/// Application User - kế thừa IdentityUser để mở rộng thêm properties
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// Tên đầy đủ của user
    /// </summary>
    public string? FullName { get; set; }

    /// <summary>
    /// Ngày tạo tài khoản
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Ngày cập nhật cuối
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// Avatar URL
    /// </summary>
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Có active hay không
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Navigation properties
    // public ICollection<Diagram> Diagrams { get; set; } = [];
}
