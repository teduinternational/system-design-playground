using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuration cho Scenario entity
/// </summary>
public sealed class ScenarioConfiguration : IEntityTypeConfiguration<Scenario>
{
    public void Configure(EntityTypeBuilder<Scenario> builder)
    {
        builder.ToTable("Scenarios");

        builder.HasKey(s => s.Id);

        builder.Property(s => s.DiagramId)
            .IsRequired();

        builder.Property(s => s.ParentScenarioId);

        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(s => s.VersionTag)
            .IsRequired()
            .HasMaxLength(50);

        builder.Property(s => s.ChangeLog)
            .HasMaxLength(1000);

        builder.Property(s => s.ContentJson)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.Property(s => s.IsSnapshot)
            .IsRequired()
            .HasDefaultValue(false);

        builder.Property(s => s.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(s => s.UpdatedAt);

        builder.Property(s => s.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        // Relationships
        builder.HasOne(s => s.Diagram)
            .WithMany(d => d.Scenarios)
            .HasForeignKey(s => s.DiagramId)
            .OnDelete(DeleteBehavior.Cascade);

        // Indexes
        builder.HasIndex(s => s.DiagramId);
        builder.HasIndex(s => s.ParentScenarioId);
        builder.HasIndex(s => s.IsDeleted);
        builder.HasIndex(s => s.CreatedAt);
    }
}
