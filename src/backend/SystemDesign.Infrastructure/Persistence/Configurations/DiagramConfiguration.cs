using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using SystemDesign.Domain.Entities;

namespace SystemDesign.Infrastructure.Persistence.Configurations;

/// <summary>
/// Configuration cho Diagram entity
/// </summary>
public sealed class DiagramConfiguration : IEntityTypeConfiguration<Diagram>
{
    public void Configure(EntityTypeBuilder<Diagram> builder)
    {
        builder.ToTable("Diagrams");

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(d => d.Description)
            .HasMaxLength(1000);

        builder.Property(d => d.JsonData)
            .IsRequired()
            .HasColumnType("nvarchar(max)");

        builder.Property(d => d.Version)
            .IsRequired()
            .HasDefaultValue(1);

        builder.Property(d => d.CreatedBy)
            .HasMaxLength(100);

        builder.Property(d => d.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()");

        builder.Property(d => d.UpdatedAt);

        builder.Property(d => d.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        // Index cho soft delete và tìm kiếm
        builder.HasIndex(d => d.IsDeleted);
        builder.HasIndex(d => d.CreatedAt);
    }
}
