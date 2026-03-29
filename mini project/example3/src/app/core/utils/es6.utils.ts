// SmartSociety — Financial Intelligence Platform
// es6.utils.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 2: ES6+ Features
//     (Arrow functions, Destructuring, Spread, Template literals,
//      Default parameters, Optional chaining, Nullish coalescing)
// ═══════════════════════════════════════════════════════════════

import { IPayment, PaymentStatus } from '../models';
import { IMember, FlatNumber } from '../models';

// ES6 FEATURE: Arrow Function — Concise function expressions
/**
 * Formats a currency amount to INR format.
 */
export const formatCurrencyINR = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN')}`;

// ES6 FEATURE: Arrow Function — Filter overdue payments
export const getOverduePayments = (payments: IPayment[]): IPayment[] =>
  payments.filter((p) => p.status === PaymentStatus.OVERDUE);

// ES6 FEATURE: Destructuring — Object destructuring in function
/**
 * Generates a payment receipt summary using destructuring.
 */
export const generateReceiptSummary = (payment: IPayment): string => {
  // ES6 FEATURE: Destructuring — Extract specific properties
  const { flatNo, amount, mode, referenceNo, date } = payment;

  // ES6 FEATURE: Template Literal — String interpolation
  return `Receipt: Flat ${flatNo} | ₹${amount.toLocaleString('en-IN')} via ${mode} | Ref: ${referenceNo} | Date: ${date}`;
};

// ES6 FEATURE: Spread Operator — Adding items to arrays immutably
/**
 * Adds a new payment to an existing array without mutation.
 */
export const addPayment = (
  payments: IPayment[],
  newPayment: IPayment
): IPayment[] => {
  // ES6 FEATURE: Spread Operator — Array spread
  return [...payments, newPayment];
};

// ES6 FEATURE: Spread Operator — Merging objects immutably
/**
 * Updates a member's properties without mutation.
 */
export const updateMember = (
  member: IMember,
  updates: Partial<IMember>
): IMember => {
  // ES6 FEATURE: Spread Operator — Object spread
  return { ...member, ...updates };
};

// ES6 FEATURE: Default Parameters — Provide fallback values
/**
 * Fetches a limited set of members with default page size.
 */
export const getMembers = (
  allMembers: IMember[],
  limit: number = 10,
  offset: number = 0
): IMember[] => {
  return allMembers.slice(offset, offset + limit);
};

// ES6 FEATURE: Template Literal — Dynamic string generation
/**
 * Generates a due payment reminder message.
 */
export const generateReminder = (
  flatNo: FlatNumber,
  amount: number,
  dueDate: string
): string => {
  // ES6 FEATURE: Template Literal — Multi-line with expressions
  return `Dear Resident of Flat ${flatNo},

Your maintenance payment of ₹${amount.toLocaleString('en-IN')} is due on ${dueDate}.
Please ensure timely payment to avoid late fees.

— SmartSociety Management`;
};

// ES6 FEATURE: Optional Chaining — Safe property access
/**
 * Retrieves the last payment date for a member, safely.
 */
export const getLastPaymentDate = (
  member: IMember | null | undefined,
  payments: IPayment[]
): string => {
  // ES6 FEATURE: Optional Chaining — member?.paymentStatus
  const status = member?.paymentStatus;
  if (!status) return 'No data';

  const memberPayments = payments
    .filter((p) => p.memberId === member?.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // ES6 FEATURE: Optional Chaining — access first element safely
  return memberPayments[0]?.date ?? 'No payments found';
};

// ES6 FEATURE: Nullish Coalescing — Provide defaults for null/undefined
/**
 * Calculates total outstanding with safe defaults.
 */
export const calculateOutstanding = (
  amount: number | null | undefined,
  lateFee: number | null | undefined,
  discount: number | null | undefined
): number => {
  // ES6 FEATURE: Nullish Coalescing — ?? operator
  const safeAmount = amount ?? 0;
  const safeLateFee = lateFee ?? 0;
  const safeDiscount = discount ?? 0;

  return safeAmount + safeLateFee - safeDiscount;
};

// ES6 FEATURE: Destructuring — Array destructuring
/**
 * Splits members into paid and unpaid groups.
 */
export const partitionMembers = (
  members: IMember[]
): [IMember[], IMember[]] => {
  const paid = members.filter((m) => m.paymentStatus === PaymentStatus.PAID);
  const unpaid = members.filter((m) => m.paymentStatus !== PaymentStatus.PAID);

  // ES6 FEATURE: Destructuring — Return as tuple for array destructuring
  return [paid, unpaid];
};

// ES6 FEATURE: Map and Set — Modern collections
/**
 * Creates a unique set of flat numbers from payments.
 */
export const getUniqueFlatNumbers = (payments: IPayment[]): FlatNumber[] => {
  // ES6 FEATURE: Set — Remove duplicates
  const flatSet = new Set(payments.map((p) => p.flatNo));
  // ES6 FEATURE: Spread Operator — Convert Set to Array
  return [...flatSet];
};

// ES6 FEATURE: Arrow Function + Array methods — Chained operations
/**
 * Calculates summary statistics for a payment collection.
 */
export const calculatePaymentStats = (payments: IPayment[]): {
  total: number;
  average: number;
  max: number;
  min: number;
} => {
  if (payments.length === 0) {
    return { total: 0, average: 0, max: 0, min: 0 };
  }

  const amounts = payments.map((p) => p.amount);

  return {
    total: amounts.reduce((sum, a) => sum + a, 0),
    average: amounts.reduce((sum, a) => sum + a, 0) / amounts.length,
    max: Math.max(...amounts),             // ES6 FEATURE: Spread in function call
    min: Math.min(...amounts)
  };
};
