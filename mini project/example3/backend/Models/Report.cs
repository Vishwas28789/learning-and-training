using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocietyFinance.API.Models
{
    /// <summary>
    /// Represents a financial report generated for the society
    /// </summary>
    [Table("Reports")]
    public class Report
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Title { get; set; }

        public DateTime GeneratedDate { get; set; }

        [Required]
        public ReportType ReportType { get; set; }

        [Column(TypeName = "decimal(12, 2)")]
        public decimal TotalIncome { get; set; }

        [Column(TypeName = "decimal(12, 2)")]
        public decimal TotalExpenses { get; set; }

        [Column(TypeName = "decimal(12, 2)")]
        public decimal NetBalance { get; set; }

        public int TotalMembers { get; set; }

        public int ActiveMembers { get; set; }

        [MaxLength(500)]
        public string Summary { get; set; }

        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }
    }

    public enum ReportType
    {
        MonthlyFinancial,
        QuarterlyFinancial,
        AnnualFinancial,
        MembershipStatus,
        PaymentAnalysis
    }
}
