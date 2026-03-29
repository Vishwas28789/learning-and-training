// SmartSociety — Financial Intelligence Platform
// dashboard.component.spec.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 22: Component Testing
//     (TestBed, ComponentFixture, DebugElement, fixture.detectChanges,
//      DOM queries, @Input/@Output testing, mock child components)
// ═══════════════════════════════════════════════════════════════

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Component, Input } from '@angular/core';
import { DashboardComponent } from './dashboard.component';
import { PaymentStatus } from '../../core/models';

// Topic 22: Mock child components — HealthRingComponent stub
@Component({
  selector: 'app-health-ring',
  standalone: true,
  template: '<div class="mock-health-ring">{{ score }}</div>'
})
class MockHealthRingComponent {
  @Input() score = 0;
  @Input() label = '';
}

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    // Topic 22: TestBed.configureTestingModule
    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent,
        HttpClientTestingModule,
        RouterTestingModule
      ]
    })
    // Topic 22: Override child component with mock
    .overrideComponent(DashboardComponent, {
      remove: { imports: [] },
      add: { imports: [MockHealthRingComponent] }
    })
    .compileComponents();

    // Topic 22: ComponentFixture
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;

    // Topic 22: DebugElement — Access the compiled DOM
    compiled = fixture.nativeElement;
  });

  it('should create', () => {
    // Arrange — already done in beforeEach
    // Act
    fixture.detectChanges();
    // Assert
    expect(component).toBeTruthy();
  });

  it('should have a page title', () => {
    // Arrange & Act
    fixture.detectChanges();

    // Assert — Topic 22: Test DOM output with querySelector
    const title = compiled.querySelector('.page-title');
    expect(title?.textContent).toContain('Dashboard');
  });

  it('should show loading skeleton initially', () => {
    // Arrange
    component.isLoading = true;

    // Act
    fixture.detectChanges();

    // Assert
    const skeletons = compiled.querySelectorAll('.skeleton');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('should display stat cards when data is loaded', () => {
    // Arrange
    component.isLoading = false;
    component.paymentSummary = {
      totalCollected: 245000,
      totalPending: 45000,
      totalOverdue: 12000,
      collectionRate: 87,
      averagePayment: 5000,
      latePaymentCount: 3
    };

    // Act
    fixture.detectChanges();

    // Assert
    const statCards = compiled.querySelectorAll('.stat-card');
    expect(statCards.length).toBe(4);
  });

  it('should return overdue members correctly', () => {
    // Arrange
    component.members = [
      { id: '1', flatNo: 'A-101', ownerName: 'Rajesh', phone: '9876543210', email: null, paymentStatus: PaymentStatus.PAID, creditScore: 80, paymentStreak: 5, outstandingAmount: 0, isActive: true, joinDate: '2024-01-01', avatarUrl: '' },
      { id: '2', flatNo: 'A-102', ownerName: 'Priya', phone: '9876543211', email: null, paymentStatus: PaymentStatus.OVERDUE, creditScore: 25, paymentStreak: 0, outstandingAmount: 15000, isActive: true, joinDate: '2024-01-01', avatarUrl: '' }
    ];

    // Act
    const overdueMembers = component.getOverdueMembers();

    // Assert
    expect(overdueMembers.length).toBe(1);
    expect(overdueMembers[0].ownerName).toBe('Priya');
  });

  it('should return recent payments sorted by date', () => {
    // Arrange
    component.payments = [
      { id: 'P1', flatNo: 'A-101', memberId: '1', amount: 5000, type: 'MAINTENANCE' as any, date: '2024-01-15', mode: 'UPI' as any, referenceNo: 'REF1', isLate: false, lateFee: 0, status: PaymentStatus.PAID, description: '' },
      { id: 'P2', flatNo: 'A-102', memberId: '2', amount: 5000, type: 'MAINTENANCE' as any, date: '2024-03-15', mode: 'UPI' as any, referenceNo: 'REF2', isLate: false, lateFee: 0, status: PaymentStatus.PAID, description: '' }
    ];

    // Act
    const recent = component.getRecentPayments();

    // Assert — Most recent first
    expect(recent[0].id).toBe('P2');
  });

  it('should map payment status to correct CSS class', () => {
    // Arrange & Act & Assert
    expect(component.getStatusClass(PaymentStatus.PAID)).toBe('chip-paid');
    expect(component.getStatusClass(PaymentStatus.OVERDUE)).toBe('chip-overdue');
    expect(component.getStatusClass(PaymentStatus.PARTIAL)).toBe('chip-partial');
    expect(component.getStatusClass(PaymentStatus.PENDING)).toBe('chip-pending');
  });

  // Topic 24: Negative Test — Verify correct behavior with empty data
  it('NEGATIVE: should handle empty members array', () => {
    // Arrange
    component.members = [];

    // Act
    const overdueMembers = component.getOverdueMembers();

    // Assert
    expect(overdueMembers.length).toBe(0);
  });

  it('NEGATIVE: should handle empty payments array', () => {
    // Arrange
    component.payments = [];

    // Act
    const recentPayments = component.getRecentPayments();

    // Assert
    expect(recentPayments.length).toBe(0);
  });
});
