// SmartSociety — Financial Intelligence Platform
// members.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components (standalone, lifecycle)
//   - Topic 11: Data Binding (all 4 types)
//   - Topic 12: Directives (*ngFor, *ngIf, *ngSwitch, [ngClass])
//   - Topic 18: Template-Driven Forms (ngModel, #formRef)
//   - Topic 19: RxJS (debounceTime, distinctUntilChanged)
// ═══════════════════════════════════════════════════════════════

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MemberService } from '../../core/services/member.service';
import { StateService } from '../../core/services/state.service';
import { IMember, PaymentStatus, DEFAULT_MEMBER } from '../../core/models';
import { CreditScoreComponent } from '../../shared/components/credit-score/credit-score.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { RiskLevelPipe } from '../../shared/pipes/risk-level.pipe';
import { HighlightDirective } from '../../shared/directives/highlight.directive';

@Component({
  selector: 'app-members',
  standalone: true,
  imports: [
    CommonModule, FormsModule, CreditScoreComponent, ModalComponent,
    CurrencyInrPipe, RiskLevelPipe, HighlightDirective
  ],
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.css']
})
export class MembersComponent implements OnInit, OnDestroy {

  members: IMember[] = [];
  filteredMembers: IMember[] = [];
  isLoading = true;

  // TEMPLATE FORM: Two-way binding — [(ngModel)]
  searchTerm = '';
  selectedStatus: PaymentStatus | 'ALL' = 'ALL';
  showAddModal = false;

  // Template-driven form model
  newMember: IMember = { ...DEFAULT_MEMBER };

  statusFilters: Array<{ label: string; value: PaymentStatus | 'ALL' }> = [
    { label: 'All', value: 'ALL' },
    { label: 'Paid', value: PaymentStatus.PAID },
    { label: 'Partial', value: PaymentStatus.PARTIAL },
    { label: 'Overdue', value: PaymentStatus.OVERDUE },
    { label: 'Pending', value: PaymentStatus.PENDING }
  ];

  // RXJS: Subject for search stream
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private memberService: MemberService,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.loadMembers();
    this.setupSearch();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadMembers(): void {
    this.isLoading = true;
    this.memberService.getAll().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (members) => {
        this.members = members;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.stateService.showToast('Failed to load members', 'error');
        this.isLoading = false;
      }
    });
  }

  // RXJS: debounceTime + distinctUntilChanged — Search pipeline
  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.searchSubject.next(term);
  }

  onStatusFilter(status: PaymentStatus | 'ALL'): void {
    this.selectedStatus = status;
    this.applyFilters();
    this.stateService.showToast(`Filtered by: ${status}`, 'info');
  }

  private applyFilters(): void {
    let result = [...this.members];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter((m) =>
        m.ownerName.toLowerCase().includes(term) ||
        m.flatNo.toLowerCase().includes(term) ||
        m.phone.includes(term)
      );
    }

    if (this.selectedStatus !== 'ALL') {
      result = result.filter((m) => m.paymentStatus === this.selectedStatus);
    }

    this.filteredMembers = result;
  }

  // TEMPLATE FORM: Submit handler
  onAddMember(form: NgForm): void {
    if (!form.valid) return;

    this.newMember.id = `MEM-${Date.now()}`;
    this.newMember.creditScore = 50;
    this.newMember.joinDate = new Date().toISOString();
    this.newMember.avatarUrl = '';

    this.memberService.create(this.newMember).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.stateService.showToast('Member added successfully', 'success');
        this.showAddModal = false;
        this.newMember = { ...DEFAULT_MEMBER };
        form.resetForm();
        this.loadMembers();
      },
      error: () => this.stateService.showToast('Failed to add member', 'error')
    });
  }

  getStatusClass(status: PaymentStatus): string {
    const map: Record<PaymentStatus, string> = {
      [PaymentStatus.PAID]: 'chip-paid',
      [PaymentStatus.PARTIAL]: 'chip-partial',
      [PaymentStatus.OVERDUE]: 'chip-overdue',
      [PaymentStatus.PENDING]: 'chip-pending'
    };
    return map[status];
  }

  trackByMemberId(index: number, member: IMember): string {
    return member.id;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
