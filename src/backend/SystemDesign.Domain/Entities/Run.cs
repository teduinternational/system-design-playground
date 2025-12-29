using SystemDesign.Domain.Enums;

namespace SystemDesign.Domain.Entities;

/// <summary>
/// Entity lưu trữ kết quả của một lần simulation
/// </summary>
public sealed class Run : BaseEntity
{
    public Guid ScenarioId { get; init; }
    
    /// <summary>
    /// Tên mô tả cho lần chạy này
    /// </summary>
    public string? RunName { get; set; }
    
    /// <summary>
    /// Trạng thái của lần chạy
    /// </summary>
    public RunStatus Status { get; set; } = RunStatus.Pending;
    
    /// <summary>
    /// Thời gian bắt đầu simulation
    /// </summary>
    public DateTime? StartedAt { get; set; }
    
    /// <summary>
    /// Thời gian kết thúc simulation
    /// </summary>
    public DateTime? CompletedAt { get; set; }
    
    /// <summary>
    /// Tổng thời gian chạy (milliseconds)
    /// </summary>
    public long? DurationMs { get; set; }
    
    /// <summary>
    /// Latency trung bình (milliseconds)
    /// </summary>
    public double? AverageLatencyMs { get; set; }
    
    /// <summary>
    /// Throughput (requests per second)
    /// </summary>
    public double? ThroughputRps { get; set; }
    
    /// <summary>
    /// Số lượng request thành công
    /// </summary>
    public int? SuccessfulRequests { get; set; }
    
    /// <summary>
    /// Số lượng request thất bại
    /// </summary>
    public int? FailedRequests { get; set; }
    
    /// <summary>
    /// Tỉ lệ lỗi (%)
    /// </summary>
    public double? ErrorRate { get; set; }
    
    /// <summary>
    /// Các tham số môi trường dưới dạng JSON
    /// </summary>
    public string? EnvironmentParams { get; set; }
    
    /// <summary>
    /// Kết quả chi tiết dưới dạng JSON (metrics của từng node)
    /// </summary>
    public string? ResultJson { get; set; }
    
    /// <summary>
    /// Thông báo lỗi nếu có
    /// </summary>
    public string? ErrorMessage { get; set; }
    
    // Navigation property
    public Scenario? Scenario { get; set; }
}
