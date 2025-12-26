using System.Text.Json;
using System.Text.Json.Serialization;

namespace SystemDesign.Domain.Configuration;

/// <summary>
/// JSON Serialization Options cho toàn project - dùng camelCase
/// </summary>
public static class JsonConfig
{
    /// <summary>
    /// Default options với camelCase naming policy
    /// </summary>
    public static JsonSerializerOptions DefaultOptions => new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = true,
        Converters =
        {
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
        }
    };
    
    /// <summary>
    /// Compact options - không indent
    /// </summary>
    public static JsonSerializerOptions CompactOptions => new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
        WriteIndented = false,
        Converters =
        {
            new JsonStringEnumConverter(JsonNamingPolicy.CamelCase)
        }
    };
}
