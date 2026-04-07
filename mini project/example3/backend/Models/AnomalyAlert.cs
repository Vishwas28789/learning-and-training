using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocietyFinance.API.Models
{
    /// <summary>
    /// Represents a detected anomaly in financial transactions
    /// </summary>
    [Table("AnomalyAlerts")]
    public class AnomalyAlert
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int MemberId { get; set; }

        [Required]
        public AnomalyType AnomalyType { get; set; }

        [Required]
        [MaxLength(500)]
        public string Description { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal AnomalousValue { get; set; }

        public DateTime DetectedDate { get; set; }

        [Required]
        public AlertSeverity Severity { get; set; }

        public bool IsResolved { get; set; }

        [MaxLength(500)]
        public string Resolution { get; set; }

        public DateTime? ResolvedDate { get; set; }

        // Foreign key
        [ForeignKey(nameof(MemberId))]
        public Member Member { get; set; }
    }

    public enum AnomalyType
    {
        UnusuallyHighPayment,
        MissedPayment,
        DuplicatePayment,
        NegativeAmount,
        OutlierTransaction
    }

    public enum AlertSeverity
    {
        Low,
        Medium,
        High,
        Critical
    }
}
