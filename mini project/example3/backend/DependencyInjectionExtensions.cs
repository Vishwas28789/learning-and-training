using SocietyFinance.API.Data;
using SocietyFinance.API.Repositories;
using SocietyFinance.API.Services;
using SocietyFinance.API.Utilities;
using Microsoft.EntityFrameworkCore;

namespace SocietyFinance.API
{
    /// <summary>
    /// Extension methods for Dependency Injection configuration
    /// </summary>
    public static class DependencyInjectionExtensions
    {
        /// <summary>
        /// Add Application Services to the dependency injection container
        /// </summary>
        public static IServiceCollection AddApplicationServices(this IServiceCollection services, IConfiguration configuration)
        {
            // Database
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            services.AddDbContext<SocietyFinanceDbContext>(options =>
                options.UseSqlServer(connectionString, sqlOptions =>
                {
                    sqlOptions.CommandTimeout(300);
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 3,
                        maxRetryDelaySeconds: 30,
                        errorNumbersToAdd: null);
                }));

            // Repositories
            services.AddScoped<IMemberRepository, MemberRepository>();
            services.AddScoped<IPaymentRepository, PaymentRepository>();
            services.AddScoped<IExpenseRepository, ExpenseRepository>();
            services.AddScoped<IReportRepository, ReportRepository>();
            services.AddScoped<IAnomalyAlertRepository, AnomalyAlertRepository>();

            // Services
            services.AddScoped<IMemberService, MemberService>();
            services.AddScoped<IPaymentService, PaymentService>();
            services.AddScoped<IExpenseService, ExpenseService>();
            services.AddScoped<IReportService, ReportService>();
            services.AddScoped<IAnomalyDetectionService, AnomalyDetectionService>();

            // AutoMapper
            services.AddAutoMapper(typeof(MappingProfile));

            // CORS
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", builder =>
                {
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader();
                });
            });

            return services;
        }
    }
}
