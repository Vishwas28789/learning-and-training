// SmartSociety — Financial Intelligence Platform
// payment.model.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 6: TypeScript Classes + Interfaces
//     (Interface, Class, Constructor, Access Modifiers,
//      Getters/Setters, Static Methods)
//   - Topic 5: TypeScript Data Types (Enum reuse)
// ═══════════════════════════════════════════════════════════════

import { PaymentStatus, FlatNumber } from './member.model';

// TS: Enum — Payment modes available
export enum PaymentMode {
  UPI = 'UPI',
  CASH = 'CASH',
  CHEQUE = 'CHEQUE',
  BANK_TRANSFER = 'BANK_TRANSFER',
  ONLINE = 'ONLINE'
}

// TS: Enum — Expense/payment types
export enum PaymentType {
  MAINTENANCE = 'MAINTENANCE',
  WATER = 'WATER',
  ELECTRICITY = 'ELECTRICITY',
  PARKING = 'PARKING',
  SINKING_FUND = 'SINKING_FUND',
  PENALTY = 'PENALTY',
  OTHER = 'OTHER'
}

// TS: Interface — Contract for payments
export interface IPayment {
  id: string;
  flatNo: FlatNumber;
  memberId: string;
  amount: number;
  type: PaymentType;
  date: string;
  mode: PaymentMode;
  referenceNo: string;
  isLate: boolean;
  lateFee: number;
  status: PaymentStatus;
  description: string;
}

// TS: Class — Payment implements IPayment interface
// TS: Access Modifiers — public, private, readonly demonstrated
export class Payment implements IPayment {
  // TS: Access Modifiers — readonly for immutable identifier
  public readonly id: string;
  public flatNo: FlatNumber;
  public memberId: string;
  public amount: number;
  public type: PaymentType;
  public date: string;
  public mode: PaymentMode;
  public referenceNo: string;
  public isLate: boolean;
  public lateFee: number;
  public status: PaymentStatus;
  public description: string;

  // TS: Access Modifiers — private field for internal state
  private _processedAt: Date | null = null;

  // TS: Constructor with typed parameters
  constructor(data: IPayment) {
    this.id = data.id;
    this.flatNo = data.flatNo;
    this.memberId = data.memberId;
    this.amount = data.amount;
    this.type = data.type;
    this.date = data.date;
    this.mode = data.mode;
    this.referenceNo = data.referenceNo;
    this.isLate = data.isLate;
    this.lateFee = data.lateFee;
    this.status = data.status;
    this.description = data.description;
  }

  // TS: Getter — Computed property to check if payment is overdue
  get isOverdue(): boolean {
    if (this.status === PaymentStatus.PAID) return false;
    const dueDate = new Date(this.date);
    const today = new Date();
    return dueDate < today;
  }

  // TS: Getter — Total amount including late fee
  get totalAmount(): number {
    return this.amount + this.lateFee;
  }

  // TS: Getter — Processed timestamp
  get processedAt(): Date | null {
    return this._processedAt;
  }

  // TS: Setter — Mark payment as processed
  set processedAt(date: Date | null) {
    this._processedAt = date;
  }

  // TS: Static Method — Calculate late fee based on days past due
  static calculateLateFee(paymentDate: string, dailyRate: number = 50): number {
    const due = new Date(paymentDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays * dailyRate : 0;
  }

  // TS: Static Method — Create a default payment instance
  static createDefault(flatNo: string, memberId: string): Payment {
    return new Payment({
      id: `PAY-${Date.now()}`,
      flatNo,
      memberId,
      amount: 0,
      type: PaymentType.MAINTENANCE,
      date: new Date().toISOString().split('T')[0],
      mode: PaymentMode.UPI,
      referenceNo: '',
      isLate: false,
      lateFee: 0,
      status: PaymentStatus.PENDING,
      description: ''
    });
  }

  // TS: Method — Convert to plain object for API submission
  toJSON(): IPayment {
    return {
      id: this.id,
      flatNo: this.flatNo,
      memberId: this.memberId,
      amount: this.amount,
      type: this.type,
      date: this.date,
      mode: this.mode,
      referenceNo: this.referenceNo,
      isLate: this.isLate,
      lateFee: this.lateFee,
      status: this.status,
      description: this.description
    };
  }
}

// TS: Interface — Payment summary for reports
export interface PaymentSummary {
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectionRate: number;
  averagePayment: number;
  latePaymentCount: number;
}

// TS: Interface — Monthly payment record
export interface MonthlyPayment {
  month: string;
  year: number;
  totalAmount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}
