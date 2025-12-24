using Microsoft.Extensions.DependencyInjection;
using SystemDesign.Application.Interfaces;
using SystemDesign.Application.Services;

namespace SystemDesign.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Đăng ký services
        services.AddScoped<IDiagramService, DiagramService>();

        return services;
    }
}
