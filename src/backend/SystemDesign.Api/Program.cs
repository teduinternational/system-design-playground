using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using SystemDesign.Api.Endpoints;
using SystemDesign.Api.Middleware;
using SystemDesign.Application;
using SystemDesign.Infrastructure;
using SystemDesign.Infrastructure.Persistence;
using Scalar.AspNetCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddApplication();
builder.Services.AddInfrastructure();
builder.Services.AddPersistence(builder.Configuration);

// Cấu hình JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"] 
    ?? throw new InvalidOperationException("JWT SecretKey is not configured");
var issuer = jwtSettings["Issuer"] 
    ?? throw new InvalidOperationException("JWT Issuer is not configured");
var audience = jwtSettings["Audience"] 
    ?? throw new InvalidOperationException("JWT Audience is not configured");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = issuer,
        ValidAudience = audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero // Không cho phép token expired lệch thời gian
    };

    // Custom response cho JWT validation errors
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            if (context.Exception is SecurityTokenExpiredException)
            {
                context.Response.Headers.Append("Token-Expired", "true");
            }
            return Task.CompletedTask;
        },
        OnChallenge = context =>
        {
            // Skip default behavior để middleware tự xử lý
            context.HandleResponse();
            context.Response.StatusCode = StatusCodes.Status401Unauthorized;
            context.Response.ContentType = "application/json";
            
            var result = System.Text.Json.JsonSerializer.Serialize(new
            {
                StatusCode = 401,
                Message = context.ErrorDescription ?? "Unauthorized access. Token is missing or invalid.",
                Timestamp = DateTime.UtcNow
            });
            
            return context.Response.WriteAsync(result);
        }
    };
});

// Cấu hình Authorization với Policies
builder.Services.AddAuthorization(options =>
{
    // Policy để kiểm tra user có phải Owner của resource
    options.AddPolicy("OwnerOnly", policy => 
        policy.Requirements.Add(new SystemDesign.Api.Auth.Requirements.OwnerRequirement()));
    
    // Policy cho Admin role
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("Admin"));
    
    // Policy cho authenticated users
    options.AddPolicy("AuthenticatedUser", policy => 
        policy.RequireAuthenticatedUser());
});

// Register Authorization Handlers
builder.Services.AddSingleton<Microsoft.AspNetCore.Authorization.IAuthorizationHandler, 
    SystemDesign.Api.Auth.Handlers.OwnerAuthorizationHandler>();

// Register JWT Token Service
builder.Services.AddSingleton<SystemDesign.Api.Auth.JwtTokenService>();

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

// Initialize database and seed admin user
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    
    try
    {
        // Run database migrations (optional, for production)
        var dbContext = services.GetRequiredService<ApplicationDbContext>();
        await dbContext.Database.MigrateAsync();
        
        // Seed admin user and roles
        await AdminSeeder.InitializeAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while initializing the database");
    }
}

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

// Middleware để xử lý 401 Unauthorized response
app.UseUnauthorizedResponse();

// Authentication & Authorization - thứ tự quan trọng!
app.UseAuthentication();
app.UseAuthorization();

// Map tất cả endpoints
app.MapAuthEndpoints();
app.MapResourceAuthEndpoints();
app.MapDiagramEndpoints();
app.MapScenarioEndpoints();
app.MapRunEndpoints();
app.MapSimulationEndpoints();
app.MapComparisonEndpoints();
app.MapAIEndpoints();
app.MapMetricsEndpoints();

app.Run();