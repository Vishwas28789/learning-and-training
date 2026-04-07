using AutoMapper;
using SocietyFinance.API.DTOs;
using SocietyFinance.API.Exceptions;
using SocietyFinance.API.Models;
using SocietyFinance.API.Repositories;

namespace SocietyFinance.API.Services
{
    /// <summary>
    /// Service implementation for Member operations
    /// </summary>
    public class MemberService : IMemberService
    {
        private readonly IMemberRepository _memberRepository;
        private readonly IMapper _mapper;

        public MemberService(IMemberRepository memberRepository, IMapper mapper)
        {
            _memberRepository = memberRepository;
            _mapper = mapper;
        }

        public async Task<MemberResponseDto> GetMemberByIdAsync(int id)
        {
            var member = await _memberRepository.GetByIdAsync(id);
            if (member == null)
                throw new ResourceNotFoundException(nameof(Member), id);

            return _mapper.Map<MemberResponseDto>(member);
        }

        public async Task<MemberListResponseDto> GetAllMembersAsync()
        {
            var members = await _memberRepository.GetAllAsync();
            return new MemberListResponseDto
            {
                TotalCount = members.Count(),
                Members = _mapper.Map<List<MemberResponseDto>>(members)
            };
        }

        public async Task<MemberResponseDto> CreateMemberAsync(MemberCreateUpdateDto dto)
        {
            var existingMember = await _memberRepository.GetByEmailAsync(dto.Email);
            if (existingMember != null)
                throw new DuplicateException($"Member with email {dto.Email} already exists.");

            var member = new Member
            {
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address,
                MembershipFee = dto.MembershipFee,
                Status = MemberStatus.Active,
                JoinDate = DateTime.UtcNow
            };

            await _memberRepository.AddAsync(member);
            return _mapper.Map<MemberResponseDto>(member);
        }

        public async Task<MemberResponseDto> UpdateMemberAsync(int id, MemberCreateUpdateDto dto)
        {
            var member = await _memberRepository.GetByIdAsync(id);
            if (member == null)
                throw new ResourceNotFoundException(nameof(Member), id);

            member.FirstName = dto.FirstName;
            member.LastName = dto.LastName;
            member.Email = dto.Email;
            member.PhoneNumber = dto.PhoneNumber;
            member.Address = dto.Address;
            member.MembershipFee = dto.MembershipFee;
            member.LastModifiedDate = DateTime.UtcNow;

            await _memberRepository.UpdateAsync(member);
            return _mapper.Map<MemberResponseDto>(member);
        }

        public async Task DeleteMemberAsync(int id)
        {
            var member = await _memberRepository.GetByIdAsync(id);
            if (member == null)
                throw new ResourceNotFoundException(nameof(Member), id);

            await _memberRepository.DeleteAsync(member);
        }

        public async Task<MemberResponseDto> GetMemberByEmailAsync(string email)
        {
            var member = await _memberRepository.GetByEmailAsync(email);
            if (member == null)
                throw new ResourceNotFoundException($"Member with email {email} not found.");

            return _mapper.Map<MemberResponseDto>(member);
        }

        public async Task<int> GetActiveMemberCountAsync()
        {
            return await _memberRepository.GetActiveMemberCountAsync();
        }
    }

    /// <summary>
    /// Service implementation for Payment operations
    /// </summary>
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IMemberRepository _memberRepository;
        private readonly IMapper _mapper;

        public PaymentService(IPaymentRepository paymentRepository, IMemberRepository memberRepository, IMapper mapper)
        {
            _paymentRepository = paymentRepository;
            _memberRepository = memberRepository;
            _mapper = mapper;
        }

        public async Task<PaymentResponseDto> GetPaymentByIdAsync(int id)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);
            if (payment == null)
                throw new ResourceNotFoundException(nameof(Payment), id);

            return _mapper.Map<PaymentResponseDto>(payment);
        }

        public async Task<PaymentListResponseDto> GetAllPaymentsAsync()
        {
            var payments = await _paymentRepository.GetAllAsync();
            var paymentList = payments.ToList();

            return new PaymentListResponseDto
            {
                TotalCount = paymentList.Count,
                TotalAmount = paymentList.Sum(p => p.Amount),
                Payments = _mapper.Map<List<PaymentResponseDto>>(paymentList)
            };
        }

        public async Task<PaymentResponseDto> CreatePaymentAsync(PaymentCreateUpdateDto dto)
        {
            var member = await _memberRepository.GetByIdAsync(dto.MemberId);
            if (member == null)
                throw new ResourceNotFoundException(nameof(Member), dto.MemberId);

            var payment = new Payment
            {
                MemberId = dto.MemberId,
                Amount = dto.Amount,
                PaymentType = Enum.Parse<PaymentType>(dto.PaymentType),
                Status = PaymentStatus.Completed,
                Description = dto.Description,
                PaymentDate = dto.PaymentDate ?? DateTime.UtcNow,
                CreatedDate = DateTime.UtcNow,
                TransactionReference = dto.TransactionReference ?? GenerateTransactionReference()
            };

            await _paymentRepository.AddAsync(payment);
            return _mapper.Map<PaymentResponseDto>(payment);
        }

        public async Task<PaymentResponseDto> UpdatePaymentAsync(int id, PaymentCreateUpdateDto dto)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);
            if (payment == null)
                throw new ResourceNotFoundException(nameof(Payment), id);

            payment.MemberId = dto.MemberId;
            payment.Amount = dto.Amount;
            payment.PaymentType = Enum.Parse<PaymentType>(dto.PaymentType);
            payment.Description = dto.Description;
            payment.PaymentDate = dto.PaymentDate ?? payment.PaymentDate;

            await _paymentRepository.UpdateAsync(payment);
            return _mapper.Map<PaymentResponseDto>(payment);
        }

        public async Task DeletePaymentAsync(int id)
        {
            var payment = await _paymentRepository.GetByIdAsync(id);
            if (payment == null)
                throw new ResourceNotFoundException(nameof(Payment), id);

            await _paymentRepository.DeleteAsync(payment);
        }

        public async Task<PaymentListResponseDto> GetPaymentsByMemberAsync(int memberId)
        {
            var member = await _memberRepository.GetByIdAsync(memberId);
            if (member == null)
                throw new ResourceNotFoundException(nameof(Member), memberId);

            var payments = await _paymentRepository.GetByMemberIdAsync(memberId);
            var paymentList = payments.ToList();

            return new PaymentListResponseDto
            {
                TotalCount = paymentList.Count,
                TotalAmount = paymentList.Sum(p => p.Amount),
                Payments = _mapper.Map<List<PaymentResponseDto>>(paymentList)
            };
        }

        public async Task<PaymentListResponseDto> GetPaymentsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var payments = await _paymentRepository.GetByDateRangeAsync(startDate, endDate);
            var paymentList = payments.ToList();

            return new PaymentListResponseDto
            {
                TotalCount = paymentList.Count,
                TotalAmount = paymentList.Sum(p => p.Amount),
                Payments = _mapper.Map<List<PaymentResponseDto>>(paymentList)
            };
        }

        public async Task<decimal> GetTotalPaymentsByMemberAsync(int memberId)
        {
            return await _paymentRepository.GetTotalPaymentsByMemberAsync(memberId);
        }

        private string GenerateTransactionReference()
        {
            return $"TXN{DateTime.UtcNow:yyyyMMddHHmmss}{Guid.NewGuid().ToString().Substring(0, 8).ToUpper()}";
        }
    }

    /// <summary>
    /// Service implementation for Expense operations
    /// </summary>
    public class ExpenseService : IExpenseService
    {
        private readonly IExpenseRepository _expenseRepository;
        private readonly IMapper _mapper;

        public ExpenseService(IExpenseRepository expenseRepository, IMapper mapper)
        {
            _expenseRepository = expenseRepository;
            _mapper = mapper;
        }

        public async Task<ExpenseResponseDto> GetExpenseByIdAsync(int id)
        {
            var expense = await _expenseRepository.GetByIdAsync(id);
            if (expense == null)
                throw new ResourceNotFoundException(nameof(Expense), id);

            return _mapper.Map<ExpenseResponseDto>(expense);
        }

        public async Task<ExpenseListResponseDto> GetAllExpensesAsync()
        {
            var expenses = await _expenseRepository.GetAllAsync();
            var expenseList = expenses.ToList();

            var response = new ExpenseListResponseDto
            {
                TotalCount = expenseList.Count,
                TotalAmount = expenseList.Sum(e => e.Amount),
                Expenses = _mapper.Map<List<ExpenseResponseDto>>(expenseList)
            };

            CalculateCategoryTotals(response, expenseList);
            return response;
        }

        public async Task<ExpenseResponseDto> CreateExpenseAsync(ExpenseCreateUpdateDto dto)
        {
            var expense = new Expense
            {
                Description = dto.Description,
                Amount = dto.Amount,
                Category = Enum.Parse<ExpenseCategory>(dto.Category),
                ExpenseDate = dto.ExpenseDate ?? DateTime.UtcNow,
                CreatedDate = DateTime.UtcNow,
                Notes = dto.Notes,
                ApprovedBy = dto.ApprovedBy,
                Status = ExpenseStatus.Pending
            };

            await _expenseRepository.AddAsync(expense);
            return _mapper.Map<ExpenseResponseDto>(expense);
        }

        public async Task<ExpenseResponseDto> UpdateExpenseAsync(int id, ExpenseCreateUpdateDto dto)
        {
            var expense = await _expenseRepository.GetByIdAsync(id);
            if (expense == null)
                throw new ResourceNotFoundException(nameof(Expense), id);

            expense.Description = dto.Description;
            expense.Amount = dto.Amount;
            expense.Category = Enum.Parse<ExpenseCategory>(dto.Category);
            expense.ExpenseDate = dto.ExpenseDate ?? expense.ExpenseDate;
            expense.Notes = dto.Notes;
            expense.ApprovedBy = dto.ApprovedBy;

            await _expenseRepository.UpdateAsync(expense);
            return _mapper.Map<ExpenseResponseDto>(expense);
        }

        public async Task DeleteExpenseAsync(int id)
        {
            var expense = await _expenseRepository.GetByIdAsync(id);
            if (expense == null)
                throw new ResourceNotFoundException(nameof(Expense), id);

            await _expenseRepository.DeleteAsync(expense);
        }

        public async Task<ExpenseListResponseDto> GetExpensesByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            var expenses = await _expenseRepository.GetByDateRangeAsync(startDate, endDate);
            var expenseList = expenses.ToList();

            var response = new ExpenseListResponseDto
            {
                TotalCount = expenseList.Count,
                TotalAmount = expenseList.Sum(e => e.Amount),
                Expenses = _mapper.Map<List<ExpenseResponseDto>>(expenseList)
            };

            CalculateCategoryTotals(response, expenseList);
            return response;
        }

        public async Task<ExpenseListResponseDto> GetExpensesByCategoryAsync(string category)
        {
            var expenseCategory = Enum.Parse<ExpenseCategory>(category);
            var expenses = await _expenseRepository.GetByCategoryAsync(expenseCategory);
            var expenseList = expenses.ToList();

            var response = new ExpenseListResponseDto
            {
                TotalCount = expenseList.Count,
                TotalAmount = expenseList.Sum(e => e.Amount),
                Expenses = _mapper.Map<List<ExpenseResponseDto>>(expenseList)
            };

            CalculateCategoryTotals(response, expenseList);
            return response;
        }

        private void CalculateCategoryTotals(ExpenseListResponseDto response, List<Expense> expenses)
        {
            response.ByCategory = expenses
                .GroupBy(e => e.Category)
                .ToDictionary(g => g.Key.ToString(), g => g.Sum(e => e.Amount));
        }
    }
}
