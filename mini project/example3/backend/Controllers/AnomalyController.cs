using Microsoft.AspNetCore.Mvc;
using SocietyFinance.API.DTOs;
using SocietyFinance.API.Services;
using SocietyFinance.API.Exceptions;

namespace SocietyFinance.API.Controllers
{
    [ApiController]
    [Route("api/anomaly")]
    [Produces("application/json")]
    public class AnomalyController : ControllerBase
    {
        private readonly IAnomalyDetectionService _anomalyService;
        private readonly ILogger<AnomalyController> _logger;

        public AnomalyController(IAnomalyDetectionService anomalyService, ILogger<AnomalyController> logger)
        {
            _anomalyService = anomalyService;
            _logger = logger;
        }

        /// <summary>
        /// Check for anomalies
        /// </summary>
        [HttpPost("check")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AnomalyCheckResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<AnomalyCheckResponseDto>>> CheckAnomalies([FromBody] AnomalyCheckRequestDto request)
        {
            try
            {
                if (request.FromDate > request.ToDate)
                    return BadRequest(ApiResponse<AnomalyCheckResponseDto>.ErrorResponse("From date must be before to date"));

                var result = await _anomalyService.CheckAnomaliesAsync(request);
                return Ok(ApiResponse<AnomalyCheckResponseDto>.SuccessResponse(result, "Anomalies checked successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(ApiResponse<AnomalyCheckResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking anomalies");
                return StatusCode(500, ApiResponse<AnomalyCheckResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get unresolved anomalies
        /// </summary>
        [HttpGet("unresolved")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<List<AnomalyAlertResponseDto>>))]
        public async Task<ActionResult<ApiResponse<List<AnomalyAlertResponseDto>>>> GetUnresolvedAnomalies()
        {
            try
            {
                var result = await _anomalyService.GetUnresolvedAnomaliesAsync();
                return Ok(ApiResponse<List<AnomalyAlertResponseDto>>.SuccessResponse(result, "Unresolved anomalies retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving unresolved anomalies");
                return StatusCode(500, ApiResponse<List<AnomalyAlertResponseDto>>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Resolve an anomaly
        /// </summary>
        [HttpPost("resolve/{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<AnomalyAlertResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<AnomalyAlertResponseDto>>> ResolveAnomaly(int id, [FromBody] string resolution)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(resolution))
                    return BadRequest(ApiResponse<AnomalyAlertResponseDto>.ErrorResponse("Resolution is required"));

                var result = await _anomalyService.ResolveAnomalyAsync(id, resolution);
                return Ok(ApiResponse<AnomalyAlertResponseDto>.SuccessResponse(result, "Anomaly resolved successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(ApiResponse<AnomalyAlertResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error resolving anomaly");
                return StatusCode(500, ApiResponse<AnomalyAlertResponseDto>.ErrorResponse("Internal server error"));
            }
        }
    }
}
