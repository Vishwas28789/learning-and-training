// SmartSociety — Financial Intelligence Platform
// expense.model.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 5: TypeScript Data Types (Union types, type aliases)
//   - Topic 6: TypeScript Interfaces
// ═══════════════════════════════════════════════════════════════

// TS: Type Alias — Expense status as union of literal strings
export type ExpenseStatus = 'active' | 'approved' | 'rejected';

// TS: Interface — Expense proposal with voting
export interface IExpense {
  id: string;
  title: string;
  amount: number;
  description: string;
  vendor: string;
  proposedBy: string;               // memberId
  date: string;                     // ISO date
  votesFor: number;
  votesAgainst: number;
  totalMembers: number;
  deadline: string;                 // ISO date for voting deadline
  isAnomaly: boolean;               // Flagged by anomaly detection
  status: ExpenseStatus;            // TS: Union type literal
  category: ExpenseCategory;
}

// TS: Enum — Expense categories
export enum ExpenseCategory {
  MAINTENANCE = 'MAINTENANCE',
  RENOVATION = 'RENOVATION',
  SECURITY = 'SECURITY',
  UTILITIES = 'UTILITIES',
  LANDSCAPING = 'LANDSCAPING',
  SOCIAL_EVENT = 'SOCIAL_EVENT',
  EMERGENCY = 'EMERGENCY',
  OTHER = 'OTHER'
}

// TS: Interface — Vote record for tracking
export interface IVoteRecord {
  expenseId: string;
  memberId: string;
  vote: 'for' | 'against';         // TS: Union type literal
  timestamp: string;
}

// TS: Interface — Expense analytics
export interface ExpenseAnalytics {
  totalExpenses: number;
  averageAmount: number;
  anomalyCount: number;
  approvalRate: number;
  categoryBreakdown: Record<ExpenseCategory, number>;
}

// TS: Constant — Anomaly threshold for expense detection
export const ANOMALY_THRESHOLD = 50000;

// TS: Type Alias — Function type for anomaly checks
export type AnomalyChecker = (amount: number, category: ExpenseCategory) => boolean;
