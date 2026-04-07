using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocietyFinance.API.Models
{
    /// <summary>
    /// Represents an expense incurred by the society
    /// </summary>
    [Table("Expenses")]
    public class Expense
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Description { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public ExpenseCategory Category { get; set; }

        public DateTime ExpenseDate { get; set; }

        public DateTime CreatedDate { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }

        [MaxLength(100)]
        public string ApprovedBy { get; set; }

        [Required]
        public ExpenseStatus Status { get; set; }
    }

    public enum ExpenseCategory
    {
        Administration,
        Maintenance,
        Utilities,
        Insurance,
        Events,
        Legal,
        Miscellaneous
    }

    public enum ExpenseStatus
    {
        Pending,
        Approved,
        Rejected,
        Paid
    }
}
