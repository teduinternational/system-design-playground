using Microsoft.Extensions.DependencyInjection;
using SystemDesign.Application.Features.AI;
using SystemDesign.Application.Services;

namespace SystemDesign.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Đăng ký MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(DependencyInjection).Assembly));
        
        // Đăng ký Simulation Engine
        services.AddScoped<ISimulationEngine, SimulationEngine>();

        // Đăng ký AI Services
        services.AddScoped<PromptBuilder>();
        services.AddScoped<ArchitectureAnalysisService>();

        return services;
    }
}
