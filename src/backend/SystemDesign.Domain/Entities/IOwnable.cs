namespace SystemDesign.Domain.Entities;

/// <summary>
/// Interface cho các resource có owner
/// </summary>
public interface IOwnable
{
    string OwnerId { get; }
}