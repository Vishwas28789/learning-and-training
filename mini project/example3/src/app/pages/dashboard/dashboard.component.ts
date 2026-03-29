// SmartSociety — Financial Intelligence Platform
// dashboard.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 1: JS Basics (DOM counter animation)
//   - Topic 9: Angular Components (lifecycle: OnInit, AfterViewInit, OnDestroy)
//   - Topic 11: Data Binding (all 4 types)
//   - Topic 12: Directives (*ngFor, *ngIf, [ngClass])
//   - Topic 13: DI (multiple services)
//   - Topic 19: RxJS (async pipe, takeUntil, combineLatest)
// ═══════════════════════════════════════════════════════════════

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MemberService } from '../../core/services/member.service';
import { PaymentService } from '../../core/services/payment.service';
import { ReportService } from '../../core/services/report.service';
import { StateService } from '../../core/services/state.service';
import { AuthService } from '../../core/services/auth.service';
import { IMember, IPayment, PaymentStatus, PaymentSummary, ReportSummary } from '../../core/models';
import { HealthRingComponent } from '../../shared/components/health-ring/health-ring.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { animateCounter } from '../../shared/utils/dom.utils';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, HealthRingComponent,
    CurrencyInrPipe, HighlightDirective
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  // ANGULAR: Component Lifecycle — ngOnInit, ngAfterViewInit, ngOnDestroy

  members: IMember[] = [];
  payments: IPayment[] = [];
  paymentSummary: PaymentSummary | null = null;
  financialSummary: ReportSummary | null = null;
  healthScore = 0;
  isLoading = true;
  recentAlerts: string[] = [];
  currentUserRole: string = 'member';

  // Chart data for interactive bar chart
  monthlyData = [
    { month: 'Jan', collected: 85, pending: 15 },
    { month: 'Feb', collected: 72, pending: 28 },
    { month: 'Mar', collected: 91, pending: 9 },
    { month: 'Apr', collected: 68, pending: 32 },
    { month: 'May', collected: 78, pending: 22 },
    { month: 'Jun', collected: 95, pending: 5 }
  ];
  activeBarIndex: number = -1;

  // RXJS: takeUntil — Cleanup pattern
  private destroy$ = new Subject<void>();

  // ANGULAR: Dependency Injection — Multiple services
  constructor(
    private memberService: MemberService,
    private paymentService: PaymentService,
    private reportService: ReportService,
    private stateService: StateService,
    private authService: AuthService
  ) {}

  // ANGULAR: Component Lifecycle — ngOnInit
  ngOnInit(): void {
    this.loadData();
    this.currentUserRole = this.authService.getUserRole() || 'member';
  }

  get isAdmin(): boolean {
    return this.currentUserRole === 'admin';
  }

  onBarHover(index: number): void {
    this.activeBarIndex = index;
  }

  onBarLeave(): void {
    this.activeBarIndex = -1;
  }

  // ANGULAR: Component Lifecycle — ngAfterViewInit (DOM is ready)
  ngAfterViewInit(): void {
    // JS BASICS DEMO: DOM counter animation (after view renders)
    setTimeout(() => {
      if (this.paymentSummary) {
        animateCounter('stat-collected', this.paymentSummary.totalCollected, 1500);
        animateCounter('stat-pending', this.paymentSummary.totalPending, 1500);
        animateCounter('stat-overdue', this.paymentSummary.totalOverdue, 1500);
      }
    }, 500);
  }

  // ANGULAR: Component Lifecycle — ngOnDestroy
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;

    this.memberService.getAll().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (members) => {
        this.members = members;
        this.stateService.setMembers(members);
      },
      error: () => this.stateService.showToast('Failed to load members', 'error')
    });

    this.paymentService.getAll().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (payments) => {
        this.payments = payments;
        this.stateService.setPayments(payments);
      },
      error: () => this.stateService.showToast('Failed to load payments', 'error')
    });

    this.paymentService.getPaymentSummary().pipe(
      takeUntil(this.destroy$)
    ).subscribe((summary) => {
      this.paymentSummary = summary;
      this.isLoading = false;
    });

    this.reportService.getFinancialSummary().pipe(
      takeUntil(this.destroy$)
    ).subscribe((summary) => {
      this.financialSummary = summary;
    });

    this.reportService.healthScore$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((score) => {
      this.healthScore = score;
    });

    this.generateAlerts();
  }

  private generateAlerts(): void {
    this.recentAlerts = [
      'Flat A-102: Payment overdue by 45 days',
      'Flat B-301: Maintenance payment received via UPI',
      'New expense proposal: Garden renovation (₹82,000)',
      'AI: 3 members at high default risk this month',
      'Collection rate improved to 87% (+8%)'
    ];
  }

  getOverdueMembers(): IMember[] {
    return this.members.filter((m) => m.paymentStatus === PaymentStatus.OVERDUE);
  }

  getRecentPayments(): IPayment[] {
    return [...this.payments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  getStatusClass(status: PaymentStatus): string {
    const classMap: Record<PaymentStatus, string> = {
      [PaymentStatus.PAID]: 'chip-paid',
      [PaymentStatus.PARTIAL]: 'chip-partial',
      [PaymentStatus.OVERDUE]: 'chip-overdue',
      [PaymentStatus.PENDING]: 'chip-pending'
    };
    return classMap[status] || 'chip-pending';
  }

  trackByMemberId(index: number, member: IMember): string {
    return member.id;
  }

  trackByPaymentId(index: number, payment: IPayment): string {
    return payment.id;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
