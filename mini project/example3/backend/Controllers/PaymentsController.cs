using Microsoft.AspNetCore.Mvc;
using SocietyFinance.API.DTOs;
using SocietyFinance.API.Services;
using SocietyFinance.API.Exceptions;

namespace SocietyFinance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IAnomalyDetectionService _anomalyService;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(IPaymentService paymentService, IAnomalyDetectionService anomalyService, ILogger<PaymentsController> logger)
        {
            _paymentService = paymentService;
            _anomalyService = anomalyService;
            _logger = logger;
        }

        /// <summary>
        /// Get all payments
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PaymentListResponseDto>))]
        public async Task<ActionResult<ApiResponse<PaymentListResponseDto>>> GetAllPayments()
        {
            try
            {
                var result = await _paymentService.GetAllPaymentsAsync();
                return Ok(ApiResponse<PaymentListResponseDto>.SuccessResponse(result, "Payments retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payments");
                return StatusCode(500, ApiResponse<PaymentListResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get a specific payment by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PaymentResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<PaymentResponseDto>>> GetPaymentById(int id)
        {
            try
            {
                var result = await _paymentService.GetPaymentByIdAsync(id);
                return Ok(ApiResponse<PaymentResponseDto>.SuccessResponse(result, "Payment retrieved successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(ApiResponse<PaymentResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payment");
                return StatusCode(500, ApiResponse<PaymentResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Create a new payment
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(ApiResponse<PaymentResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<PaymentResponseDto>>> CreatePayment([FromBody] PaymentCreateUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList();
                    return BadRequest(ApiResponse<PaymentResponseDto>.ErrorResponse("Validation failed", errors));
                }

                var result = await _paymentService.CreatePaymentAsync(dto);
                
                // Trigger anomaly detection
                try
                {
                    await _anomalyService.DetectAndCreateAnomaliesAsync(result.Id);
                }
                catch (Exception anomalyEx)
                {
                    _logger.LogWarning(anomalyEx, "Anomaly detection failed for payment {paymentId}", result.Id);
                }

                return CreatedAtAction(nameof(GetPaymentById), new { id = result.Id },
                    ApiResponse<PaymentResponseDto>.SuccessResponse(result, "Payment created successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(ApiResponse<PaymentResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating payment");
                return StatusCode(500, ApiResponse<PaymentResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Update a payment
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PaymentResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<PaymentResponseDto>>> UpdatePayment(int id, [FromBody] PaymentCreateUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList();
                    return BadRequest(ApiResponse<PaymentResponseDto>.ErrorResponse("Validation failed", errors));
                }

                var result = await _paymentService.UpdatePaymentAsync(id, dto);
                return Ok(ApiResponse<PaymentResponseDto>.SuccessResponse(result, "Payment updated successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(ApiResponse<PaymentResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating payment");
                return StatusCode(500, ApiResponse<PaymentResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Delete a payment
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse>> DeletePayment(int id)
        {
            try
            {
                await _paymentService.DeletePaymentAsync(id);
                return Ok(ApiResponse.SuccessResponse("Payment deleted successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting payment");
                return StatusCode(500, ApiResponse.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get payments by member ID
        /// </summary>
        [HttpGet("member/{memberId}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PaymentListResponseDto>))]
        public async Task<ActionResult<ApiResponse<PaymentListResponseDto>>> GetPaymentsByMember(int memberId)
        {
            try
            {
                var result = await _paymentService.GetPaymentsByMemberAsync(memberId);
                return Ok(ApiResponse<PaymentListResponseDto>.SuccessResponse(result, "Member payments retrieved successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(ApiResponse<PaymentListResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member payments");
                return StatusCode(500, ApiResponse<PaymentListResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get payments by date range
        /// </summary>
        [HttpGet("by-date")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<PaymentListResponseDto>))]
        public async Task<ActionResult<ApiResponse<PaymentListResponseDto>>> GetPaymentsByDateRange(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate > endDate)
                    return BadRequest(ApiResponse<PaymentListResponseDto>.ErrorResponse("Start date must be before end date"));

                var result = await _paymentService.GetPaymentsByDateRangeAsync(startDate, endDate);
                return Ok(ApiResponse<PaymentListResponseDto>.SuccessResponse(result, "Payments retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payments by date range");
                return StatusCode(500, ApiResponse<PaymentListResponseDto>.ErrorResponse("Internal server error"));
            }
        }
    }
}
