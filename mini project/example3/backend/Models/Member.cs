using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SocietyFinance.API.Models
{
    /// <summary>
    /// Represents a member of the society
    /// </summary>
    [Table("Members")]
    public class Member
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }

        [Required]
        [MaxLength(100)]
        [EmailAddress]
        public string Email { get; set; }

        [MaxLength(20)]
        public string PhoneNumber { get; set; }

        [MaxLength(255)]
        public string Address { get; set; }

        [Column(TypeName = "decimal(10, 2)")]
        public decimal MembershipFee { get; set; }

        [Required]
        public MemberStatus Status { get; set; }

        public DateTime JoinDate { get; set; }

        public DateTime? LastModifiedDate { get; set; }

        // Navigation properties
        public ICollection<Payment> Payments { get; set; } = new List<Payment>();
    }

    public enum MemberStatus
    {
        Active,
        Inactive,
        Suspended,
        Resigned
    }
}
