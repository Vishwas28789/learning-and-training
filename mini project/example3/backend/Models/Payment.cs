using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocietyFinance.API.Models
{
    /// <summary>
    /// Represents a payment transaction made by a member
    /// </summary>
    [Table("Payments")]
    public class Payment
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int MemberId { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public PaymentType PaymentType { get; set; }

        [Required]
        public PaymentStatus Status { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        public DateTime PaymentDate { get; set; }

        public DateTime CreatedDate { get; set; }

        [MaxLength(50)]
        public string TransactionReference { get; set; }

        // Foreign key
        [ForeignKey(nameof(MemberId))]
        public Member Member { get; set; }
    }

    public enum PaymentType
    {
        MembershipFee,
        Contribution,
        Loan,
        Refund,
        Other
    }

    public enum PaymentStatus
    {
        Pending,
        Completed,
        Failed,
        Cancelled
    }
}
