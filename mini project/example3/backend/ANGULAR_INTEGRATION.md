# API Integration Guide for Angular Frontend

This document provides guidance on integrating the Society Financial Management System API with the Angular frontend.

## Base URL

```
Development: https://localhost:7000
Production: https://api.societyfinance.com
```

## API Configuration in Angular

### 1. Create Environment Configuration

Create `environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7000/api'
};
```

Create `environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.societyfinance.com/api'
};
```

### 2. Create HTTP Service

```typescript
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`);
  }

  post<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, data);
  }

  put<T>(endpoint: string, data: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`, data);
  }

  delete<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.apiUrl}/${endpoint}`);
  }
}
```

## Common API Calls

### Member Management

```typescript
// Get all members
this.apiService.get<MemberListResponseDto>('members').subscribe(response => {
  if (response.success) {
    this.members = response.data.members;
  }
});

// Get specific member
this.apiService.get<MemberResponseDto>(`members/${id}`).subscribe(response => {
  if (response.success) {
    this.member = response.data;
  }
});

// Create member
const memberData: MemberCreateUpdateDto = { ... };
this.apiService.post<MemberResponseDto>('members', memberData).subscribe(response => {
  if (response.success) {
    // Member created
  }
});

// Update member
this.apiService.put<MemberResponseDto>(`members/${id}`, memberData).subscribe(response => {
  if (response.success) {
    // Member updated
  }
});

// Delete member
this.apiService.delete<ApiResponse>(`members/${id}`).subscribe(response => {
  if (response.success) {
    // Member deleted
  }
});
```

### Payment Operations

```typescript
// Get all payments
this.apiService.get<PaymentListResponseDto>('payments').subscribe(response => {
  if (response.success) {
    this.payments = response.data.payments;
    this.totalAmount = response.data.totalAmount;
  }
});

// Get member payments
this.apiService.get<PaymentListResponseDto>(`payments/member/${memberId}`).subscribe(response => {
  if (response.success) {
    this.memberPayments = response.data.payments;
  }
});

// Get payments by date range
const params = {
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
};
this.apiService.get<PaymentListResponseDto>(`payments/by-date?startDate=${params.startDate}&endDate=${params.endDate}`)
  .subscribe(response => {
    if (response.success) {
      this.payments = response.data.payments;
    }
  });

// Create payment
const paymentData: PaymentCreateUpdateDto = {
  memberId: 1,
  amount: 500,
  paymentType: 'MembershipFee',
  description: 'Monthly payment'
};
this.apiService.post<PaymentResponseDto>('payments', paymentData).subscribe(response => {
  if (response.success) {
    // Payment created
  }
});
```

### Expense Management

```typescript
// Get all expenses
this.apiService.get<ExpenseListResponseDto>('expenses').subscribe(response => {
  if (response.success) {
    this.expenses = response.data.expenses;
    this.totalExpense = response.data.totalAmount;
    this.expensesByCategory = response.data.byCategory;
  }
});

// Get expenses by category
this.apiService.get<ExpenseListResponseDto>('expenses/by-category/Maintenance')
  .subscribe(response => {
    if (response.success) {
      this.maintenanceExpenses = response.data.expenses;
    }
  });

// Create expense
const expenseData: ExpenseCreateUpdateDto = {
  description: 'Building maintenance',
  amount: 2000,
  category: 'Maintenance',
  notes: 'Painting work'
};
this.apiService.post<ExpenseResponseDto>('expenses', expenseData).subscribe(response => {
  if (response.success) {
    // Expense created
  }
});
```

### Financial Reports

```typescript
// Get financial summary
const fromDate = new Date('2024-01-01');
const toDate = new Date('2024-01-31');

this.apiService.get<FinancialSummaryReportDto>(
  `reports/summary?fromDate=${fromDate.toISOString()}&toDate=${toDate.toISOString()}`
).subscribe(response => {
  if (response.success) {
    this.report = response.data;
  }
});

// Get latest report
this.apiService.get<FinancialSummaryReportDto>('reports/latest').subscribe(response => {
  if (response.success) {
    this.latestReport = response.data;
  }
});

// Get monthly reports
this.apiService.get<MonthlyReportDto[]>('reports/monthly/2024').subscribe(response => {
  if (response.success) {
    this.monthlyReports = response.data;
  }
});

// Get member payment stats
this.apiService.get<MemberPaymentStatsDto[]>('reports/member-stats').subscribe(response => {
  if (response.success) {
    this.memberStats = response.data;
  }
});
```

### Anomaly Detection

```typescript
// Check for anomalies
const anomalyRequest: AnomalyCheckRequestDto = {
  fromDate: new Date('2024-01-01'),
  toDate: new Date('2024-01-31'),
  memberId: null
};

this.apiService.post<AnomalyCheckResponseDto>('anomaly/check', anomalyRequest)
  .subscribe(response => {
    if (response.success) {
      this.anomalies = response.data.anomalies;
      this.unresolvedCount = response.data.unresolvedCount;
    }
  });

// Get unresolved anomalies
this.apiService.get<AnomalyAlertResponseDto[]>('anomaly/unresolved')
  .subscribe(response => {
    if (response.success) {
      this.unresolvedAnomalies = response.data;
    }
  });

// Resolve anomaly
this.apiService.post<AnomalyAlertResponseDto>(`anomaly/resolve/${anomalyId}`, 'Manual verification done')
  .subscribe(response => {
    if (response.success) {
      // Anomaly resolved
    }
  });
```

## DTOs for Angular

Copy these interfaces to your Angular project:

```typescript
// API Response wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
  timestamp: Date;
}

// Member DTOs
interface MemberResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  membershipFee: number;
  status: string;
  joinDate: Date;
  lastModifiedDate?: Date;
}

// Payment DTOs
interface PaymentResponseDto {
  id: number;
  memberId: number;
  memberName: string;
  amount: number;
  paymentType: string;
  status: string;
  description: string;
  paymentDate: Date;
  createdDate: Date;
  transactionReference: string;
}

// Expense DTOs
interface ExpenseResponseDto {
  id: number;
  description: string;
  amount: number;
  category: string;
  expenseDate: Date;
  createdDate: Date;
  notes: string;
  approvedBy: string;
  status: string;
}

// Report DTOs
interface FinancialSummaryReportDto {
  reportId: number;
  generatedDate: Date;
  reportType: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  averagePaymentPerMember: number;
  totalMembers: number;
  activeMembers: number;
  membershipCoverage: number;
  fromDate: Date;
  toDate: Date;
}
```

## Error Handling

```typescript
import { HttpErrorResponse } from '@angular/common/http';

this.apiService.get<any>('members').subscribe({
  next: (response) => {
    if (response.success) {
      // Handle success
    } else {
      // Handle API-level errors
      const errors = response.errors;
    }
  },
  error: (error: HttpErrorResponse) => {
    // Handle HTTP errors
    if (error.status === 404) {
      console.error('Resource not found');
    } else if (error.status === 400) {
      console.error('Bad request');
    } else if (error.status === 500) {
      console.error('Server error');
    }
  }
});
```

## CORS Configuration

The API allows CORS from all origins in development. For production, update the CORS policy in the backend.

## Best Practices

1. **Always check `response.success`** before using the data
2. **Handle errors appropriately** for better UX
3. **Use loading indicators** during API calls
4. **Cache responses** where appropriate
5. **Implement pagination** for large datasets
6. **Use proper HTTP methods** (GET for retrieval, POST for creation, PUT for updates)
7. **Validate input data** before sending to API

## Testing the API

Use tools like Postman or Insomnia to test endpoints:

1. Set base URL to `https://localhost:7000/api`
2. Test each endpoint with sample data
3. Verify response format and status codes
4. Test error scenarios

---

**Version**: 1.0.0
**Last Updated**: 2024-01-15
