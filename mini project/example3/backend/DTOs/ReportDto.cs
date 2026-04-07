using System;

namespace SocietyFinance.API.DTOs
{
    /// <summary>
    /// DTO for Report API responses
    /// </summary>
    public class FinancialSummaryReportDto
    {
        public int ReportId { get; set; }
        public DateTime GeneratedDate { get; set; }
        public string ReportType { get; set; }
        public decimal TotalIncome { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetBalance { get; set; }
        public decimal AveragePaymentPerMember { get; set; }
        public int TotalMembers { get; set; }
        public int ActiveMembers { get; set; }
        public decimal MembershipCoverage { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
    }

    public class MonthlyReportDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public decimal Income { get; set; }
        public decimal Expenses { get; set; }
        public decimal Balance { get; set; }
        public int TransactionCount { get; set; }
    }

    public class MemberPaymentStatsDto
    {
        public int MemberId { get; set; }
        public string MemberName { get; set; }
        public int TotalPayments { get; set; }
        public decimal TotalPaid { get; set; }
        public decimal AveragePayment { get; set; }
        public DateTime LastPaymentDate { get; set; }
        public bool IsUpToDate { get; set; }
    }
}
