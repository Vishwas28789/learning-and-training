using System;
using System.ComponentModel.DataAnnotations;

namespace SocietyFinance.API.DTOs
{
    /// <summary>
    /// DTO for Member API requests/responses
    /// </summary>
    public class MemberCreateUpdateDto
    {
        [Required(ErrorMessage = "First name is required")]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [Required(ErrorMessage = "Last name is required")]
        [MaxLength(100)]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        public string Email { get; set; }

        [MaxLength(20)]
        public string PhoneNumber { get; set; }

        [MaxLength(255)]
        public string Address { get; set; }

        [Range(0, double.MaxValue)]
        public decimal MembershipFee { get; set; }
    }

    public class MemberResponseDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string FullName => $"{FirstName} {LastName}";
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public decimal MembershipFee { get; set; }
        public string Status { get; set; }
        public DateTime JoinDate { get; set; }
        public DateTime? LastModifiedDate { get; set; }
    }

    public class MemberListResponseDto
    {
        public int TotalCount { get; set; }
        public List<MemberResponseDto> Members { get; set; } = new();
    }
}
