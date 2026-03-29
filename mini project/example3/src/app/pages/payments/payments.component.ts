// SmartSociety — Financial Intelligence Platform
// payments.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components (standalone)
//   - Topic 11: Data Binding (all 4 types)
//   - Topic 12: Directives (*ngFor, *ngIf, [ngClass])
//   - Topic 17: Reactive Forms (40% of interview!)
//     (FormBuilder, FormGroup, FormArray, Validators, custom
//      validators, valueChanges, statusChanges, setValue,
//      patchValue, reset, cross-field validation)
//   - Topic 13: DI (multiple services injected)
// ═══════════════════════════════════════════════════════════════

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule, FormBuilder, FormGroup, FormArray,
  Validators, AbstractControl, ValidationErrors
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PaymentService } from '../../core/services/payment.service';
import { MemberService } from '../../core/services/member.service';
import { StateService } from '../../core/services/state.service';
import {
  IPayment, PaymentStatus, PaymentType, PaymentMode, IMember
} from '../../core/models';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { AnomalyFlagDirective } from '../../shared/directives/anomaly-flag.directive';
import { HighlightDirective } from '../../shared/directives/highlight.directive';
import { ModalComponent } from '../../shared/components/modal/modal.component';

// ═══════════════════════════════════════════════════════════
// REACTIVE FORMS: Custom Validators
// ═══════════════════════════════════════════════════════════

/**
 * Custom validator: Ensures date is not in the future.
 * REACTIVE FORMS: Custom Validator Function
 */
function futureDateValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  const inputDate = new Date(control.value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return inputDate > today ? { futureDate: true } : null;
}

/**
 * Custom validator: Validates late fee is calculated correctly.
 * REACTIVE FORMS: Custom Validator — lateFeeValidator
 */
function lateFeeValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value !== null && value !== undefined && value < 0) {
    return { invalidLateFee: { value } };
  }
  return null;
}

/**
 * Cross-field validator: Ensures total amount matches item sum.
 * REACTIVE FORMS: Cross-field Validation — amountMatchValidator
 */
function amountMatchValidator(group: AbstractControl): ValidationErrors | null {
  const amount = group.get('amount')?.value;
  const lateFee = group.get('lateFee')?.value ?? 0;
  const totalDeclared = group.get('totalAmount')?.value;

  if (totalDeclared && amount + lateFee !== totalDeclared) {
    return { amountMismatch: { expected: amount + lateFee, actual: totalDeclared } };
  }
  return null;
}

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, CurrencyInrPipe,
    AnomalyFlagDirective, HighlightDirective, ModalComponent
  ],
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.css']
})
export class PaymentsComponent implements OnInit, OnDestroy {

  payments: IPayment[] = [];
  members: IMember[] = [];
  isLoading = true;
  showPaymentForm = false;
  isSubmitting = false;

  // REACTIVE FORMS: FormGroup
  paymentForm!: FormGroup;

  // Enum references for template
  paymentTypes = Object.values(PaymentType);
  paymentModes = Object.values(PaymentMode);

  // Form status tracking
  formStatus = '';
  formValueLog = '';

  private destroy$ = new Subject<void>();

  // ANGULAR: Dependency Injection — Multiple services
  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private memberService: MemberService,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
    this.watchFormChanges();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * REACTIVE FORMS: FormBuilder — Build complex form with nested groups and arrays
   */
  private initializeForm(): void {
    this.paymentForm = this.fb.group({
      // REACTIVE FORMS: FormGroup with validators
      flatNo: ['', [Validators.required]],
      memberId: ['', [Validators.required]],

      // REACTIVE FORMS: Nested FormGroup
      paymentDetails: this.fb.group({
        amount: [0, [Validators.required, Validators.min(1), Validators.max(500000)]],
        type: [PaymentType.MAINTENANCE, [Validators.required]],
        date: ['', [Validators.required, futureDateValidator]],  // Custom validator
        mode: [PaymentMode.UPI, [Validators.required]],
        referenceNo: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{6,20}$/)]],
        description: ['']
      }),

      // Fee details with cross-field validation
      feeDetails: this.fb.group({
        lateFee: [0, [lateFeeValidator]],  // Custom validator
        totalAmount: [0]
      }, { validators: amountMatchValidator }),  // Cross-field validator

      // REACTIVE FORMS: FormArray — For multiple line items
      additionalCharges: this.fb.array([])
    });
  }

  /**
   * REACTIVE FORMS: valueChanges + statusChanges observables
   */
  private watchFormChanges(): void {
    // REACTIVE FORMS: valueChanges — Watch form value changes
    this.paymentForm.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((values) => {
      this.formValueLog = JSON.stringify(values, null, 2).substring(0, 200);

      // Auto-calculate total
      const amount = values.paymentDetails?.amount ?? 0;
      const lateFee = values.feeDetails?.lateFee ?? 0;
      const chargesTotal = this.getAdditionalCharges().controls
        .reduce((sum: number, ctrl: AbstractControl) => sum + (ctrl.get('chargeAmount')?.value ?? 0), 0);

      const newTotal = amount + lateFee + chargesTotal;
      if (this.paymentForm.get('feeDetails.totalAmount')?.value !== newTotal) {
        this.paymentForm.get('feeDetails.totalAmount')?.setValue(newTotal, { emitEvent: false });
      }
    });

    // REACTIVE FORMS: statusChanges — Watch form validity changes
    this.paymentForm.statusChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe((status) => {
      this.formStatus = status;
    });
  }

  /**
   * REACTIVE FORMS: FormArray — Get the additional charges array
   */
  getAdditionalCharges(): FormArray {
    return this.paymentForm.get('additionalCharges') as FormArray;
  }

  /**
   * REACTIVE FORMS: FormArray — Add a new charge item
   */
  addCharge(): void {
    const charge = this.fb.group({
      chargeType: ['', Validators.required],
      chargeAmount: [0, [Validators.required, Validators.min(0)]],
      chargeNote: ['']
    });
    this.getAdditionalCharges().push(charge);
    this.stateService.showToast('Charge line added', 'info');
  }

  /**
   * REACTIVE FORMS: FormArray — Remove a charge item
   */
  removeCharge(index: number): void {
    this.getAdditionalCharges().removeAt(index);
  }

  /**
   * REACTIVE FORMS: Form submission with loading state
   */
  onSubmitPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      this.stateService.showToast('Please fix form errors', 'warning');
      return;
    }

    this.isSubmitting = true;
    const formValue = this.paymentForm.value;

    const payment: Partial<IPayment> = {
      flatNo: formValue.flatNo,
      memberId: formValue.memberId,
      amount: formValue.paymentDetails.amount,
      type: formValue.paymentDetails.type,
      date: formValue.paymentDetails.date,
      mode: formValue.paymentDetails.mode,
      referenceNo: formValue.paymentDetails.referenceNo,
      description: formValue.paymentDetails.description,
      lateFee: formValue.feeDetails.lateFee,
      status: PaymentStatus.PAID,
      isLate: formValue.feeDetails.lateFee > 0
    };

    this.paymentService.create(payment).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.stateService.showToast('Payment recorded successfully!', 'success');
        // REACTIVE FORMS: reset() — Reset form to initial state
        this.paymentForm.reset();
        this.getAdditionalCharges().clear();
        this.showPaymentForm = false;
        this.loadData();
      },
      error: () => {
        this.isSubmitting = false;
        this.stateService.showToast('Failed to record payment', 'error');
      }
    });
  }

  /**
   * REACTIVE FORMS: patchValue — Partially update form
   */
  quickFillPayment(member: IMember): void {
    this.paymentForm.patchValue({
      flatNo: member.flatNo,
      memberId: member.id,
      paymentDetails: {
        amount: member.outstandingAmount || 5000,
        date: new Date().toISOString().split('T')[0]
      }
    });
    this.showPaymentForm = true;
    this.stateService.showToast(`Pre-filled for ${member.ownerName}`, 'info');
  }

  /**
   * CSV Export — Downloads payment data as CSV
   */
  onExportCSV(): void {
    this.paymentService.downloadCSV();
    this.stateService.showToast('CSV downloaded', 'success');
  }

  private loadData(): void {
    this.isLoading = true;

    this.paymentService.getAll().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (payments) => {
        this.payments = payments;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.stateService.showToast('Failed to load payments', 'error');
      }
    });

    this.memberService.getAll().pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (members) => this.members = members
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

  trackByPaymentId(index: number, payment: IPayment): string {
    return payment.id;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
