using Microsoft.AspNetCore.Mvc;
using SocietyFinance.API.DTOs;
using SocietyFinance.API.Services;
using SocietyFinance.API.Exceptions;

namespace SocietyFinance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;
        private readonly ILogger<ReportsController> _logger;

        public ReportsController(IReportService reportService, ILogger<ReportsController> logger)
        {
            _reportService = reportService;
            _logger = logger;
        }

        /// <summary>
        /// Get financial summary report
        /// </summary>
        [HttpGet("summary")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<FinancialSummaryReportDto>))]
        public async Task<ActionResult<ApiResponse<FinancialSummaryReportDto>>> GetFinancialSummary(
            [FromQuery] DateTime fromDate,
            [FromQuery] DateTime toDate)
        {
            try
            {
                if (fromDate > toDate)
                    return BadRequest(ApiResponse<FinancialSummaryReportDto>.ErrorResponse("From date must be before to date"));

                var result = await _reportService.GenerateFinancialSummaryAsync(fromDate, toDate);
                return Ok(ApiResponse<FinancialSummaryReportDto>.SuccessResponse(result, "Financial summary generated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating financial summary");
                return StatusCode(500, ApiResponse<FinancialSummaryReportDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get latest financial report
        /// </summary>
        [HttpGet("latest")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<FinancialSummaryReportDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<FinancialSummaryReportDto>>> GetLatestReport()
        {
            try
            {
                var result = await _reportService.GetLatestReportAsync();
                return Ok(ApiResponse<FinancialSummaryReportDto>.SuccessResponse(result, "Latest report retrieved successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(ApiResponse<FinancialSummaryReportDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving latest report");
                return StatusCode(500, ApiResponse<FinancialSummaryReportDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get monthly reports for a specific year
        /// </summary>
        [HttpGet("monthly/{year}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<MonthlyReportDto>>))]
        public async Task<ActionResult<ApiResponse<List<MonthlyReportDto>>>> GetMonthlyReport(int year)
        {
            try
            {
                if (year < 2000 || year > DateTime.Now.Year)
                    return BadRequest(ApiResponse<List<MonthlyReportDto>>.ErrorResponse("Invalid year provided"));

                var result = await _reportService.GetMonthlyReportAsync(year);
                return Ok(ApiResponse<List<MonthlyReportDto>>.SuccessResponse(result, "Monthly reports retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving monthly reports");
                return StatusCode(500, ApiResponse<List<MonthlyReportDto>>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get member payment statistics
        /// </summary>
        [HttpGet("member-stats")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<MemberPaymentStatsDto>>))]
        public async Task<ActionResult<ApiResponse<List<MemberPaymentStatsDto>>>> GetMemberPaymentStats()
        {
            try
            {
                var result = await _reportService.GetMemberPaymentStatsAsync();
                return Ok(ApiResponse<List<MemberPaymentStatsDto>>.SuccessResponse(result, "Member payment statistics retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member payment statistics");
                return StatusCode(500, ApiResponse<List<MemberPaymentStatsDto>>.ErrorResponse("Internal server error"));
            }
        }
    }
}
