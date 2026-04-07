-- Society Financial Management System - Database Initialization Script
-- This script can be run to create the database and initial schema

-- Create database
CREATE DATABASE [SocietyFinanceDb];
GO

USE [SocietyFinanceDb];
GO

-- Create Tables

-- Members table
CREATE TABLE [dbo].[Members] (
    [Id] INT PRIMARY KEY IDENTITY(1,1),
    [FirstName] NVARCHAR(100) NOT NULL,
    [LastName] NVARCHAR(100) NOT NULL,
    [Email] NVARCHAR(100) NOT NULL UNIQUE,
    [PhoneNumber] NVARCHAR(20),
    [Address] NVARCHAR(255),
    [MembershipFee] DECIMAL(10, 2) NOT NULL DEFAULT 0,
    [Status] NVARCHAR(50) NOT NULL,
    [JoinDate] DATETIME2 NOT NULL,
    [LastModifiedDate] DATETIME2
);

-- Payments table
CREATE TABLE [dbo].[Payments] (
    [Id] INT PRIMARY KEY IDENTITY(1,1),
    [MemberId] INT NOT NULL,
    [Amount] DECIMAL(10, 2) NOT NULL,
    [PaymentType] NVARCHAR(50) NOT NULL,
    [Status] NVARCHAR(50) NOT NULL,
    [Description] NVARCHAR(500),
    [PaymentDate] DATETIME2 NOT NULL,
    [CreatedDate] DATETIME2 NOT NULL,
    [TransactionReference] NVARCHAR(50) UNIQUE,
    CONSTRAINT [FK_Payments_Members] FOREIGN KEY ([MemberId]) REFERENCES [dbo].[Members]([Id])
);

-- Expenses table
CREATE TABLE [dbo].[Expenses] (
    [Id] INT PRIMARY KEY IDENTITY(1,1),
    [Description] NVARCHAR(200) NOT NULL,
    [Amount] DECIMAL(10, 2) NOT NULL,
    [Category] NVARCHAR(50) NOT NULL,
    [ExpenseDate] DATETIME2 NOT NULL,
    [CreatedDate] DATETIME2 NOT NULL,
    [Notes] NVARCHAR(500),
    [ApprovedBy] NVARCHAR(100),
    [Status] NVARCHAR(50) NOT NULL
);

-- Reports table
CREATE TABLE [dbo].[Reports] (
    [Id] INT PRIMARY KEY IDENTITY(1,1),
    [Title] NVARCHAR(200) NOT NULL,
    [GeneratedDate] DATETIME2 NOT NULL,
    [ReportType] NVARCHAR(50) NOT NULL,
    [TotalIncome] DECIMAL(12, 2) NOT NULL,
    [TotalExpenses] DECIMAL(12, 2) NOT NULL,
    [NetBalance] DECIMAL(12, 2) NOT NULL,
    [TotalMembers] INT NOT NULL,
    [ActiveMembers] INT NOT NULL,
    [Summary] NVARCHAR(500),
    [FromDate] DATETIME2 NOT NULL,
    [ToDate] DATETIME2 NOT NULL
);

-- AnomalyAlerts table
CREATE TABLE [dbo].[AnomalyAlerts] (
    [Id] INT PRIMARY KEY IDENTITY(1,1),
    [MemberId] INT NOT NULL,
    [AnomalyType] NVARCHAR(50) NOT NULL,
    [Description] NVARCHAR(500) NOT NULL,
    [AnomalousValue] DECIMAL(10, 2) NOT NULL,
    [DetectedDate] DATETIME2 NOT NULL,
    [Severity] NVARCHAR(50) NOT NULL,
    [IsResolved] BIT NOT NULL DEFAULT 0,
    [Resolution] NVARCHAR(500),
    [ResolvedDate] DATETIME2,
    CONSTRAINT [FK_AnomalyAlerts_Members] FOREIGN KEY ([MemberId]) REFERENCES [dbo].[Members]([Id])
);

-- Create Indexes

-- Members indexes
CREATE INDEX [IDX_Members_Email] ON [dbo].[Members]([Email]);
CREATE INDEX [IDX_Members_Status] ON [dbo].[Members]([Status]);

-- Payments indexes
CREATE INDEX [IDX_Payments_MemberId] ON [dbo].[Payments]([MemberId]);
CREATE INDEX [IDX_Payments_Status] ON [dbo].[Payments]([Status]);
CREATE INDEX [IDX_Payments_PaymentDate] ON [dbo].[Payments]([PaymentDate]);
CREATE INDEX [IDX_Payments_TransactionReference] ON [dbo].[Payments]([TransactionReference]);

-- Expenses indexes
CREATE INDEX [IDX_Expenses_Category] ON [dbo].[Expenses]([Category]);
CREATE INDEX [IDX_Expenses_Status] ON [dbo].[Expenses]([Status]);
CREATE INDEX [IDX_Expenses_ExpenseDate] ON [dbo].[Expenses]([ExpenseDate]);

-- Reports indexes
CREATE INDEX [IDX_Reports_GeneratedDate] ON [dbo].[Reports]([GeneratedDate]);
CREATE INDEX [IDX_Reports_ReportType] ON [dbo].[Reports]([ReportType]);

-- AnomalyAlerts indexes
CREATE INDEX [IDX_AnomalyAlerts_MemberId] ON [dbo].[AnomalyAlerts]([MemberId]);
CREATE INDEX [IDX_AnomalyAlerts_Severity] ON [dbo].[AnomalyAlerts]([Severity]);
CREATE INDEX [IDX_AnomalyAlerts_IsResolved] ON [dbo].[AnomalyAlerts]([IsResolved]);

-- Sample Data (Optional - Comment out if not needed)
/*
-- Insert sample members
INSERT INTO [dbo].[Members] (FirstName, LastName, Email, PhoneNumber, Address, MembershipFee, Status, JoinDate)
VALUES 
    ('Rajesh', 'Kumar', 'rajesh@example.com', '9876543210', '123 Main St', 500, 'Active', GETDATE()),
    ('Priya', 'Singh', 'priya@example.com', '9876543211', '456 Oak Ave', 500, 'Active', GETDATE()),
    ('Amit', 'Patel', 'amit@example.com', '9876543212', '789 Elm Rd', 500, 'Active', GETDATE());

-- Insert sample payments
INSERT INTO [dbo].[Payments] (MemberId, Amount, PaymentType, Status, Description, PaymentDate, CreatedDate, TransactionReference)
VALUES 
    (1, 500, 'MembershipFee', 'Completed', 'January payment', GETDATE(), GETDATE(), 'TXN001'),
    (2, 500, 'MembershipFee', 'Completed', 'January payment', GETDATE(), GETDATE(), 'TXN002'),
    (3, 500, 'MembershipFee', 'Completed', 'January payment', GETDATE(), GETDATE(), 'TXN003');

-- Insert sample expenses
INSERT INTO [dbo].[Expenses] (Description, Amount, Category, ExpenseDate, CreatedDate, Notes, ApprovedBy, Status)
VALUES 
    ('Building maintenance', 2000, 'Maintenance', GETDATE(), GETDATE(), 'Monthly repairs', 'Admin', 'Paid'),
    ('Electricity bill', 1500, 'Utilities', GETDATE(), GETDATE(), 'December consumption', 'Admin', 'Paid'),
    ('Insurance premium', 5000, 'Insurance', GETDATE(), GETDATE(), 'Annual premium', 'Admin', 'Approved');
*/

-- Stored Procedures (Optional enhancements)

-- Get Monthly Financial Summary
CREATE PROCEDURE [dbo].[sp_GetMonthlyFinancialSummary]
    @Year INT,
    @Month INT
AS
BEGIN
    DECLARE @StartDate DATETIME2 = DATEFROMPARTS(@Year, @Month, 1);
    DECLARE @EndDate DATETIME2 = EOMONTH(@StartDate);

    SELECT 
        @Year AS [Year],
        @Month AS [Month],
        ISNULL(SUM(CASE WHEN p.Status = 'Completed' THEN p.Amount ELSE 0 END), 0) AS TotalIncome,
        ISNULL(SUM(CASE WHEN e.Status = 'Paid' THEN e.Amount ELSE 0 END), 0) AS TotalExpenses,
        ISNULL(SUM(CASE WHEN p.Status = 'Completed' THEN p.Amount ELSE 0 END), 0) - 
        ISNULL(SUM(CASE WHEN e.Status = 'Paid' THEN e.Amount ELSE 0 END), 0) AS NetBalance,
        COUNT(DISTINCT CASE WHEN p.Status = 'Completed' THEN p.Id END) AS TransactionCount
    FROM 
        [dbo].[Payments] p
        FULL OUTER JOIN [dbo].[Expenses] e ON YEAR(e.ExpenseDate) = @Year AND MONTH(e.ExpenseDate) = @Month
    WHERE 
        (YEAR(p.PaymentDate) = @Year AND MONTH(p.PaymentDate) = @Month) OR
        (YEAR(e.ExpenseDate) = @Year AND MONTH(e.ExpenseDate) = @Month);
END;

-- Get Member Payment Statistics
CREATE PROCEDURE [dbo].[sp_GetMemberPaymentStats]
    @MemberId INT = NULL
AS
BEGIN
    SELECT 
        m.Id,
        m.FirstName + ' ' + m.LastName AS MemberName,
        COUNT(p.Id) AS TotalPayments,
        ISNULL(SUM(p.Amount), 0) AS TotalPaid,
        ISNULL(AVG(p.Amount), 0) AS AveragePayment,
        MAX(p.PaymentDate) AS LastPaymentDate,
        CASE 
            WHEN DATEDIFF(DAY, MAX(p.PaymentDate), GETDATE()) <= 30 THEN 1 
            ELSE 0 
        END AS IsUpToDate
    FROM 
        [dbo].[Members] m
        LEFT JOIN [dbo].[Payments] p ON m.Id = p.MemberId AND p.Status = 'Completed'
    WHERE 
        (@MemberId IS NULL OR m.Id = @MemberId)
    GROUP BY 
        m.Id, m.FirstName, m.LastName;
END;

GO
