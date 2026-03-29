// SmartSociety — Financial Intelligence Platform
// risk-level.pipe.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 12: Angular Pipes (Custom pipe)
// ═══════════════════════════════════════════════════════════════

import { Pipe, PipeTransform } from '@angular/core';
import { RiskLevel, CreditScore, CREDIT_SCORE_BANDS } from '../../core/models';

/**
 * Custom pipe to convert credit score to risk level label.
 * Usage: {{ member.creditScore | riskLevel }}
 */
@Pipe({
  name: 'riskLevel',
  standalone: true
})
export class RiskLevelPipe implements PipeTransform {

  /**
   * Transforms a credit score into a human-readable risk level.
   * @param score - Credit score (0-100)
   * @returns Risk level string like "Low Risk" or "Critical"
   */
  transform(score: CreditScore | null | undefined): string {
    if (score === null || score === undefined) return 'Unknown';

    const band = CREDIT_SCORE_BANDS.find((b) => score >= b.min && score <= b.max);
    return band?.label ?? 'Unknown';
  }
}
