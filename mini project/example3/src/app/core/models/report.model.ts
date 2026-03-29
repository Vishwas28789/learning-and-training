// SmartSociety — Financial Intelligence Platform
// report.model.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 5: TypeScript Data Types
//   - Topic 6: TypeScript Interfaces
//   - Topic 8: Generics (ApiResponse<T>)
// ═══════════════════════════════════════════════════════════════

// TS: Generic Interface — Reusable API response wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

// TS: Generic Interface — Paginated response
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// TS: Interface — Financial health report
export interface IReport {
  id: string;
  title: string;
  generatedAt: string;
  period: ReportPeriod;
  summary: ReportSummary;
  insights: ReportInsight[];
  healthScore: number;          // 0-100
}

// TS: Interface — Report period range
export interface ReportPeriod {
  startDate: string;
  endDate: string;
  label: string;                // e.g., "January 2024"
}

// TS: Interface — Financial summary
export interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  collectionEfficiency: number; // percentage
  overdueAccounts: number;
  activeMembers: number;
}

// TS: Interface — Individual report insight
export interface ReportInsight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  title: string;
  description: string;
  recommendation: string;
  affectedFlats: string[];
}

// TS: Enum — Types of report insights
export enum InsightType {
  PAYMENT_TREND = 'PAYMENT_TREND',
  ANOMALY = 'ANOMALY',
  FORECAST = 'FORECAST',
  WARNING = 'WARNING',
  RECOMMENDATION = 'RECOMMENDATION'
}

// TS: Enum — Insight severity levels
export enum InsightSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL'
}

// TS: Interface — Chart data point for SVG visualizations
export interface ChartDataPoint {
  label: string;
  value: number;
  color: string;
}

// TS: Interface — Monthly trend data
export interface TrendData {
  month: string;
  income: number;
  expenses: number;
  balance: number;
}

// TS: Interface — AI-generated report section
export interface AIReportSection {
  heading: string;
  content: string;
  confidence: number;           // 0-1
  dataPoints: ChartDataPoint[];
}
