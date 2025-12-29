using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuration cho Run entity
/// </summary>
public sealed class RunConfiguration : IEntityTypeConfiguration<Run>
{
    public void Configure(EntityTypeBuilder<Run> builder)
    {
        builder.ToTable("Runs");

        builder.HasKey(r => r.Id);

        builder.Property(r => r.ScenarioId)
            .IsRequired();

        builder.Property(r => r.RunName)
            .HasMaxLength(200);

        builder.Property(r => r.Status)
            .IsRequired()
            .HasConversion<int>();

        builder.Property(r => r.StartedAt);

        builder.Property(r => r.CompletedAt);

        builder.Property(r => r.DurationMs);

        builder.Property(r => r.AverageLatencyMs);

        builder.Property(r => r.ThroughputRps);

        builder.Property(r => r.SuccessfulRequests);

        builder.Property(r => r.FailedRequests);

        builder.Property(r => r.ErrorRate);

        builder.Property(r => r.EnvironmentParams)
            .HasColumnType("nvarchar(max)");

        builder.Property(r => r.ResultJson)
            .HasColumnType("nvarchar(max)");

        builder.Property(r => r.ErrorMessage)
            .HasMaxLength(2000);

        builder.Property(r => r.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(r => r.UpdatedAt);

        builder.Property(r => r.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        // Relationships
        builder.HasOne(r => r.Scenario)
            .WithMany()
            .HasForeignKey(r => r.ScenarioId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(r => r.ScenarioId);
        builder.HasIndex(r => r.Status);
        builder.HasIndex(r => r.CreatedAt);
        builder.HasIndex(r => r.IsDeleted);
    }
}
