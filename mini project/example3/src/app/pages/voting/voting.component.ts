// SmartSociety — Financial Intelligence Platform
// voting.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components (standalone, lifecycle)
//   - Topic 11: Data Binding (all 4 types)
//   - Topic 12: Directives (*ngFor, *ngIf, [ngClass], [ngStyle])
//   - Topic 13: DI
//   - Topic 19: RxJS (interval, takeUntil)
// ═══════════════════════════════════════════════════════════════

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, interval } from 'rxjs';
import { takeUntil, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { StateService } from '../../core/services/state.service';
import { AnomalyService } from '../../core/services/anomaly.service';
import { IExpense, ExpenseStatus, ANOMALY_THRESHOLD } from '../../core/models';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { AnomalyFlagDirective } from '../../shared/directives/anomaly-flag.directive';
import { HighlightDirective } from '../../shared/directives/highlight.directive';

@Component({
  selector: 'app-voting',
  standalone: true,
  imports: [
    CommonModule, CurrencyInrPipe,
    AnomalyFlagDirective, HighlightDirective
  ],
  templateUrl: './voting.component.html',
  styleUrls: ['./voting.component.css']
})
export class VotingComponent implements OnInit, OnDestroy {

  expenses: IExpense[] = [];
  isLoading = true;
  countdowns: Record<string, string> = {};

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private stateService: StateService,
    private anomalyService: AnomalyService
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
    this.startCountdownTimer();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadExpenses(): void {
    this.isLoading = true;
    this.http.get<IExpense[]>(`${environment.apiUrl}/expenses`).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.anomalyService.detectExpenseAnomalies(expenses);
        this.stateService.setExpenses(expenses);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.stateService.showToast('Failed to load expenses', 'error');
      }
    });
  }

  /**
   * Live countdown timer — Updates every second using RxJS interval.
   */
  private startCountdownTimer(): void {
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.expenses.forEach((expense) => {
        this.countdowns[expense.id] = this.getCountdown(expense.deadline);
      });
    });
  }

  private getCountdown(deadline: string): string {
    const now = new Date().getTime();
    const end = new Date(deadline).getTime();
    const diff = end - now;

    if (diff <= 0) return 'Voting ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  vote(expenseId: string, voteType: 'for' | 'against'): void {
    const expense = this.expenses.find((e) => e.id === expenseId);
    if (!expense) return;

    if (voteType === 'for') {
      expense.votesFor++;
    } else {
      expense.votesAgainst++;
    }

    const totalVotes = expense.votesFor + expense.votesAgainst;
    if (totalVotes >= expense.totalMembers) {
      expense.status = expense.votesFor > expense.votesAgainst ? 'approved' : 'rejected';
    }

    this.stateService.showToast(
      `Voted ${voteType} "${expense.title}"`,
      voteType === 'for' ? 'success' : 'warning'
    );
  }

  getVotePercentage(expense: IExpense): number {
    const total = expense.votesFor + expense.votesAgainst;
    return total > 0 ? Math.round((expense.votesFor / total) * 100) : 0;
  }

  getStatusClass(status: ExpenseStatus): string {
    const map: Record<ExpenseStatus, string> = {
      'active': 'chip-active',
      'approved': 'chip-approved',
      'rejected': 'chip-rejected'
    };
    return map[status];
  }

  trackByExpenseId(index: number, expense: IExpense): string {
    return expense.id;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
