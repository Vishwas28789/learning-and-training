// SmartSociety — Financial Intelligence Platform
// report.service.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 13: Dependency Injection
//   - Topic 14: Services
//   - Topic 19: RxJS (combineLatest, forkJoin)
// ═══════════════════════════════════════════════════════════════

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest, forkJoin, BehaviorSubject } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  IReport, ReportSummary, TrendData, ChartDataPoint,
  AIReportSection
} from '../models';
import { PaymentService } from './payment.service';
import { MemberService } from './member.service';

@Injectable({ providedIn: 'root' })
export class ReportService {

  private http = inject(HttpClient);
  private paymentService = inject(PaymentService);
  private memberService = inject(MemberService);
  private apiUrl = `${environment.apiUrl}`;

  private healthScoreSubject = new BehaviorSubject<number>(0);
  public healthScore$: Observable<number> = this.healthScoreSubject.asObservable();

  /**
   * Generates a financial summary by combining payment and member data.
   * RXJS: combineLatest — Combines latest emissions from multiple observables
   */
  getFinancialSummary(): Observable<ReportSummary> {
    // RXJS: combineLatest — Combine payment and member streams
    return combineLatest([
      this.paymentService.payments$,
      this.memberService.members$
    ]).pipe(
      map(([payments, members]) => {
        const totalIncome = payments
          .filter((p) => p.status === 'PAID')
          .reduce((sum, p) => sum + p.amount, 0);

        const totalExpenses = payments
          .filter((p) => p.type === 'MAINTENANCE')
          .reduce((sum, p) => sum + p.amount, 0) * 0.6; // 60% operational cost

        const overdueAccounts = members.filter((m) => m.paymentStatus === 'OVERDUE').length;

        const summary: ReportSummary = {
          totalIncome,
          totalExpenses,
          netBalance: totalIncome - totalExpenses,
          collectionEfficiency: members.length > 0
            ? Math.round(((members.length - overdueAccounts) / members.length) * 100)
            : 0,
          overdueAccounts,
          activeMembers: members.filter((m) => m.isActive).length
        };

        // Calculate and emit health score
        this.healthScoreSubject.next(this.calculateHealthScore(summary));

        return summary;
      })
    );
  }

  /**
   * Gets monthly trend data for chart visualization.
   */
  getMonthlyTrends(): Observable<TrendData[]> {
    return this.paymentService.payments$.pipe(
      map((payments) => {
        const trendMap = new Map<string, TrendData>();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        payments.forEach((p) => {
          const date = new Date(p.date);
          const key = `${months[date.getMonth()]} ${date.getFullYear()}`;

          if (!trendMap.has(key)) {
            trendMap.set(key, { month: key, income: 0, expenses: 0, balance: 0 });
          }

          const entry = trendMap.get(key)!;
          if (p.status === 'PAID') {
            entry.income += p.amount;
          }
          entry.expenses += p.amount * 0.3;
          entry.balance = entry.income - entry.expenses;
        });

        return Array.from(trendMap.values()).slice(-6);
      })
    );
  }

  /**
   * Gets collection rate data for bar chart.
   */
  getCollectionRateChart(): Observable<ChartDataPoint[]> {
    return this.paymentService.getMonthlyBreakdown().pipe(
      map((months) =>
        months.slice(-6).map((m) => ({
          label: m.month.substring(0, 3),
          value: m.paidCount + m.pendingCount > 0
            ? Math.round((m.paidCount / (m.paidCount + m.pendingCount + m.overdueCount)) * 100)
            : 0,
          color: 'var(--sage)'
        }))
      )
    );
  }

  /**
   * Generates AI report sections using simulated data.
   * Used for the typewriter streaming simulation.
   */
  generateAIReport(): AIReportSection[] {
    return [
      {
        heading: 'Executive Summary',
        content: `The SmartSociety financial health stands at a moderate level this quarter. 
Collection efficiency has improved by 8% compared to last quarter, reaching 87% overall. 
However, 3 flats remain in critical overdue status requiring immediate attention. 
The anomaly detection system flagged 2 suspicious expenses that need committee review.`,
        confidence: 0.92,
        dataPoints: [
          { label: 'Collection Rate', value: 87, color: 'var(--sage)' },
          { label: 'Overdue Rate', value: 13, color: 'var(--rust)' }
        ]
      },
      {
        heading: 'Payment Analysis',
        content: `Monthly maintenance collection has been consistent at ₹2,45,000 average.
UPI payments account for 68% of all transactions, followed by bank transfers at 22%.
Late payment penalties collected this quarter: ₹12,500.
Recommended: Implement auto-debit to reduce manual follow-ups by 40%.`,
        confidence: 0.88,
        dataPoints: [
          { label: 'UPI', value: 68, color: 'var(--gold)' },
          { label: 'Bank', value: 22, color: 'var(--slate)' },
          { label: 'Cash', value: 10, color: 'var(--ink-muted)' }
        ]
      },
      {
        heading: 'Default Risk Assessment',
        content: `3 members are flagged as high default risk based on credit score analysis.
Flat A-102: Credit score 22, 4 months overdue, outstanding ₹48,000.
Flat B-205: Credit score 35, 2 months partial payment.
Flat C-301: Credit score 28, new pattern of delayed payments observed.
Recommendation: Initiate personal counseling sessions before legal notices.`,
        confidence: 0.85,
        dataPoints: [
          { label: 'Low Risk', value: 75, color: 'var(--sage)' },
          { label: 'Medium', value: 15, color: 'var(--gold)' },
          { label: 'High Risk', value: 10, color: 'var(--rust)' }
        ]
      },
      {
        heading: 'Expense Optimization',
        content: `Total society expenses this quarter: ₹4,80,000.
Security services account for the largest share at 35%, followed by maintenance at 28%.
Anomaly detected: Landscaping expense of ₹78,000 is 156% above the 6-month average.
Suggestion: Re-negotiate security contract — competitive quotes show 15% savings potential.`,
        confidence: 0.79,
        dataPoints: [
          { label: 'Security', value: 35, color: 'var(--slate)' },
          { label: 'Maintenance', value: 28, color: 'var(--sage)' },
          { label: 'Utilities', value: 22, color: 'var(--gold)' },
          { label: 'Other', value: 15, color: 'var(--ink-muted)' }
        ]
      }
    ];
  }

  /**
   * Calculates society health score (composite metric).
   * @param summary - Financial summary data
   * @returns Score from 0-100
   */
  private calculateHealthScore(summary: ReportSummary): number {
    let score = 50;

    // Collection efficiency weight: 40%
    score += (summary.collectionEfficiency / 100) * 40;

    // Balance health weight: 30%
    if (summary.netBalance > 0) {
      score += Math.min(15, (summary.netBalance / summary.totalIncome) * 30);
    } else {
      score -= 10;
    }

    // Overdue penalty weight: 30%
    if (summary.activeMembers > 0) {
      const overdueRatio = summary.overdueAccounts / summary.activeMembers;
      score -= overdueRatio * 30;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
