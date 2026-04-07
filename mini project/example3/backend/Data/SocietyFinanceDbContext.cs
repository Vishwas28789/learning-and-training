using Microsoft.EntityFrameworkCore;
using SocietyFinance.API.Models;

namespace SocietyFinance.API.Data
{
    /// <summary>
    /// Entity Framework Core DbContext for Society Financial Management System
    /// </summary>
    public class SocietyFinanceDbContext : DbContext
    {
        public SocietyFinanceDbContext(DbContextOptions<SocietyFinanceDbContext> options)
            : base(options)
        {
        }

        // DbSets
        public DbSet<Member> Members { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<AnomalyAlert> AnomalyAlerts { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Member entity
            modelBuilder.Entity<Member>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Status).HasConversion<string>();

                // Relationships
                entity.HasMany(e => e.Payments)
                    .WithOne(p => p.Member)
                    .HasForeignKey(p => p.MemberId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Payment entity
            modelBuilder.Entity<Payment>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.PaymentType).HasConversion<string>();
                entity.Property(e => e.Status).HasConversion<string>();
                entity.HasIndex(e => e.TransactionReference).IsUnique();
            });

            // Configure Expense entity
            modelBuilder.Entity<Expense>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Amount).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.Category).HasConversion<string>();
                entity.Property(e => e.Status).HasConversion<string>();
            });

            // Configure Report entity
            modelBuilder.Entity<Report>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalIncome).HasColumnType("decimal(12, 2)");
                entity.Property(e => e.TotalExpenses).HasColumnType("decimal(12, 2)");
                entity.Property(e => e.NetBalance).HasColumnType("decimal(12, 2)");
                entity.Property(e => e.ReportType).HasConversion<string>();
            });

            // Configure AnomalyAlert entity
            modelBuilder.Entity<AnomalyAlert>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.AnomalousValue).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.AnomalyType).HasConversion<string>();
                entity.Property(e => e.Severity).HasConversion<string>();
            });
        }
    }
}
