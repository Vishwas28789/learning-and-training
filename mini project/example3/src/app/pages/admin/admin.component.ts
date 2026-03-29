// SmartSociety — Financial Intelligence Platform
// admin.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components
//   - Topic 11: Data Binding (all 4 types)
//   - Topic 12: Directives (*ngFor, *ngIf, [ngClass])
//   - Topic 15: Routing (Router.navigate programmatically)
// ═══════════════════════════════════════════════════════════════

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { StateService } from '../../core/services/state.service';
import { IExpense, ExpenseStatus } from '../../core/models';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { AnomalyFlagDirective } from '../../shared/directives/anomaly-flag.directive';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule, RouterModule, CurrencyInrPipe,
    HighlightDirective, AnomalyFlagDirective
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit, OnDestroy {

  pendingExpenses: IExpense[] = [];
  processedExpenses: IExpense[] = [];
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private http: HttpClient,
    private router: Router,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.loadExpenses();
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
        this.pendingExpenses = expenses.filter((e) => e.status === 'active');
        this.processedExpenses = expenses.filter((e) => e.status !== 'active');
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.stateService.showToast('Failed to load expenses', 'error');
      }
    });
  }

  /**
   * Approves an expense with state update.
   */
  approveExpense(expense: IExpense): void {
    expense.status = 'approved';
    this.moveToProcessed(expense);
    this.stateService.showToast(`Approved: ${expense.title}`, 'success');
  }

  /**
   * Rejects an expense with state update.
   */
  rejectExpense(expense: IExpense): void {
    expense.status = 'rejected';
    this.moveToProcessed(expense);
    this.stateService.showToast(`Rejected: ${expense.title}`, 'warning');
  }

  private moveToProcessed(expense: IExpense): void {
    this.pendingExpenses = this.pendingExpenses.filter((e) => e.id !== expense.id);
    this.processedExpenses = [expense, ...this.processedExpenses];
  }

  /**
   * Programmatic navigation to voting page.
   * ANGULAR: Routing — Router.navigate() programmatically
   */
  navigateToVoting(): void {
    // ANGULAR: Routing — Router.navigate with query parameters
    this.router.navigate(['/voting'], {
      queryParams: { source: 'admin' }
    });
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
