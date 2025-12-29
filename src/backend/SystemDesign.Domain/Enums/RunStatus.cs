namespace SystemDesign.Domain.Enums;

/// <summary>
/// Trạng thái của một lần chạy simulation
/// </summary>
public enum RunStatus
{
    Pending = 0,
    Processing = 1,
    Completed = 2,
    Failed = 3,
    Cancelled = 4
}
