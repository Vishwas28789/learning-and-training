using Microsoft.EntityFrameworkCore;
using SocietyFinance.API.Data;
using SocietyFinance.API.Exceptions;
using SocietyFinance.API.Models;

namespace SocietyFinance.API.Repositories
{
    /// <summary>
    /// Generic repository implementation
    /// </summary>
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly SocietyFinanceDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public GenericRepository(SocietyFinanceDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public virtual async Task<T> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public virtual async Task<T> AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await SaveChangesAsync();
            return entity;
        }

        public virtual async Task UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await SaveChangesAsync();
        }

        public virtual async Task DeleteAsync(T entity)
        {
            _dbSet.Remove(entity);
            await SaveChangesAsync();
        }

        public virtual async Task<bool> ExistsAsync(int id)
        {
            var entity = await GetByIdAsync(id);
            return entity != null;
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Member repository implementation
    /// </summary>
    public class MemberRepository : GenericRepository<Member>, IMemberRepository
    {
        public MemberRepository(SocietyFinanceDbContext context) : base(context) { }

        public async Task<Member> GetByEmailAsync(string email)
        {
            return await _dbSet.FirstOrDefaultAsync(m => m.Email == email);
        }

        public async Task<IEnumerable<Member>> GetByStatusAsync(MemberStatus status)
        {
            return await _dbSet.Where(m => m.Status == status).ToListAsync();
        }

        public async Task<int> GetActiveMemberCountAsync()
        {
            return await _dbSet.CountAsync(m => m.Status == MemberStatus.Active);
        }
    }

    /// <summary>
    /// Payment repository implementation
    /// </summary>
    public class PaymentRepository : GenericRepository<Payment>, IPaymentRepository
    {
        public PaymentRepository(SocietyFinanceDbContext context) : base(context) { }

        public async Task<IEnumerable<Payment>> GetByMemberIdAsync(int memberId)
        {
            return await _dbSet.Where(p => p.MemberId == memberId)
                .Include(p => p.Member)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Payment>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet.Where(p => p.PaymentDate >= startDate && p.PaymentDate <= endDate)
                .Include(p => p.Member)
                .OrderByDescending(p => p.PaymentDate)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalPaymentsByMemberAsync(int memberId)
        {
            return await _dbSet
                .Where(p => p.MemberId == memberId && p.Status == PaymentStatus.Completed)
                .SumAsync(p => p.Amount);
        }

        public async Task<Payment> GetByTransactionReferenceAsync(string reference)
        {
            return await _dbSet.FirstOrDefaultAsync(p => p.TransactionReference == reference);
        }

        public async Task<IEnumerable<Payment>> GetByStatusAsync(PaymentStatus status)
        {
            return await _dbSet.Where(p => p.Status == status)
                .Include(p => p.Member)
                .ToListAsync();
        }
    }

    /// <summary>
    /// Expense repository implementation
    /// </summary>
    public class ExpenseRepository : GenericRepository<Expense>, IExpenseRepository
    {
        public ExpenseRepository(SocietyFinanceDbContext context) : base(context) { }

        public async Task<IEnumerable<Expense>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet.Where(e => e.ExpenseDate >= startDate && e.ExpenseDate <= endDate)
                .OrderByDescending(e => e.ExpenseDate)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalByCategoryAsync(ExpenseCategory category)
        {
            return await _dbSet
                .Where(e => e.Category == category && e.Status == ExpenseStatus.Paid)
                .SumAsync(e => e.Amount);
        }

        public async Task<IEnumerable<Expense>> GetByCategoryAsync(ExpenseCategory category)
        {
            return await _dbSet.Where(e => e.Category == category).ToListAsync();
        }

        public async Task<IEnumerable<Expense>> GetByStatusAsync(ExpenseStatus status)
        {
            return await _dbSet.Where(e => e.Status == status).ToListAsync();
        }

        public async Task<decimal> GetTotalExpensesAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet
                .Where(e => e.ExpenseDate >= startDate && e.ExpenseDate <= endDate && e.Status == ExpenseStatus.Paid)
                .SumAsync(e => e.Amount);
        }
    }

    /// <summary>
    /// Report repository implementation
    /// </summary>
    public class ReportRepository : GenericRepository<Report>, IReportRepository
    {
        public ReportRepository(SocietyFinanceDbContext context) : base(context) { }

        public async Task<Report> GetLatestFinancialReportAsync()
        {
            return await _dbSet
                .Where(r => r.ReportType == ReportType.MonthlyFinancial || 
                            r.ReportType == ReportType.AnnualFinancial)
                .OrderByDescending(r => r.GeneratedDate)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Report>> GetByTypeAsync(ReportType reportType)
        {
            return await _dbSet.Where(r => r.ReportType == reportType)
                .OrderByDescending(r => r.GeneratedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<Report>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet.Where(r => r.GeneratedDate >= startDate && r.GeneratedDate <= endDate)
                .OrderByDescending(r => r.GeneratedDate)
                .ToListAsync();
        }
    }

    /// <summary>
    /// Anomaly alert repository implementation
    /// </summary>
    public class AnomalyAlertRepository : GenericRepository<AnomalyAlert>, IAnomalyAlertRepository
    {
        public AnomalyAlertRepository(SocietyFinanceDbContext context) : base(context) { }

        public async Task<IEnumerable<AnomalyAlert>> GetUnresolvedAnomaliesAsync()
        {
            return await _dbSet.Where(a => !a.IsResolved)
                .Include(a => a.Member)
                .OrderByDescending(a => a.Severity)
                .ThenByDescending(a => a.DetectedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<AnomalyAlert>> GetByMemberIdAsync(int memberId)
        {
            return await _dbSet.Where(a => a.MemberId == memberId)
                .Include(a => a.Member)
                .OrderByDescending(a => a.DetectedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<AnomalyAlert>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _dbSet.Where(a => a.DetectedDate >= startDate && a.DetectedDate <= endDate)
                .Include(a => a.Member)
                .OrderByDescending(a => a.DetectedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<AnomalyAlert>> GetBySeverityAsync(AlertSeverity severity)
        {
            return await _dbSet.Where(a => a.Severity == severity && !a.IsResolved)
                .Include(a => a.Member)
                .OrderByDescending(a => a.DetectedDate)
                .ToListAsync();
        }
    }
}
