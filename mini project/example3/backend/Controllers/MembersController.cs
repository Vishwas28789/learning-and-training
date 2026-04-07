using Microsoft.AspNetCore.Mvc;
using SocietyFinance.API.DTOs;
using SocietyFinance.API.Services;
using SocietyFinance.API.Exceptions;

namespace SocietyFinance.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class MembersController : ControllerBase
    {
        private readonly IMemberService _memberService;
        private readonly ILogger<MembersController> _logger;

        public MembersController(IMemberService memberService, ILogger<MembersController> logger)
        {
            _memberService = memberService;
            _logger = logger;
        }

        /// <summary>
        /// Get all members
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<MemberListResponseDto>))]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<MemberListResponseDto>>> GetAllMembers()
        {
            try
            {
                var result = await _memberService.GetAllMembersAsync();
                return Ok(ApiResponse<MemberListResponseDto>.SuccessResponse(result, "Members retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving members");
                return StatusCode(500, ApiResponse<MemberListResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get a specific member by ID
        /// </summary>
        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<MemberResponseDto>))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<MemberResponseDto>>> GetMemberById(int id)
        {
            try
            {
                var result = await _memberService.GetMemberByIdAsync(id);
                return Ok(ApiResponse<MemberResponseDto>.SuccessResponse(result, "Member retrieved successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                _logger.LogWarning(ex.Message);
                return NotFound(ApiResponse<MemberResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving member");
                return StatusCode(500, ApiResponse<MemberResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Create a new member
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created, Type = typeof(ApiResponse<MemberResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status409Conflict)]
        public async Task<ActionResult<ApiResponse<MemberResponseDto>>> CreateMember([FromBody] MemberCreateUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList();
                    return BadRequest(ApiResponse<MemberResponseDto>.ErrorResponse("Validation failed", errors));
                }

                var result = await _memberService.CreateMemberAsync(dto);
                return CreatedAtAction(nameof(GetMemberById), new { id = result.Id },
                    ApiResponse<MemberResponseDto>.SuccessResponse(result, "Member created successfully"));
            }
            catch (DuplicateException ex)
            {
                _logger.LogWarning(ex.Message);
                return Conflict(ApiResponse<MemberResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating member");
                return StatusCode(500, ApiResponse<MemberResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Update an existing member
        /// </summary>
        [HttpPut("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<MemberResponseDto>))]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse<MemberResponseDto>>> UpdateMember(int id, [FromBody] MemberCreateUpdateDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors.Select(e => e.ErrorMessage)).ToList();
                    return BadRequest(ApiResponse<MemberResponseDto>.ErrorResponse("Validation failed", errors));
                }

                var result = await _memberService.UpdateMemberAsync(id, dto);
                return Ok(ApiResponse<MemberResponseDto>.SuccessResponse(result, "Member updated successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                _logger.LogWarning(ex.Message);
                return NotFound(ApiResponse<MemberResponseDto>.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating member");
                return StatusCode(500, ApiResponse<MemberResponseDto>.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Delete a member
        /// </summary>
        [HttpDelete("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse))]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<ApiResponse>> DeleteMember(int id)
        {
            try
            {
                await _memberService.DeleteMemberAsync(id);
                return Ok(ApiResponse.SuccessResponse("Member deleted successfully"));
            }
            catch (ResourceNotFoundException ex)
            {
                _logger.LogWarning(ex.Message);
                return NotFound(ApiResponse.ErrorResponse(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting member");
                return StatusCode(500, ApiResponse.ErrorResponse("Internal server error"));
            }
        }

        /// <summary>
        /// Get active member count
        /// </summary>
        [HttpGet("stats/active-count")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(ApiResponse<int>))]
        public async Task<ActionResult<ApiResponse<int>>> GetActiveMemberCount()
        {
            try
            {
                var count = await _memberService.GetActiveMemberCountAsync();
                return Ok(ApiResponse<int>.SuccessResponse(count, "Active member count retrieved"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active member count");
                return StatusCode(500, ApiResponse<int>.ErrorResponse("Internal server error"));
            }
        }
    }
}
