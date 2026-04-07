using System;
using System.ComponentModel.DataAnnotations;

namespace SocietyFinance.API.DTOs
{
    /// <summary>
    /// DTO for Expense API requests/responses
    /// </summary>
    public class ExpenseCreateUpdateDto
    {
        [Required(ErrorMessage = "Description is required")]
        [MaxLength(200)]
        public string Description { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public string Category { get; set; }

        public DateTime? ExpenseDate { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }

        [MaxLength(100)]
        public string ApprovedBy { get; set; }
    }

    public class ExpenseResponseDto
    {
        public int Id { get; set; }
        public string Description { get; set; }
        public decimal Amount { get; set; }
        public string Category { get; set; }
        public DateTime ExpenseDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public string Notes { get; set; }
        public string ApprovedBy { get; set; }
        public string Status { get; set; }
    }

    public class ExpenseListResponseDto
    {
        public int TotalCount { get; set; }
        public decimal TotalAmount { get; set; }
        public Dictionary<string, decimal> ByCategory { get; set; } = new();
        public List<ExpenseResponseDto> Expenses { get; set; } = new();
    }
}
