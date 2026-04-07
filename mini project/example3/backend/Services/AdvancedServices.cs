using SocietyFinance.API.DTOs;
using SocietyFinance.API.Exceptions;
using SocietyFinance.API.Models;
using SocietyFinance.API.Repositories;
using AutoMapper;

namespace SocietyFinance.API.Services
{
    /// <summary>
    /// Service implementation for Report generation
    /// </summary>
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IExpenseRepository _expenseRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly IMapper _mapper;

        public ReportService(IReportRepository reportRepository, IPaymentRepository paymentRepository,
            IExpenseRepository expenseRepository, IMemberRepository memberRepository, IMapper mapper)
        {
            _reportRepository = reportRepository;
            _paymentRepository = paymentRepository;
            _expenseRepository = expenseRepository;
            _memberRepository = memberRepository;
            _mapper = mapper;
        }

        public async Task<FinancialSummaryReportDto> GenerateFinancialSummaryAsync(DateTime fromDate, DateTime toDate)
        {
            var payments = await _paymentRepository.GetByDateRangeAsync(fromDate, toDate);
            var expenses = await _expenseRepository.GetByDateRangeAsync(fromDate, toDate);
            var members = await _memberRepository.GetAllAsync();
            var activeMembersCount = await _memberRepository.GetActiveMemberCountAsync();

            var totalIncome = payments.Where(p => p.Status == PaymentStatus.Completed).Sum(p => p.Amount);
            var totalExpenses = expenses.Where(e => e.Status == ExpenseStatus.Paid).Sum(e => e.Amount);
            var netBalance = totalIncome - totalExpenses;

            var report = new Report
            {
                Title = $"Financial Summary {fromDate:MMM} - {toDate:MMM yyyy}",
                ReportType = ReportType.MonthlyFinancial,
                GeneratedDate = DateTime.UtcNow,
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses,
                NetBalance = netBalance,
                TotalMembers = members.Count(),
                ActiveMembers = activeMembersCount,
                FromDate = fromDate,
                ToDate = toDate,
                Summary = GenerateReportSummary(totalIncome, totalExpenses, netBalance, activeMembersCount)
            };

            await _reportRepository.AddAsync(report);

            return new FinancialSummaryReportDto
            {
                ReportId = report.Id,
                GeneratedDate = report.GeneratedDate,
                ReportType = report.ReportType.ToString(),
                TotalIncome = totalIncome,
                TotalExpenses = totalExpenses,
                NetBalance = netBalance,
                AveragePaymentPerMember = members.Any() ? totalIncome / members.Count() : 0,
                TotalMembers = report.TotalMembers,
                ActiveMembers = report.ActiveMembers,
                MembershipCoverage = report.TotalMembers > 0 ? (activeMembersCount * 100m) / report.TotalMembers : 0,
                FromDate = fromDate,
                ToDate = toDate
            };
        }

        public async Task<FinancialSummaryReportDto> GetLatestReportAsync()
        {
            var report = await _reportRepository.GetLatestFinancialReportAsync();
            if (report == null)
                throw new ResourceNotFoundException("No financial reports found.");

            return new FinancialSummaryReportDto
            {
                ReportId = report.Id,
                GeneratedDate = report.GeneratedDate,
                ReportType = report.ReportType.ToString(),
                TotalIncome = report.TotalIncome,
                TotalExpenses = report.TotalExpenses,
                NetBalance = report.NetBalance,
                AveragePaymentPerMember = report.TotalMembers > 0 ? report.TotalIncome / report.TotalMembers : 0,
                TotalMembers = report.TotalMembers,
                ActiveMembers = report.ActiveMembers,
                MembershipCoverage = report.TotalMembers > 0 ? (report.ActiveMembers * 100m) / report.TotalMembers : 0,
                FromDate = report.FromDate,
                ToDate = report.ToDate
            };
        }

        public async Task<List<MonthlyReportDto>> GetMonthlyReportAsync(int year)
        {
            var monthlyReports = new List<MonthlyReportDto>();

            for (int month = 1; month <= 12; month++)
            {
                var startDate = new DateTime(year, month, 1);
                var endDate = month == 12 ? new DateTime(year + 1, 1, 1).AddDays(-1) : new DateTime(year, month + 1, 1).AddDays(-1);

                var payments = await _paymentRepository.GetByDateRangeAsync(startDate, endDate);
                var expenses = await _expenseRepository.GetByDateRangeAsync(startDate, endDate);

                var income = payments.Where(p => p.Status == PaymentStatus.Completed).Sum(p => p.Amount);
                var expenseAmount = expenses.Where(e => e.Status == ExpenseStatus.Paid).Sum(e => e.Amount);
                var balance = income - expenseAmount;

                monthlyReports.Add(new MonthlyReportDto
                {
                    Year = year,
                    Month = month,
                    Income = income,
                    Expenses = expenseAmount,
                    Balance = balance,
                    TransactionCount = payments.Count() + expenses.Count()
                });
            }

            return monthlyReports;
        }

        public async Task<List<MemberPaymentStatsDto>> GetMemberPaymentStatsAsync()
        {
            var members = await _memberRepository.GetAllAsync();
            var stats = new List<MemberPaymentStatsDto>();

            foreach (var member in members)
            {
                var payments = await _paymentRepository.GetByMemberIdAsync(member.Id);
                var paymentList = payments.ToList();

                stats.Add(new MemberPaymentStatsDto
                {
                    MemberId = member.Id,
                    MemberName = $"{member.FirstName} {member.LastName}",
                    TotalPayments = paymentList.Count,
                    TotalPaid = paymentList.Sum(p => p.Amount),
                    AveragePayment = paymentList.Any() ? paymentList.Average(p => p.Amount) : 0,
                    LastPaymentDate = paymentList.Any() ? paymentList.Max(p => p.PaymentDate) : DateTime.MinValue,
                    IsUpToDate = paymentList.Any() && (DateTime.UtcNow - paymentList.Max(p => p.PaymentDate)).TotalDays < 30
                });
            }

            return stats;
        }

        private string GenerateReportSummary(decimal income, decimal expenses, decimal netBalance, int activeMembers)
        {
            return $"Total Income: {income:C}; Total Expenses: {expenses:C}; Net Balance: {netBalance:C}; Active Members: {activeMembers}";
        }
    }

    /// <summary>
    /// Service implementation for Anomaly Detection
    /// </summary>
    public class AnomalyDetectionService : IAnomalyDetectionService
    {
        private readonly IAnomalyAlertRepository _anomalyRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly IMapper _mapper;

        public AnomalyDetectionService(IAnomalyAlertRepository anomalyRepository, IPaymentRepository paymentRepository,
            IMemberRepository memberRepository, IMapper mapper)
        {
            _anomalyRepository = anomalyRepository;
            _paymentRepository = paymentRepository;
            _memberRepository = memberRepository;
            _mapper = mapper;
        }

        public async Task<AnomalyCheckResponseDto> CheckAnomaliesAsync(AnomalyCheckRequestDto request)
        {
            IEnumerable<AnomalyAlert> anomalies;

            if (request.MemberId.HasValue)
            {
                var member = await _memberRepository.GetByIdAsync(request.MemberId.Value);
                if (member == null)
                    throw new ResourceNotFoundException(nameof(Member), request.MemberId.Value);

                anomalies = await _anomalyRepository.GetByMemberIdAsync(request.MemberId.Value);
            }
            else
            {
                anomalies = await _anomalyRepository.GetByDateRangeAsync(request.FromDate, request.ToDate);
            }

            var anomalyList = anomalies.ToList();

            return new AnomalyCheckResponseDto
            {
                TotalAnomalies = anomalyList.Count,
                UnresolvedCount = anomalyList.Count(a => !a.IsResolved),
                CriticalCount = anomalyList.Count(a => a.Severity == AlertSeverity.Critical),
                Anomalies = _mapper.Map<List<AnomalyAlertResponseDto>>(anomalyList)
            };
        }

        public async Task<List<AnomalyAlertResponseDto>> GetUnresolvedAnomaliesAsync()
        {
            var anomalies = await _anomalyRepository.GetUnresolvedAnomaliesAsync();
            return _mapper.Map<List<AnomalyAlertResponseDto>>(anomalies);
        }

        public async Task<AnomalyAlertResponseDto> ResolveAnomalyAsync(int anomalyId, string resolution)
        {
            var anomaly = await _anomalyRepository.GetByIdAsync(anomalyId);
            if (anomaly == null)
                throw new ResourceNotFoundException("Anomaly", anomalyId);

            anomaly.IsResolved = true;
            anomaly.Resolution = resolution;
            anomaly.ResolvedDate = DateTime.UtcNow;

            await _anomalyRepository.UpdateAsync(anomaly);
            return _mapper.Map<AnomalyAlertResponseDto>(anomaly);
        }

        public async Task DetectAndCreateAnomaliesAsync(int paymentId)
        {
            var payment = await _paymentRepository.GetByIdAsync(paymentId);
            if (payment == null)
                throw new ResourceNotFoundException(nameof(Payment), paymentId);

            // Check for anomalies
            var anomalies = DetectPaymentAnomalies(payment);

            foreach (var anomaly in anomalies)
            {
                await _anomalyRepository.AddAsync(anomaly);
            }
        }

        private List<AnomalyAlert> DetectPaymentAnomalies(Payment payment)
        {
            var anomalies = new List<AnomalyAlert>();

            // Rule 1: Negative or zero amount
            if (payment.Amount <= 0)
            {
                anomalies.Add(new AnomalyAlert
                {
                    MemberId = payment.MemberId,
                    AnomalyType = AnomalyType.NegativeAmount,
                    Description = "Payment with zero or negative amount detected",
                    AnomalousValue = payment.Amount,
                    DetectedDate = DateTime.UtcNow,
                    Severity = AlertSeverity.High,
                    IsResolved = false
                });
            }

            // Rule 2: Unusually high payment (more than 5x average)
            var memberPayments = Task.Run(() => _paymentRepository.GetByMemberIdAsync(payment.MemberId)).Result;
            var otherPayments = memberPayments.Where(p => p.Id != payment.Id).ToList();

            if (otherPayments.Any())
            {
                var avgPayment = otherPayments.Average(p => p.Amount);
                if (payment.Amount > avgPayment * 5)
                {
                    anomalies.Add(new AnomalyAlert
                    {
                        MemberId = payment.MemberId,
                        AnomalyType = AnomalyType.UnusuallyHighPayment,
                        Description = $"Payment amount ({payment.Amount:C}) is 5x higher than member's average ({avgPayment:C})",
                        AnomalousValue = payment.Amount,
                        DetectedDate = DateTime.UtcNow,
                        Severity = AlertSeverity.Medium,
                        IsResolved = false
                    });
                }
            }

            // Rule 3: Duplicate payment (same amount within 24 hours)
            var recentDuplicate = otherPayments.FirstOrDefault(p =>
                p.Amount == payment.Amount &&
                (DateTime.UtcNow - p.PaymentDate).TotalHours <= 24);

            if (recentDuplicate != null)
            {
                anomalies.Add(new AnomalyAlert
                {
                    MemberId = payment.MemberId,
                    AnomalyType = AnomalyType.DuplicatePayment,
                    Description = $"Potential duplicate payment detected. Previous similar payment on {recentDuplicate.PaymentDate:g}",
                    AnomalousValue = payment.Amount,
                    DetectedDate = DateTime.UtcNow,
                    Severity = AlertSeverity.High,
                    IsResolved = false
                });
            }

            return anomalies;
        }
    }
}
