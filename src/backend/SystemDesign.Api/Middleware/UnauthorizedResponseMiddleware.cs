namespace SystemDesign.Api.Middleware;

/// <summary>
/// Middleware để xử lý 401 Unauthorized và trả về JSON response chuẩn
/// </summary>
public class UnauthorizedResponseMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        await next(context);

        // Kiểm tra nếu response là 401 Unauthorized
        if (context.Response.StatusCode == StatusCodes.Status401Unauthorized 
            && !context.Response.HasStarted)
        {
            context.Response.ContentType = "application/json";

            var response = new
            {
                StatusCode = 401,
                Message = "Unauthorized access. Please provide a valid authentication token.",
                Timestamp = DateTime.UtcNow,
                Path = context.Request.Path.ToString()
            };

            await context.Response.WriteAsJsonAsync(response);
        }
    }
}

/// <summary>
/// Extension method để đăng ký Middleware
/// </summary>
public static class UnauthorizedResponseMiddlewareExtensions
{
    public static IApplicationBuilder UseUnauthorizedResponse(this IApplicationBuilder builder)
    {
        return builder.UseMiddleware<UnauthorizedResponseMiddleware>();
    }
}
