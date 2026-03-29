// SmartSociety — Financial Intelligence Platform
// state.service.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 19: RxJS + State Management
//     (Observable, Subject, BehaviorSubject, ReplaySubject,
//      map, filter, switchMap, mergeMap, debounceTime,
//      distinctUntilChanged, catchError, takeUntil,
//      combineLatest, forkJoin)
// ═══════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import {
  Observable, Subject, BehaviorSubject, ReplaySubject,
  combineLatest, forkJoin, of, throwError, merge
} from 'rxjs';
import {
  map, filter, switchMap, mergeMap, debounceTime,
  distinctUntilChanged, catchError, takeUntil, tap,
  scan, shareReplay, startWith
} from 'rxjs/operators';
import { IMember, IPayment, IExpense, PaymentStatus } from '../models';

// TS: Interface — Application state shape
export interface AppState {
  members: IMember[];
  payments: IPayment[];
  expenses: IExpense[];
  searchTerm: string;
  selectedStatus: PaymentStatus | 'ALL';
  isLoading: boolean;
  error: string | null;
}

// TS: Interface — Toast notification
export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration: number;
}

// Default state
const INITIAL_STATE: AppState = {
  members: [],
  payments: [],
  expenses: [],
  searchTerm: '',
  selectedStatus: 'ALL',
  isLoading: false,
  error: null
};

@Injectable({ providedIn: 'root' })
export class StateService {

  // ═══════════════════════════════════════════════════════════
  // RXJS: Subject — A multicasting observable. It can emit
  // values to multiple subscribers. No initial value.
  // ═══════════════════════════════════════════════════════════
  private destroy$ = new Subject<void>();

  // RXJS: BehaviorSubject — Stores the latest value and emits
  // it immediately to new subscribers. Requires initial value.
  private stateSubject = new BehaviorSubject<AppState>(INITIAL_STATE);
  public state$: Observable<AppState> = this.stateSubject.asObservable();

  // RXJS: ReplaySubject — Replays the last N values to new subscribers.
  // Useful for caching values for late subscribers.
  private actionsLog = new ReplaySubject<string>(10);
  public actionsLog$: Observable<string> = this.actionsLog.asObservable();

  // RXJS: Subject — For search input stream
  private searchSubject = new Subject<string>();

  // RXJS: BehaviorSubject — Toast notifications
  private toastSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$: Observable<ToastMessage[]> = this.toastSubject.asObservable();

  constructor() {
    this.setupSearchPipeline();
  }

  // ═══════════════════════════════════════════════════════════
  // RXJS: debounceTime + distinctUntilChanged — Search pipeline
  // ═══════════════════════════════════════════════════════════
  /**
   * Sets up the reactive search pipeline with debounce.
   * This waits 300ms after the user stops typing, then only
   * emits if the value actually changed.
   */
  private setupSearchPipeline(): void {
    this.searchSubject.pipe(
      // RXJS: debounceTime — Wait 300ms after last emission
      debounceTime(300),
      // RXJS: distinctUntilChanged — Only emit if value changed
      distinctUntilChanged(),
      // RXJS: takeUntil — Unsubscribe when destroy$ emits
      takeUntil(this.destroy$),
      // RXJS: tap — Side effect for logging
      tap((term) => this.logAction(`Search: "${term}"`))
    ).subscribe((searchTerm) => {
      this.updateState({ searchTerm });
    });
  }

  /**
   * Emits a search term into the search pipeline.
   * @param term - The search string from the input
   */
  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  // ═══════════════════════════════════════════════════════════
  // State Update Methods
  // ═══════════════════════════════════════════════════════════

  /**
   * Updates the application state immutably.
   * @param partial - Partial state to merge
   */
  updateState(partial: Partial<AppState>): void {
    const current = this.stateSubject.getValue();
    this.stateSubject.next({ ...current, ...partial });
  }

  /**
   * Sets members in state.
   */
  setMembers(members: IMember[]): void {
    this.updateState({ members });
    this.logAction(`Loaded ${members.length} members`);
  }

  /**
   * Sets payments in state.
   */
  setPayments(payments: IPayment[]): void {
    this.updateState({ payments });
    this.logAction(`Loaded ${payments.length} payments`);
  }

  /**
   * Sets expenses in state.
   */
  setExpenses(expenses: IExpense[]): void {
    this.updateState({ expenses });
    this.logAction(`Loaded ${expenses.length} expenses`);
  }

  /**
   * Sets the status filter.
   */
  setStatusFilter(status: PaymentStatus | 'ALL'): void {
    this.updateState({ selectedStatus: status });
    this.logAction(`Filter: ${status}`);
  }

  // ═══════════════════════════════════════════════════════════
  // RXJS: Derived Observables — Using operators
  // ═══════════════════════════════════════════════════════════

  /**
   * RXJS: map — Derives filtered members from state using
   * the search term and status filter.
   */
  getFilteredMembers(): Observable<IMember[]> {
    return this.state$.pipe(
      // RXJS: map — Transform the state into filtered members
      map((state) => {
        let members = [...state.members];

        // Filter by search term
        if (state.searchTerm) {
          const term = state.searchTerm.toLowerCase();
          members = members.filter((m) =>
            m.ownerName.toLowerCase().includes(term) ||
            m.flatNo.toLowerCase().includes(term)
          );
        }

        // RXJS: filter usage — Filter by payment status
        if (state.selectedStatus !== 'ALL') {
          members = members.filter((m) => m.paymentStatus === state.selectedStatus);
        }

        return members;
      })
    );
  }

  /**
   * RXJS: combineLatest — Combine multiple derived streams.
   * Returns dashboard statistics computed from state.
   */
  getDashboardStats(): Observable<{
    totalMembers: number;
    totalCollected: number;
    overdueCount: number;
    healthScore: number;
  }> {
    // RXJS: combineLatest — Combines latest from multiple observables
    return combineLatest([
      this.state$.pipe(map((s) => s.members)),
      this.state$.pipe(map((s) => s.payments))
    ]).pipe(
      map(([members, payments]) => ({
        totalMembers: members.length,
        totalCollected: payments
          .filter((p) => p.status === PaymentStatus.PAID)
          .reduce((sum, p) => sum + p.amount, 0),
        overdueCount: members.filter((m) => m.paymentStatus === PaymentStatus.OVERDUE).length,
        healthScore: this.computeQuickHealth(members, payments)
      }))
    );
  }

  // ═══════════════════════════════════════════════════════════
  // Toast Notification Management
  // ═══════════════════════════════════════════════════════════

  /**
   * Shows a toast notification.
   */
  showToast(message: string, type: ToastMessage['type'] = 'info', duration: number = 3000): void {
    const toast: ToastMessage = {
      id: `toast-${Date.now()}`,
      message,
      type,
      duration
    };

    const current = this.toastSubject.getValue();
    this.toastSubject.next([...current, toast]);

    // Auto-remove after duration
    setTimeout(() => {
      this.removeToast(toast.id);
    }, duration);
  }

  /**
   * Removes a toast by ID.
   */
  removeToast(id: string): void {
    const current = this.toastSubject.getValue();
    this.toastSubject.next(current.filter((t) => t.id !== id));
  }

  // ═══════════════════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════════════════

  /**
   * Logs an action to the ReplaySubject.
   */
  private logAction(action: string): void {
    this.actionsLog.next(`[${new Date().toLocaleTimeString()}] ${action}`);
  }

  /**
   * Quick health score computation.
   */
  private computeQuickHealth(members: IMember[], payments: IPayment[]): number {
    if (members.length === 0) return 0;
    const paidCount = members.filter((m) => m.paymentStatus === PaymentStatus.PAID).length;
    return Math.round((paidCount / members.length) * 100);
  }

  /**
   * Cleanup — Emit to destroy$ to unsubscribe all takeUntil streams.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
