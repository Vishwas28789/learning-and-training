using System;
using System.ComponentModel.DataAnnotations;

namespace SocietyFinance.API.DTOs
{
    /// <summary>
    /// DTO for Payment API requests/responses
    /// </summary>
    public class PaymentCreateUpdateDto
    {
        [Required]
        [Range(1, int.MaxValue)]
        public int MemberId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Amount { get; set; }

        [Required]
        public string PaymentType { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        public DateTime? PaymentDate { get; set; }

        [MaxLength(50)]
        public string TransactionReference { get; set; }
    }

    public class PaymentResponseDto
    {
        public int Id { get; set; }
        public int MemberId { get; set; }
        public string MemberName { get; set; }
        public decimal Amount { get; set; }
        public string PaymentType { get; set; }
        public string Status { get; set; }
        public string Description { get; set; }
        public DateTime PaymentDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public string TransactionReference { get; set; }
    }

    public class PaymentListResponseDto
    {
        public int TotalCount { get; set; }
        public decimal TotalAmount { get; set; }
        public List<PaymentResponseDto> Payments { get; set; } = new();
    }
}
