// SmartSociety — Financial Intelligence Platform
// payment.component.spec.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 20: Why Testing + AAA Pattern
//   - Topic 21: Jasmine + Karma Setup (matchers, describe, beforeEach)
//   - Topic 22: Component Testing (TestBed, fixture, DOM queries)
//   - Topic 24: Negative Test Cases
// ═══════════════════════════════════════════════════════════════
//
// WHY TESTING MATTERS:
// --------------------
// 1. Prevents regressions — Changes don't break existing features.
// 2. Documents behavior — Tests serve as living documentation.
// 3. Enables refactoring — Safely restructure code with confidence.
// 4. Catches edge cases — Negative tests prevent silent failures.
// 5. Speeds up development — Fast feedback loop vs manual testing.
// ═══════════════════════════════════════════════════════════════

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { PaymentsComponent } from './payments.component';
import { PaymentStatus, PaymentType, PaymentMode } from '../../core/models';

// Topic 21: describe() blocks grouped by feature
describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;

  // Topic 21: beforeEach() for TestBed setup
  beforeEach(async () => {
    // Topic 22: TestBed.configureTestingModule
    await TestBed.configureTestingModule({
      imports: [
        PaymentsComponent,
        HttpClientTestingModule,
        ReactiveFormsModule
      ]
    }).compileComponents();

    // Topic 22: ComponentFixture
    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ═══════════════════════════════════════════════════════════
  // BASIC COMPONENT TESTS
  // ═══════════════════════════════════════════════════════════

  it('should create the component', () => {
    // Arrange — Component already created in beforeEach
    // Act — No action needed
    // Assert — Topic 21: toBeTruthy matcher
    expect(component).toBeTruthy();
  });

  it('should initialize the payment form', () => {
    // Arrange
    const form = component.paymentForm;

    // Act — Form was initialized in ngOnInit

    // Assert — Topic 21: toBe, toEqual matchers
    expect(form).toBeTruthy();
    expect(form.get('flatNo')).toBeTruthy();
    expect(form.get('paymentDetails')).toBeTruthy();
    expect(form.get('feeDetails')).toBeTruthy();
    expect(form.get('additionalCharges')).toBeTruthy();
  });

  // ═══════════════════════════════════════════════════════════
  // FORM VALIDATION TESTS — AAA Pattern
  // ═══════════════════════════════════════════════════════════

  it('should require flatNo', () => {
    // Arrange
    const flatNoControl = component.paymentForm.get('flatNo');

    // Act
    flatNoControl?.setValue('');
    flatNoControl?.markAsTouched();

    // Assert
    expect(flatNoControl?.valid).toBeFalse();
    expect(flatNoControl?.errors?.['required']).toBeTruthy();
  });

  it('should validate minimum amount', () => {
    // Arrange
    const amountControl = component.paymentForm.get('paymentDetails.amount');

    // Act
    amountControl?.setValue(0);
    amountControl?.markAsTouched();

    // Assert — Amount must be at least 1
    expect(amountControl?.valid).toBeFalse();
    expect(amountControl?.errors?.['min']).toBeTruthy();
  });

  it('should validate maximum amount', () => {
    // Arrange
    const amountControl = component.paymentForm.get('paymentDetails.amount');

    // Act
    amountControl?.setValue(999999);

    // Assert — Amount must be <= 500000
    expect(amountControl?.valid).toBeFalse();
    expect(amountControl?.errors?.['max']).toBeTruthy();
  });

  it('should validate reference number pattern', () => {
    // Arrange
    const refControl = component.paymentForm.get('paymentDetails.referenceNo');

    // Act — Invalid: contains special chars
    refControl?.setValue('$$$');

    // Assert
    expect(refControl?.valid).toBeFalse();
    expect(refControl?.errors?.['pattern']).toBeTruthy();
  });

  it('should accept valid reference number', () => {
    // Arrange
    const refControl = component.paymentForm.get('paymentDetails.referenceNo');

    // Act — Valid alphanumeric
    refControl?.setValue('UPI123456');

    // Assert
    expect(refControl?.valid).toBeTrue();
  });

  // ═══════════════════════════════════════════════════════════
  // FORM ARRAY TESTS
  // ═══════════════════════════════════════════════════════════

  it('should add additional charge to FormArray', () => {
    // Arrange
    const initialLength = component.getAdditionalCharges().length;

    // Act
    component.addCharge();

    // Assert
    expect(component.getAdditionalCharges().length).toBe(initialLength + 1);
  });

  it('should remove charge from FormArray', () => {
    // Arrange
    component.addCharge();
    component.addCharge();
    const lengthAfterAdd = component.getAdditionalCharges().length;

    // Act
    component.removeCharge(0);

    // Assert
    expect(component.getAdditionalCharges().length).toBe(lengthAfterAdd - 1);
  });

  // ═══════════════════════════════════════════════════════════
  // NEGATIVE TEST CASES — Topic 24
  // ═══════════════════════════════════════════════════════════

  it('NEGATIVE: should NOT submit form with empty fields', () => {
    // Arrange — Form is in initial (empty) state

    // Act
    component.onSubmitPayment();

    // Assert — Form should be marked as touched, not submitted
    expect(component.paymentForm.invalid).toBeTrue();
    expect(component.isSubmitting).toBeFalse();
  });

  it('NEGATIVE: should NOT accept payment amount of 0', () => {
    // Arrange
    const amountControl = component.paymentForm.get('paymentDetails.amount');

    // Act
    amountControl?.setValue(0);

    // Assert — 0 amount should fail min(1) validation
    expect(amountControl?.valid).toBeFalse();
  });

  it('NEGATIVE: should NOT accept negative late fee', () => {
    // Arrange
    const lateFeeControl = component.paymentForm.get('feeDetails.lateFee');

    // Act
    lateFeeControl?.setValue(-100);

    // Assert — Custom lateFeeValidator should reject negative
    expect(lateFeeControl?.valid).toBeFalse();
  });

  // ═══════════════════════════════════════════════════════════
  // DOM TESTING — Topic 22
  // ═══════════════════════════════════════════════════════════

  it('should render the page title', () => {
    // Arrange
    // Topic 22: DebugElement — Access compiled DOM
    const compiled = fixture.nativeElement as HTMLElement;

    // Act
    fixture.detectChanges();

    // Assert — Topic 21: toContain matcher
    const title = compiled.querySelector('.page-title');
    expect(title?.textContent).toContain('Payments');
  });

  it('should show payment form when button clicked', () => {
    // Arrange
    component.showPaymentForm = false;
    fixture.detectChanges();

    // Act
    component.showPaymentForm = true;
    fixture.detectChanges();

    // Assert
    const formCard = fixture.nativeElement.querySelector('.payment-form-card');
    expect(formCard).toBeTruthy();
  });

  it('should display correct number of status classes', () => {
    // Arrange & Act
    const paidClass = component.getStatusClass(PaymentStatus.PAID);
    const overdueClass = component.getStatusClass(PaymentStatus.OVERDUE);

    // Assert
    expect(paidClass).toBe('chip-paid');
    expect(overdueClass).toBe('chip-overdue');
  });
});
