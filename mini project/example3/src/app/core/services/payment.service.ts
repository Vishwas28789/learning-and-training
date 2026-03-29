// SmartSociety — Financial Intelligence Platform
// payment.service.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 14: Services (CRUD + BehaviorSubject)
//   - Topic 13: Dependency Injection
//   - Topic 16: HTTP Client
//   - Topic 19: RxJS (Observables, operators)
// ═══════════════════════════════════════════════════════════════

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError, interval } from 'rxjs';
import { map, tap, catchError, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  IPayment, Payment, PaymentStatus, PaymentType, PaymentMode,
  PaymentSummary, MonthlyPayment
} from '../models';

// ANGULAR: Service with BehaviorSubject
@Injectable({ providedIn: 'root' })
export class PaymentService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/payments`;

  // ANGULAR: Service with BehaviorSubject — Central state for payments
  private paymentsSubject = new BehaviorSubject<IPayment[]>([]);
  public payments$: Observable<IPayment[]> = this.paymentsSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * Fetches all payments from the API.
   */
  getAll(): Observable<IPayment[]> {
    this.loadingSubject.next(true);
    return this.http.get<IPayment[]>(this.apiUrl).pipe(
      tap((payments) => {
        this.paymentsSubject.next(payments);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Fetches a single payment by ID.
   */
  getById(id: string): Observable<IPayment> {
    return this.http.get<IPayment>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Creates a new payment.
   */
  create(payment: Partial<IPayment>): Observable<IPayment> {
    const newPayment = {
      ...payment,
      id: `PAY-${Date.now()}`,
      lateFee: this.calculateLateFee(payment.date || ''),
      isLate: this.isPaymentLate(payment.date || '')
    };

    return this.http.post<IPayment>(this.apiUrl, newPayment).pipe(
      tap((created) => {
        const current = this.paymentsSubject.getValue();
        this.paymentsSubject.next([...current, created]);
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Updates an existing payment.
   */
  update(id: string, data: Partial<IPayment>): Observable<IPayment> {
    return this.http.put<IPayment>(`${this.apiUrl}/${id}`, data).pipe(
      tap((updated) => {
        const current = this.paymentsSubject.getValue();
        const index = current.findIndex((p) => p.id === id);
        if (index > -1) {
          current[index] = updated;
          this.paymentsSubject.next([...current]);
        }
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Deletes a payment by ID.
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.paymentsSubject.getValue();
        this.paymentsSubject.next(current.filter((p) => p.id !== id));
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Calculates payment summary from current state.
   */
  getPaymentSummary(): Observable<PaymentSummary> {
    return this.payments$.pipe(
      map((payments) => {
        const paid = payments.filter((p) => p.status === PaymentStatus.PAID);
        const pending = payments.filter((p) => p.status === PaymentStatus.PENDING);
        const overdue = payments.filter((p) => p.status === PaymentStatus.OVERDUE);
        const latePayments = payments.filter((p) => p.isLate);

        const totalCollected = paid.reduce((sum, p) => sum + p.amount, 0);
        const totalPending = pending.reduce((sum, p) => sum + p.amount, 0);
        const totalOverdue = overdue.reduce((sum, p) => sum + p.amount + p.lateFee, 0);

        return {
          totalCollected,
          totalPending,
          totalOverdue,
          collectionRate: payments.length > 0
            ? Math.round((paid.length / payments.length) * 100)
            : 0,
          averagePayment: paid.length > 0
            ? Math.round(totalCollected / paid.length)
            : 0,
          latePaymentCount: latePayments.length
        };
      })
    );
  }

  /**
   * Gets monthly payment breakdown.
   */
  getMonthlyBreakdown(): Observable<MonthlyPayment[]> {
    return this.payments$.pipe(
      map((payments) => {
        const months = new Map<string, MonthlyPayment>();

        payments.forEach((p) => {
          const date = new Date(p.date);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          const monthName = date.toLocaleString('en-IN', { month: 'long' });

          if (!months.has(key)) {
            months.set(key, {
              month: monthName,
              year: date.getFullYear(),
              totalAmount: 0,
              paidCount: 0,
              pendingCount: 0,
              overdueCount: 0
            });
          }

          const entry = months.get(key)!;
          entry.totalAmount += p.amount;

          if (p.status === PaymentStatus.PAID) entry.paidCount++;
          else if (p.status === PaymentStatus.PENDING) entry.pendingCount++;
          else if (p.status === PaymentStatus.OVERDUE) entry.overdueCount++;
        });

        return Array.from(months.values());
      })
    );
  }

  /**
   * Live late fee counter — updates every second.
   * Returns an Observable that recalculates fees each second.
   */
  getLiveLateFees(): Observable<number> {
    return interval(1000).pipe(
      switchMap(() => this.payments$),
      map((payments) => {
        const now = new Date();
        return payments
          .filter((p) => p.status === PaymentStatus.OVERDUE)
          .reduce((total, p) => {
            const dueDate = new Date(p.date);
            const days = Math.max(0, Math.ceil(
              (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
            ));
            return total + (days * 50); // ₹50 per day late fee
          }, 0);
      })
    );
  }

  /**
   * CSV export — Pure TypeScript, no library.
   * Converts payment data to CSV format.
   */
  exportToCSV(): string {
    const payments = this.paymentsSubject.getValue();
    const headers = [
      'ID', 'Flat No', 'Amount', 'Type', 'Date',
      'Mode', 'Reference', 'Late', 'Late Fee', 'Status'
    ];

    const rows = payments.map((p) => [
      p.id,
      p.flatNo,
      p.amount.toString(),
      p.type,
      p.date,
      p.mode,
      p.referenceNo,
      p.isLate ? 'Yes' : 'No',
      p.lateFee.toString(),
      p.status
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  /**
   * Triggers CSV download in the browser.
   */
  downloadCSV(): void {
    const csv = this.exportToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payments_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Checks if a payment date is past due.
   */
  private isPaymentLate(dateStr: string): boolean {
    if (!dateStr) return false;
    const dueDate = new Date(dateStr);
    return dueDate < new Date();
  }

  /**
   * Calculates late fee based on days past due.
   */
  private calculateLateFee(dateStr: string): number {
    return Payment.calculateLateFee(dateStr, 50);
  }
}
