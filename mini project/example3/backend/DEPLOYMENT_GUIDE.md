# ASP.NET Core Web API - Setup and Deployment Guide

## Prerequisites

Before proceeding with setup and deployment, ensure you have:

- .NET 8.0 SDK or later
- SQL Server 2019 or later (or SQL Server Express)
- Visual Studio 2022 (recommended) or Visual Studio Code
- Git for version control
- Postman or similar tool for API testing (optional)

## Local Development Setup

### Step 1: Clone or Download the Project

```bash
cd C:\Users\vishw\OneDrive\Desktop
# Project is already downloaded in SocietyFinance.API folder
```

### Step 2: Update Connection String

1. Open `appsettings.Development.json`
2. Update the connection string for your local SQL Server:

```json
"ConnectionStrings": {
  "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=SocietyFinanceDb_Dev;Trusted_Connection=true;Encrypt=false;"
}
```

For SQL Server Express:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=.\\SQLEXPRESS;Database=SocietyFinanceDb;Trusted_Connection=true;Encrypt=false;"
}
```

### Step 3: Restore Dependencies

```bash
cd SocietyFinance.API
dotnet restore
```

### Step 4: Create Database and Apply Migrations

The application uses Entity Framework Core migrations. Migrations will run automatically on startup.

To manually apply migrations:

```bash
# Create a new migration if you made changes
dotnet ef migrations add InitialCreate

# Apply pending migrations
dotnet ef database update
```

Or run the SQL script directly in SQL Server Management Studio:
```bash
1. Open SQL Server Management Studio
2. Open the Database_Init.sql file
3. Execute the script
```

### Step 5: Run the Application

```bash
dotnet run
```

The application will start on `https://localhost:7000` (HTTPS) and `http://localhost:5000` (HTTP).

### Step 6: Access the API

- **API Documentation (Swagger)**: https://localhost:7000
- **API Base URL**: https://localhost:7000/api

## Project Structure Overview

```
SocietyFinance.API/
├── Controllers/          # API endpoints
├── Services/             # Business logic
├── Repositories/         # Data access
├── Models/              # Database entities
├── DTOs/               # Data transfer objects
├── Data/              # DbContext
├── Exceptions/        # Custom exceptions
├── Utilities/         # Helpers and mappers
├── Program.cs         # Application entry point
├── appsettings.json           # Default settings
├── appsettings.Development.json # Development settings
└── SocietyFinance.API.csproj  # Project file
```

## Building the Project

### Development Build

```bash
dotnet build
```

### Release Build

```bash
dotnet build -c Release
```

## Running Tests

Currently, no tests are included in the skeleton. To add tests:

```bash
# Create a test project
dotnet new xunit -n SocietyFinance.API.Tests
dotnet add reference ../SocietyFinance.API/

# Run tests
dotnet test
```

## Database Management

### View Database Schema

```bash
# In SQL Server Management Studio
# Connect to your local SQL Server
# Expand Databases > SocietyFinanceDb_Dev > Tables
# View tables: Members, Payments, Expenses, Reports, AnomalyAlerts
```

### Reset Database

```bash
# Back up any important data first

# Remove the database
dotnet ef database drop -f

# Recreate and migrate
dotnet ef database update
```

## API Testing

### Using Swagger UI

1. Navigate to https://localhost:7000
2. Explore all endpoints with interactive documentation
3. Test endpoints directly from the UI

### Using Postman

1. Import the API endpoints
2. Create requests for each endpoint
3. Test with various inputs and scenarios

Example Postman collection can be created with:
- Base URL: `https://localhost:7000/api`
- Endpoints: members, payments, expenses, reports, anomaly

## Logging and Monitoring

### View Logs

Logs are written to:
- **Console**: Real-time output in terminal
- **Files**: `logs/app-YYYY-MM-DD.txt` folder

To change log level, modify `appsettings.json`:

```json
"Logging": {
  "LogLevel": {
    "Default": "Debug",  // Change to Information, Warning, or Error
    "Microsoft.EntityFrameworkCore": "Debug"
  }
}
```

## Performance Optimization

### Database Optimization

1. **Add Indexes**: Already configured in the code
2. **Query Optimization**: Use appropriate query methods
3. **Pagination**: Can be added to repository methods
4. **Caching**: Consider implementing distributed caching for reports

### Code Optimization

1. Use async/await for all I/O operations (already implemented)
2. Implement pagination for large datasets
3. Use projection to select only required fields
4. Implement connection pooling

## Security Setup for Production

### 1. Enable Authentication

Add JWT authentication:

```csharp
services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => { ... });
```

### 2. Add Authorization

```csharp
[Authorize]
public async Task<ActionResult> GetAllMembers() { ... }
```

### 3. HTTPS Configuration

Update `appsettings.json`:
```json
{
  "Kestrel": {
    "Endpoints": {
      "Https": {
        "Url": "https://localhost:7000",
        "Certificate": {
          "Path": "path/to/certificate.pfx",
          "Password": "your-password"
        }
      }
    }
  }
}
```

### 4. Rate Limiting

Add rate limiting middleware for production.

### 5. Input Validation

All DTOs have validation attributes. Ensure validation is checked in controllers (already implemented).

## Deployment

### Azure Deployment

```bash
# Create Azure App Service
az webapp create --resource-group myResourceGroup --plan myAppServicePlan --name myWebApp

# Publish
dotnet publish -c Release
# Upload the contents of bin/Release/net8.0/publish to Azure
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["SocietyFinance.API.csproj", "."]
RUN dotnet restore "SocietyFinance.API.csproj"
COPY . .
RUN dotnet build "SocietyFinance.API.csproj" -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/runtime:8.0
WORKDIR /app
COPY --from=build /app/build .
EXPOSE 80
ENTRYPOINT ["dotnet", "SocietyFinance.API.dll"]
```

Build and run:
```bash
docker build -t societyfinance-api .
docker run -p 8080:80 societyfinance-api
```

### IIS Deployment

1. Publish the application:
```bash
dotnet publish -c Release -o ./publish
```

2. Create an IIS website pointing to the `publish` folder
3. Ensure the application pool runs in .NET Core mode
4. Configure database connection string in `appsettings.json`

## Troubleshooting

### Database Connection Issues

1. Verify SQL Server is running
2. Check connection string in `appsettings.json`
3. Ensure user has appropriate permissions
4. Verify database exists

### Migration Errors

```bash
# Remove the latest migration
dotnet ef migrations remove

# Recreate and apply
dotnet ef migrations add YourMigrationName
dotnet ef database update
```

### Port Already in Use

Change the port in `Program.cs` or `launchSettings.json`:

```json
"profiles": {
  "https": {
    "commandName": "Project",
    "applicationUrl": "https://localhost:7001;http://localhost:5001"
  }
}
```

### CORS Issues

Update CORS policy in `DependencyInjectionExtensions.cs`:

```csharp
options.AddPolicy("AllowSpecificOrigin", builder =>
{
    builder.WithOrigins("https://yourangularapp.com")
           .AllowAnyMethod()
           .AllowAnyHeader();
});
```

## Health Check Endpoint

Add health check endpoint:

```csharp
app.MapHealthChecks("/health");
```

## API Documentation

API documentation is available at:
- **Swagger UI**: https://localhost:7000/swagger
- **OpenAPI JSON**: https://localhost:7000/swagger/v1/swagger.json

## Monitoring and Logging Best Practices

1. **Always log exceptions** with context
2. **Use appropriate log levels**
3. **Monitor database performance** queries
4. **Track anomaly detection** operations
5. **Alert on critical errors**

## Backup and Recovery

### Backup Database

```sql
BACKUP DATABASE [SocietyFinanceDb] 
TO DISK = 'C:\Backups\SocietyFinanceDb.bak'
```

### Restore Database

```sql
RESTORE DATABASE [SocietyFinanceDb] 
FROM DISK = 'C:\Backups\SocietyFinanceDb.bak'
```

## Maintenance Tasks

1. **Regular backups**: Daily or weekly
2. **Log rotation**: Configure Serilog to clean old logs
3. **Database maintenance**: Index defragmentation
4. **Security updates**: Keep .NET updated
5. **Dependency updates**: Update NuGet packages regularly

## Support and Documentation

- **Official .NET Docs**: https://docs.microsoft.com/dotnet
- **Entity Framework Core**: https://docs.microsoft.com/ef/
- **ASP.NET Core**: https://docs.microsoft.com/aspnet/core
- **API Documentation**: See README.md
- **Angular Integration**: See ANGULAR_INTEGRATION.md

---

**Version**: 1.0.0
**Last Updated**: 2024-01-15
