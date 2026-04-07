using SocietyFinance.API.Models;

namespace SocietyFinance.API.Repositories
{
    /// <summary>
    /// Generic repository interface for common CRUD operations
    /// </summary>
    public interface IGenericRepository<T> where T : class
    {
        Task<T> GetByIdAsync(int id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        Task<bool> ExistsAsync(int id);
        Task SaveChangesAsync();
    }

    /// <summary>
    /// Repository interface for Member entity
    /// </summary>
    public interface IMemberRepository : IGenericRepository<Member>
    {
        Task<Member> GetByEmailAsync(string email);
        Task<IEnumerable<Member>> GetByStatusAsync(MemberStatus status);
        Task<int> GetActiveMemberCountAsync();
    }

    /// <summary>
    /// Repository interface for Payment entity
    /// </summary>
    public interface IPaymentRepository : IGenericRepository<Payment>
    {
        Task<IEnumerable<Payment>> GetByMemberIdAsync(int memberId);
        Task<IEnumerable<Payment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<decimal> GetTotalPaymentsByMemberAsync(int memberId);
        Task<Payment> GetByTransactionReferenceAsync(string reference);
        Task<IEnumerable<Payment>> GetByStatusAsync(PaymentStatus status);
    }

    /// <summary>
    /// Repository interface for Expense entity
    /// </summary>
    public interface IExpenseRepository : IGenericRepository<Expense>
    {
        Task<IEnumerable<Expense>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<decimal> GetTotalByCategoryAsync(ExpenseCategory category);
        Task<IEnumerable<Expense>> GetByCategoryAsync(ExpenseCategory category);
        Task<IEnumerable<Expense>> GetByStatusAsync(ExpenseStatus status);
        Task<decimal> GetTotalExpensesAsync(DateTime startDate, DateTime endDate);
    }

    /// <summary>
    /// Repository interface for Report entity
    /// </summary>
    public interface IReportRepository : IGenericRepository<Report>
    {
        Task<Report> GetLatestFinancialReportAsync();
        Task<IEnumerable<Report>> GetByTypeAsync(ReportType reportType);
        Task<IEnumerable<Report>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
    }

    /// <summary>
    /// Repository interface for AnomalyAlert entity
    /// </summary>
    public interface IAnomalyAlertRepository : IGenericRepository<AnomalyAlert>
    {
        Task<IEnumerable<AnomalyAlert>> GetUnresolvedAnomaliesAsync();
        Task<IEnumerable<AnomalyAlert>> GetByMemberIdAsync(int memberId);
        Task<IEnumerable<AnomalyAlert>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<IEnumerable<AnomalyAlert>> GetBySeverityAsync(AlertSeverity severity);
    }
}
