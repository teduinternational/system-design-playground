using System.Text.Json.Serialization;
using SystemDesign.Api.Endpoints;
using SystemDesign.Application;
using SystemDesign.Infrastructure;
using SystemDesign.Infrastructure.Persistence;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApplication();
builder.Services.AddInfrastructure();
builder.Services.AddPersistence(builder.Configuration);

// Cấu hình JSON Serialization cho Enum
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Cấu hình OpenAPI (Swagger) cho .NET 10
builder.Services.AddOpenApi();

// Cấu hình CORS cho development
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    // Sử dụng OpenAPI UI (Swagger UI trong .NET 10)
    app.MapOpenApi();
    
    // Thêm Scalar UI (thay thế cho SwaggerUI, hiện đại hơn)
    app.MapScalarApiReference();
    
    app.UseCors();
}

app.UseHttpsRedirection();

// Map tất cả endpoints
app.MapDiagramEndpoints();
app.MapScenarioEndpoints();
app.MapRunEndpoints();
app.MapSimulationEndpoints();
app.MapComparisonEndpoints();
app.MapAIEndpoints();

app.Run();