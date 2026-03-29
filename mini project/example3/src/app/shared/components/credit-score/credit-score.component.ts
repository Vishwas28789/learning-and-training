// SmartSociety — Financial Intelligence Platform
// credit-score.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components (@Input)
//   - Topic 11: Data Binding (interpolation, property, [ngStyle])
//   - Topic 12: Directives ([ngClass], [ngStyle])
// ═══════════════════════════════════════════════════════════════

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-credit-score',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="credit-score-card">
      <div class="score-gauge">
        <!-- BINDING: Property Binding — [ngStyle] for dynamic width -->
        <div class="score-fill"
             [ngStyle]="{ 'width.%': score, 'background': barColor }">
        </div>
      </div>
      <div class="score-info">
        <!-- BINDING: Interpolation -->
        <span class="score-value" [ngStyle]="{ color: barColor }">{{ score }}</span>
        <span class="score-max">/100</span>
      </div>
      <!-- ANGULAR: Directive — [ngClass] for dynamic CSS class -->
      <span class="score-label" [ngClass]="scoreLevelClass">
        {{ scoreLabel }}
      </span>
    </div>
  `,
  styles: [`
    .credit-score-card {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
    }
    .score-gauge {
      flex: 1;
      height: 6px;
      background: var(--paper-cool);
      border-radius: var(--radius-full);
      overflow: hidden;
    }
    .score-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .score-info {
      font-family: var(--font-heading);
      font-size: var(--text-sm);
      font-weight: 700;
      white-space: nowrap;
    }
    .score-max {
      color: var(--ink-muted);
      font-weight: 400;
    }
    .score-label {
      font-family: var(--font-heading);
      font-size: var(--text-xs);
      font-weight: 600;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: var(--radius-full);
      white-space: nowrap;
    }
    .score-label.excellent {
      background: rgba(74, 124, 89, 0.12);
      color: var(--sage-dark);
    }
    .score-label.good {
      background: rgba(201, 168, 76, 0.12);
      color: var(--gold-dark);
    }
    .score-label.poor {
      background: rgba(184, 74, 46, 0.12);
      color: var(--rust);
    }
    .score-label.critical {
      background: rgba(184, 74, 46, 0.2);
      color: var(--rust-dark);
    }
  `]
})
export class CreditScoreComponent implements OnChanges {
  @Input() score = 0;

  barColor = 'var(--sage)';
  scoreLabel = 'Good';
  scoreLevelClass = 'good';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['score']) {
      this.updateScore();
    }
  }

  private updateScore(): void {
    if (this.score >= 76) {
      this.barColor = 'var(--sage)';
      this.scoreLabel = 'Excellent';
      this.scoreLevelClass = 'excellent';
    } else if (this.score >= 51) {
      this.barColor = 'var(--gold)';
      this.scoreLabel = 'Good';
      this.scoreLevelClass = 'good';
    } else if (this.score >= 26) {
      this.barColor = 'var(--rust-light)';
      this.scoreLabel = 'Poor';
      this.scoreLevelClass = 'poor';
    } else {
      this.barColor = 'var(--rust)';
      this.scoreLabel = 'Critical';
      this.scoreLevelClass = 'critical';
    }
  }
}
