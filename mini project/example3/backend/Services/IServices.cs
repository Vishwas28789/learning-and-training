using SocietyFinance.API.DTOs;

namespace SocietyFinance.API.Services
{
    /// <summary>
    /// Service interface for Member operations
    /// </summary>
    public interface IMemberService
    {
        Task<MemberResponseDto> GetMemberByIdAsync(int id);
        Task<MemberListResponseDto> GetAllMembersAsync();
        Task<MemberResponseDto> CreateMemberAsync(MemberCreateUpdateDto dto);
        Task<MemberResponseDto> UpdateMemberAsync(int id, MemberCreateUpdateDto dto);
        Task DeleteMemberAsync(int id);
        Task<MemberResponseDto> GetMemberByEmailAsync(string email);
        Task<int> GetActiveMemberCountAsync();
    }

    /// <summary>
    /// Service interface for Payment operations
    /// </summary>
    public interface IPaymentService
    {
        Task<PaymentResponseDto> GetPaymentByIdAsync(int id);
        Task<PaymentListResponseDto> GetAllPaymentsAsync();
        Task<PaymentResponseDto> CreatePaymentAsync(PaymentCreateUpdateDto dto);
        Task<PaymentResponseDto> UpdatePaymentAsync(int id, PaymentCreateUpdateDto dto);
        Task DeletePaymentAsync(int id);
        Task<PaymentListResponseDto> GetPaymentsByMemberAsync(int memberId);
        Task<PaymentListResponseDto> GetPaymentsByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<decimal> GetTotalPaymentsByMemberAsync(int memberId);
    }

    /// <summary>
    /// Service interface for Expense operations
    /// </summary>
    public interface IExpenseService
    {
        Task<ExpenseResponseDto> GetExpenseByIdAsync(int id);
        Task<ExpenseListResponseDto> GetAllExpensesAsync();
        Task<ExpenseResponseDto> CreateExpenseAsync(ExpenseCreateUpdateDto dto);
        Task<ExpenseResponseDto> UpdateExpenseAsync(int id, ExpenseCreateUpdateDto dto);
        Task DeleteExpenseAsync(int id);
        Task<ExpenseListResponseDto> GetExpensesByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<ExpenseListResponseDto> GetExpensesByCategoryAsync(string category);
    }

    /// <summary>
    /// Service interface for Report generation
    /// </summary>
    public interface IReportService
    {
        Task<FinancialSummaryReportDto> GenerateFinancialSummaryAsync(DateTime fromDate, DateTime toDate);
        Task<FinancialSummaryReportDto> GetLatestReportAsync();
        Task<List<MonthlyReportDto>> GetMonthlyReportAsync(int year);
        Task<List<MemberPaymentStatsDto>> GetMemberPaymentStatsAsync();
    }

    /// <summary>
    /// Service interface for Anomaly Detection
    /// </summary>
    public interface IAnomalyDetectionService
    {
        Task<AnomalyCheckResponseDto> CheckAnomaliesAsync(AnomalyCheckRequestDto request);
        Task<List<AnomalyAlertResponseDto>> GetUnresolvedAnomaliesAsync();
        Task<AnomalyAlertResponseDto> ResolveAnomalyAsync(int anomalyId, string resolution);
        Task DetectAndCreateAnomaliesAsync(int paymentId);
    }
}
