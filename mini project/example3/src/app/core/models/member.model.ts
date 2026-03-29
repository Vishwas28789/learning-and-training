// SmartSociety — Financial Intelligence Platform
// member.model.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 5: TypeScript Syntax + Data Types
//     (Primitive types, Enum, Tuple, Union, Type Alias, Arrays)
//   - Topic 7: TypeScript Modules + Imports (Named exports)
// ═══════════════════════════════════════════════════════════════

// TS: Enum — Strongly typed payment status categories
export enum PaymentStatus {
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  PENDING = 'PENDING'
}

// TS: Enum — Risk level for financial analysis
export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// TS: Type Alias — Semantic alias for flat number string
export type FlatNumber = string;

// TS: Type Alias — Semantic alias for credit score range
export type CreditScore = number;

// TS: Tuple — Flat-amount pair for quick lookups
export type FlatAmountPair = [FlatNumber, number];

// TS: Union Type — Contact information can be phone or email
export type ContactInfo = string | null;

// TS: Interface — Core member data shape
export interface IMember {
  // TS: Primitive types
  id: string;                               // string
  flatNo: FlatNumber;                        // Type alias
  ownerName: string;                         // string
  phone: string;                             // string
  email: ContactInfo;                        // TS: Union Type (string | null)
  paymentStatus: PaymentStatus;              // TS: Enum
  creditScore: CreditScore;                  // number (0-100)
  paymentStreak: number;                     // number (consecutive on-time months)
  outstandingAmount: number;                  // number
  isActive: boolean;                         // boolean
  joinDate: string;                          // ISO date string
  avatarUrl: string;                         // string for property binding demo
}

// TS: Type Alias — Summary tuple for dashboard display
export type MemberSummary = [string, FlatNumber, PaymentStatus];

// TS: Interface — Member filter criteria
export interface MemberFilter {
  searchTerm?: string;
  status?: PaymentStatus | 'ALL';
  riskLevel?: RiskLevel;
  minCreditScore?: number;
  maxCreditScore?: number;
}

// TS: Constant — Default member values
export const DEFAULT_MEMBER: Readonly<IMember> = {
  id: '',
  flatNo: '',
  ownerName: '',
  phone: '',
  email: null,
  paymentStatus: PaymentStatus.PENDING,
  creditScore: 50,
  paymentStreak: 0,
  outstandingAmount: 0,
  isActive: true,
  joinDate: new Date().toISOString(),
  avatarUrl: ''
};

// TS: Array type — Quick credit score bands
export const CREDIT_SCORE_BANDS: ReadonlyArray<{ min: number; max: number; label: string; level: RiskLevel }> = [
  { min: 0, max: 25, label: 'Critical', level: RiskLevel.CRITICAL },
  { min: 26, max: 50, label: 'High Risk', level: RiskLevel.HIGH },
  { min: 51, max: 75, label: 'Medium Risk', level: RiskLevel.MEDIUM },
  { min: 76, max: 100, label: 'Low Risk', level: RiskLevel.LOW }
];
