using System;

namespace SocietyFinance.API.DTOs
{
    /// <summary>
    /// DTO for Anomaly Detection responses
    /// </summary>
    public class AnomalyAlertResponseDto
    {
        public int Id { get; set; }
        public int MemberId { get; set; }
        public string MemberName { get; set; }
        public string AnomalyType { get; set; }
        public string Description { get; set; }
        public decimal AnomalousValue { get; set; }
        public DateTime DetectedDate { get; set; }
        public string Severity { get; set; }
        public bool IsResolved { get; set; }
        public string Resolution { get; set; }
    }

    public class AnomalyCheckRequestDto
    {
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
        public int? MemberId { get; set; }
    }

    public class AnomalyCheckResponseDto
    {
        public int TotalAnomalies { get; set; }
        public int UnresolvedCount { get; set; }
        public int CriticalCount { get; set; }
        public List<AnomalyAlertResponseDto> Anomalies { get; set; } = new();
    }
}
