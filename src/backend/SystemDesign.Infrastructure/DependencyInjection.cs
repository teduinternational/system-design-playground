using Microsoft.Extensions.DependencyInjection;
using SystemDesign.Domain;
using SystemDesign.Infrastructure.Services;

namespace SystemDesign.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddScoped<IAIService, AIService>();
        
        return services;
    }
}
