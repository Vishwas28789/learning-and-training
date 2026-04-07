# Society Financial Management System - ASP.NET Core Web API

A comprehensive, production-ready ASP.NET Core Web API backend for managing society finances, including members, payments, expenses, financial reports, and anomaly detection.

## Project Structure

```
SocietyFinance.API/
├── Models/                 # Database models
│   ├── Member.cs
│   ├── Payment.cs
│   ├── Expense.cs
│   ├── Report.cs
│   └── AnomalyAlert.cs
├── DTOs/                   # Data Transfer Objects
│   ├── MemberDto.cs
│   ├── PaymentDto.cs
│   ├── ExpenseDto.cs
│   ├── ReportDto.cs
│   ├── AnomalyDto.cs
│   └── ApiResponse.cs
├── Data/                   # Database configuration
│   └── SocietyFinanceDbContext.cs
├── Repositories/           # Data access layer
│   ├── IRepositories.cs
│   └── Repositories.cs
├── Services/               # Business logic layer
│   ├── IServices.cs
│   ├── Services.cs
│   └── AdvancedServices.cs
├── Controllers/            # API endpoints
│   ├── MembersController.cs
│   ├── PaymentsController.cs
│   ├── ExpensesController.cs
│   ├── ReportsController.cs
│   └── AnomalyController.cs
├── Exceptions/             # Custom exceptions
│   └── CustomExceptions.cs
├── Utilities/              # Helper classes
│   └── MappingProfile.cs
├── Program.cs              # Application startup
├── DependencyInjectionExtensions.cs
├── appsettings.json
├── appsettings.Development.json
└── SocietyFinance.API.csproj
```

## Key Features

### 1. Member Management
- CRUD operations for society members
- Member status tracking (Active, Inactive, Suspended, Resigned)
- Email uniqueness validation
- Member statistics and counts

### 2. Payment Tracking
- Record and track member payments
- Multiple payment types support
- Payment status management
- Transaction reference generation
- Date range filtering

### 3. Expense Management
- Track all society expenses
- Categorized expenses (Administration, Maintenance, Utilities, Insurance, Events, Legal, Miscellaneous)
- Expense approval workflow
- Status tracking (Pending, Approved, Rejected, Paid)

### 4. Financial Reports
- Monthly financial summaries
- Annual financial analysis
- Member payment statistics
- Income vs. Expense analysis
- Report persistence in database

### 5. Anomaly Detection
- Automatic payment anomaly detection
- Rule-based anomaly identification:
  - Negative/zero amount detection
  - Unusually high payments (5x average)
  - Duplicate payment detection
- Severity-based alerts (Low, Medium, High, Critical)
- Anomaly resolution workflow

## API Endpoints

### Members
- `GET /api/members` - Get all members
- `GET /api/members/{id}` - Get member by ID
- `POST /api/members` - Create new member
- `PUT /api/members/{id}` - Update member
- `DELETE /api/members/{id}` - Delete member
- `GET /api/members/stats/active-count` - Get active member count

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/{id}` - Get payment by ID
- `POST /api/payments` - Create payment
- `PUT /api/payments/{id}` - Update payment
- `DELETE /api/payments/{id}` - Delete payment
- `GET /api/payments/member/{memberId}` - Get member's payments
- `GET /api/payments/by-date?startDate=&endDate=` - Get payments by date range

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/{id}` - Get expense by ID
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
- `GET /api/expenses/by-date?startDate=&endDate=` - Get expenses by date
- `GET /api/expenses/by-category/{category}` - Get expenses by category

### Reports
- `GET /api/reports/summary?fromDate=&toDate=` - Generate financial summary report
- `GET /api/reports/latest` - Get latest financial report
- `GET /api/reports/monthly/{year}` - Get monthly reports for a year
- `GET /api/reports/member-stats` - Get member payment statistics

### Anomaly Detection
- `POST /api/anomaly/check` - Check for anomalies in date range
- `GET /api/anomaly/unresolved` - Get unresolved anomalies
- `POST /api/anomaly/resolve/{id}` - Resolve an anomaly

## Technology Stack

- **Framework**: ASP.NET Core 8.0
- **Database**: SQL Server with Entity Framework Core (Code First)
- **ORM**: Entity Framework Core 8.0
- **Mapping**: AutoMapper
- **Logging**: Serilog
- **API Documentation**: Swagger/OpenAPI
- **Dependency Injection**: Built-in .NET Core DI

## Architecture Layers

### 1. **Controller Layer**
- Handles HTTP requests/responses
- Input validation
- Error handling
- Implements RESTful principles

### 2. **Service Layer**
- Contains business logic
- Orchestrates repositories
- Exception handling
- Data transformation

### 3. **Repository Layer**
- Data access abstraction
- Entity Framework integration
- Query optimization
- Async database operations

### 4. **Data Layer**
- DbContext configuration
- Entity relationships
- Database migrations
- Model validation

## Setup Instructions

### Prerequisites
- .NET 8.0 SDK or later
- SQL Server 2019 or later
- Visual Studio 2022 or Visual Studio Code

### Installation

1. **Update connection string** in `appsettings.json`:
   ```json
   "ConnectionStrings": {
     "DefaultConnection": "Server=YOUR_SERVER;Database=SocietyFinanceDb;Trusted_Connection=true;Encrypt=false;"
   }
   ```

2. **Restore NuGet packages**:
   ```bash
   dotnet restore
   ```

3. **Create database and run migrations**:
   ```bash
   dotnet ef database update
   ```

4. **Run the application**:
   ```bash
   dotnet run
   ```

5. **Access API documentation**:
   - Open `https://localhost:7000` in browser (Swagger UI)

## Example API Usage

### Create Member
```http
POST /api/members
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phoneNumber": "9876543210",
  "address": "123 Main St",
  "membershipFee": 500
}
```

### Create Payment
```http
POST /api/payments
Content-Type: application/json

{
  "memberId": 1,
  "amount": 500.00,
  "paymentType": "MembershipFee",
  "description": "Monthly membership fee",
  "paymentDate": "2024-01-15"
}
```

### Create Expense
```http
POST /api/expenses
Content-Type: application/json

{
  "description": "Building maintenance",
  "amount": 2000.00,
  "category": "Maintenance",
  "expenseDate": "2024-01-10",
  "notes": "Painting and repairs",
  "approvedBy": "Admin"
}
```

### Get Financial Summary
```http
GET /api/reports/summary?fromDate=2024-01-01&toDate=2024-01-31
```

### Check Anomalies
```http
POST /api/anomaly/check
Content-Type: application/json

{
  "fromDate": "2024-01-01",
  "toDate": "2024-01-31",
  "memberId": null
}
```

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { },
  "errors": [],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Success Response Example
```json
{
  "success": true,
  "message": "Member created successfully",
  "data": {
    "id": 1,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "fullName": "John Doe",
    "status": "Active",
    "joinDate": "2024-01-15T10:30:00Z"
  },
  "errors": [],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Error Response Example
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    "Email is required",
    "First name is required"
  ],
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Database Models

### Member
- Id, FirstName, LastName, Email (Unique), PhoneNumber
- Address, MembershipFee, Status, JoinDate, LastModifiedDate
- **Relationships**: One-to-Many with Payments

### Payment
- Id, MemberId, Amount, PaymentType, Status
- Description, PaymentDate, CreatedDate, TransactionReference (Unique)
- **Relationships**: Many-to-One with Member

### Expense
- Id, Description, Amount, Category, ExpenseDate
- CreatedDate, Notes, ApprovedBy, Status

### Report
- Id, Title, GeneratedDate, ReportType
- TotalIncome, TotalExpenses, NetBalance
- TotalMembers, ActiveMembers, Summary, FromDate, ToDate

### AnomalyAlert
- Id, MemberId, AnomalyType, Description, AnomalousValue
- DetectedDate, Severity, IsResolved, Resolution, ResolvedDate
- **Relationships**: Many-to-One with Member

## Enums

### MemberStatus
- Active, Inactive, Suspended, Resigned

### PaymentType
- MembershipFee, Contribution, Loan, Refund, Other

### PaymentStatus
- Pending, Completed, Failed, Cancelled

### ExpenseCategory
- Administration, Maintenance, Utilities, Insurance, Events, Legal, Miscellaneous

### ExpenseStatus
- Pending, Approved, Rejected, Paid

### ReportType
- MonthlyFinancial, QuarterlyFinancial, AnnualFinancial, MembershipStatus, PaymentAnalysis

### AnomalyType
- UnusuallyHighPayment, MissedPayment, DuplicatePayment, NegativeAmount, OutlierTransaction

### AlertSeverity
- Low, Medium, High, Critical

## Error Handling

Custom exceptions for different scenarios:

- **ResourceNotFoundException**: When a resource is not found (404)
- **ValidationException**: When data validation fails (400)
- **BusinessException**: When business rules are violated (422)
- **DuplicateException**: When duplicate resources are created (409)

## Logging

The application uses Serilog for comprehensive logging:

- Logs are written to console and file
- Log files are created daily in the `logs/` folder
- Minimum log level can be configured per environment

## Performance Considerations

- Async/await for all database operations
- Entity Framework lazy loading with explicit includes
- Query optimization with appropriate indexes
- Connection pooling with retry policies
- Pagination ready (can be added to repository methods)

## Security Notes

Currently, the API has CORS enabled for all origins. For production:
- Implement JWT authentication
- Add authorization policies
- Enable HTTPS only
- Implement rate limiting
- Add request validation middleware
- Use database encryption

## Deployment

For production deployment:

1. Update connection strings for production database
2. Set `ASPNETCORE_ENVIRONMENT` to Production
3. Enable HTTPS
4. Implement authentication/authorization
5. Configure Serilog for production logging
6. Run database migrations in production environment

## Future Enhancements

- Pagination and filtering
- Advanced reporting features
- Bulk operations
- Audit trail
- Member authentication
- Role-based access control
- Email notifications
- SMS reminders
- Mobile app API
- Data export functionality

## Support

For issues, questions, or contributions, please contact the development team or refer to the API documentation at the Swagger UI endpoint.

---

**Created**: 2024
**Version**: 1.0.0
**Status**: Production Ready
