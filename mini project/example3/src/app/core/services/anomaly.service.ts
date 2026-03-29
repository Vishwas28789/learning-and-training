// SmartSociety — Financial Intelligence Platform
// anomaly.service.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 13: Dependency Injection
//   - Topic 14: Services
//   - Topic 19: RxJS (map, filter operators)
// ═══════════════════════════════════════════════════════════════

import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  IExpense, ExpenseCategory, ANOMALY_THRESHOLD,
  IPayment, PaymentStatus
} from '../models';

// TS: Interface — Anomaly detection result
export interface AnomalyResult {
  entityId: string;
  entityType: 'payment' | 'expense';
  severity: 'low' | 'medium' | 'high' | 'critical';
  reason: string;
  amount: number;
  threshold: number;
  flaggedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AnomalyService {

  // Category-specific thresholds (6-month averages)
  private readonly categoryThresholds: Record<ExpenseCategory, number> = {
    [ExpenseCategory.MAINTENANCE]: 30000,
    [ExpenseCategory.RENOVATION]: 100000,
    [ExpenseCategory.SECURITY]: 50000,
    [ExpenseCategory.UTILITIES]: 25000,
    [ExpenseCategory.LANDSCAPING]: 20000,
    [ExpenseCategory.SOCIAL_EVENT]: 40000,
    [ExpenseCategory.EMERGENCY]: 75000,
    [ExpenseCategory.OTHER]: 30000
  };

  private anomaliesSubject = new BehaviorSubject<AnomalyResult[]>([]);
  public anomalies$: Observable<AnomalyResult[]> = this.anomaliesSubject.asObservable();

  /**
   * Checks if an expense amount is anomalous for its category.
   * @param amount - Expense amount
   * @param category - Expense category
   * @returns true if the amount exceeds the category threshold
   */
  isAnomalousExpense(amount: number, category: ExpenseCategory): boolean {
    const threshold = this.categoryThresholds[category] ?? ANOMALY_THRESHOLD;
    return amount > threshold * 1.5; // 150% of average is anomalous
  }

  /**
   * Scans an array of expenses for anomalies.
   * @param expenses - Array of expenses to scan
   * @returns Array of detected anomalies
   */
  detectExpenseAnomalies(expenses: IExpense[]): AnomalyResult[] {
    const anomalies: AnomalyResult[] = [];

    expenses.forEach((expense) => {
      const threshold = this.categoryThresholds[expense.category] ?? ANOMALY_THRESHOLD;

      if (expense.amount > threshold * 1.5) {
        const ratio = expense.amount / threshold;
        let severity: AnomalyResult['severity'] = 'low';

        if (ratio > 3) severity = 'critical';
        else if (ratio > 2.5) severity = 'high';
        else if (ratio > 2) severity = 'medium';

        anomalies.push({
          entityId: expense.id,
          entityType: 'expense',
          severity,
          reason: `Amount ₹${expense.amount.toLocaleString('en-IN')} is ${Math.round(ratio * 100)}% of the average for ${expense.category}`,
          amount: expense.amount,
          threshold,
          flaggedAt: new Date().toISOString()
        });
      }
    });

    this.anomaliesSubject.next(anomalies);
    return anomalies;
  }

  /**
   * Scans payments for suspicious patterns.
   * @param payments - Array of payments to scan
   * @returns Array of flagged anomalies
   */
  detectPaymentAnomalies(payments: IPayment[]): AnomalyResult[] {
    const anomalies: AnomalyResult[] = [];

    // Check for unusually large payments
    const amounts = payments.map((p) => p.amount);
    const average = amounts.reduce((s, a) => s + a, 0) / amounts.length || 0;
    const stdDev = Math.sqrt(
      amounts.reduce((s, a) => s + Math.pow(a - average, 2), 0) / amounts.length
    );

    payments.forEach((payment) => {
      // Flag if payment is more than 2 standard deviations from mean
      if (payment.amount > average + 2 * stdDev && stdDev > 0) {
        anomalies.push({
          entityId: payment.id,
          entityType: 'payment',
          severity: payment.amount > average + 3 * stdDev ? 'high' : 'medium',
          reason: `Payment of ₹${payment.amount.toLocaleString('en-IN')} is significantly above average (₹${Math.round(average).toLocaleString('en-IN')})`,
          amount: payment.amount,
          threshold: Math.round(average + 2 * stdDev),
          flaggedAt: new Date().toISOString()
        });
      }
    });

    return anomalies;
  }

  /**
   * Gets the anomaly count as an observable.
   */
  getAnomalyCount(): Observable<number> {
    return this.anomalies$.pipe(
      map((anomalies) => anomalies.length)
    );
  }

  /**
   * Checks if a specific amount exceeds the generic threshold.
   * Used by the AnomalyFlagDirective.
   */
  isAboveThreshold(amount: number): boolean {
    return amount > ANOMALY_THRESHOLD;
  }
}
