using AutoMapper;
using SocietyFinance.API.DTOs;
using SocietyFinance.API.Models;

namespace SocietyFinance.API.Utilities
{
    /// <summary>
    /// AutoMapper configuration for entity to DTO mappings
    /// </summary>
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // Member mappings
            CreateMap<Member, MemberResponseDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            // Payment mappings
            CreateMap<Payment, PaymentResponseDto>()
                .ForMember(dest => dest.PaymentType, opt => opt.MapFrom(src => src.PaymentType.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.Member != null ? $"{src.Member.FirstName} {src.Member.LastName}" : ""));

            // Expense mappings
            CreateMap<Expense, ExpenseResponseDto>()
                .ForMember(dest => dest.Category, opt => opt.MapFrom(src => src.Category.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            // AnomalyAlert mappings
            CreateMap<AnomalyAlert, AnomalyAlertResponseDto>()
                .ForMember(dest => dest.AnomalyType, opt => opt.MapFrom(src => src.AnomalyType.ToString()))
                .ForMember(dest => dest.Severity, opt => opt.MapFrom(src => src.Severity.ToString()))
                .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.Member != null ? $"{src.Member.FirstName} {src.Member.LastName}" : ""));
        }
    }
}
