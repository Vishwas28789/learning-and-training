using Microsoft.AspNetCore.Mvc;
using SocietyFinance.API.DTOs;
using SocietyFinance.API.Services;
using SocietyFinance.API.Exceptions;

namespace SocietyFinance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ExpensesController : ControllerBase
    {
        private readonly IExpenseService _expenseService;
        private readonly ILogger<ExpensesController> _logger;

        public ExpensesController(IExpenseService expenseService, ILogger<ExpensesController> logger)
        {
            _expenseService = expenseService;
            _logger = logger;
        }

        /// <summary>
        /// Get all expenses
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ExpenseListResponseDto>))]
        public async Task<ActionResult<ApiResponse<ExpenseListResponseDto>>> GetAllExpenses()
        {
            try
            {
                var result = await _expenseService.GetAllExpensesAsync();
                return Ok(ApiResponse<ExpenseListResponseDto>.SuccessResponse(result, "Expenses retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expenses");
                return StatusCode(500, ApiResponse<ExpenseListResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get a specific expense by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ExpenseResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<ExpenseResponseDto>>> GetExpenseById(int id)
        {
            try
            {
                var result = await _expenseService.GetExpenseByIdAsync(id);
                return Ok(ApiResponse<ExpenseResponseDto>.SuccessResponse(result, "Expense retrieved successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(ApiResponse<ExpenseResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expense");
                return StatusCode(500, ApiResponse<ExpenseResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Create a new expense
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(ApiResponse<ExpenseResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<ApiResponse<ExpenseResponseDto>>> CreateExpense([FromBody] ExpenseCreateUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList();
                    return BadRequest(ApiResponse<ExpenseResponseDto>.ErrorResponse("Validation failed", errors));
                }

                var result = await _expenseService.CreateExpenseAsync(dto);
                return CreatedAtAction(nameof(GetExpenseById), new { id = result.Id },
                    ApiResponse<ExpenseResponseDto>.SuccessResponse(result, "Expense created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating expense");
                return StatusCode(500, ApiResponse<ExpenseResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Update an expense
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ExpenseResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<ExpenseResponseDto>>> UpdateExpense(int id, [FromBody] ExpenseCreateUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList();
                    return BadRequest(ApiResponse<ExpenseResponseDto>.ErrorResponse("Validation failed", errors));
                }

                var result = await _expenseService.UpdateExpenseAsync(id, dto);
                return Ok(ApiResponse<ExpenseResponseDto>.SuccessResponse(result, "Expense updated successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(ApiResponse<ExpenseResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating expense");
                return StatusCode(500, ApiResponse<ExpenseResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Delete an expense
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse>> DeleteExpense(int id)
        {
            try
            {
                await _expenseService.DeleteExpenseAsync(id);
                return Ok(ApiResponse.SuccessResponse("Expense deleted successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                return NotFound(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting expense");
                return StatusCode(500, ApiResponse.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get expenses by date range
        /// </summary>
        [HttpGet("by-date")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ExpenseListResponseDto>))]
        public async Task<ActionResult<ApiResponse<ExpenseListResponseDto>>> GetExpensesByDateRange(
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate > endDate)
                    return BadRequest(ApiResponse<ExpenseListResponseDto>.ErrorResponse("Start date must be before end date"));

                var result = await _expenseService.GetExpensesByDateRangeAsync(startDate, endDate);
                return Ok(ApiResponse<ExpenseListResponseDto>.SuccessResponse(result, "Expenses retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expenses by date range");
                return StatusCode(500, ApiResponse<ExpenseListResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get expenses by category
        /// </summary>
        [HttpGet("by-category/{category}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<ExpenseListResponseDto>))]
        public async Task<ActionResult<ApiResponse<ExpenseListResponseDto>>> GetExpensesByCategory(string category)
        {
            try
            {
                var result = await _expenseService.GetExpensesByCategoryAsync(category);
                return Ok(ApiResponse<ExpenseListResponseDto>.SuccessResponse(result, "Expenses retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving expenses by category");
                return StatusCode(500, ApiResponse<ExpenseListResponseDto>.ErrorResponse("Internal server error"));
            }
        }
    }
}
