// SmartSociety — Financial Intelligence Platform
// health-ring.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components (@Input, ngOnChanges)
//   - Topic 11: Data Binding (property binding on SVG)
// ═══════════════════════════════════════════════════════════════

import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-health-ring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="health-ring-container">
      <svg viewBox="0 0 100 100" class="health-ring-svg">
        <!-- Background circle -->
        <circle cx="50" cy="50" r="45"
                fill="none"
                stroke="var(--paper-cool)"
                stroke-width="6" />
        <!-- Progress circle -->
        <!-- BINDING: Property Binding — [attr.stroke-dashoffset] -->
        <circle cx="50" cy="50" r="45"
                fill="none"
                [attr.stroke]="ringColor"
                stroke-width="6"
                stroke-linecap="round"
                [attr.stroke-dasharray]="circumference"
                [attr.stroke-dashoffset]="dashOffset"
                class="progress-ring"
                transform="rotate(-90 50 50)" />
      </svg>
      <div class="health-ring-value">
        <!-- BINDING: Interpolation -->
        <span class="ring-number">{{ score }}</span>
        <span class="ring-label">{{ label }}</span>
      </div>
    </div>
  `,
  styles: [`
    .health-ring-container {
      position: relative;
      width: 120px;
      height: 120px;
    }
    .health-ring-svg {
      width: 100%;
      height: 100%;
    }
    .progress-ring {
      transition: stroke-dashoffset 1.5s cubic-bezier(0.16, 1, 0.3, 1);
      animation: ringFill 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    .health-ring-value {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
    }
    .ring-number {
      font-family: var(--font-heading);
      font-size: var(--text-2xl);
      font-weight: 800;
      display: block;
      line-height: 1;
    }
    .ring-label {
      font-size: var(--text-xs);
      color: var(--ink-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `]
})
export class HealthRingComponent implements OnChanges {
  // ANGULAR: @Input — Score value (0-100)
  @Input() score = 0;
  @Input() label = 'Health';
  @Input() size = 120;

  circumference = 2 * Math.PI * 45; // ~283
  dashOffset = this.circumference;
  ringColor = 'var(--sage)';

  // ANGULAR: Component Lifecycle — ngOnChanges
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['score']) {
      this.updateRing();
    }
  }

  private updateRing(): void {
    const progress = Math.max(0, Math.min(100, this.score)) / 100;
    this.dashOffset = this.circumference * (1 - progress);

    // Color based on score
    if (this.score >= 75) this.ringColor = 'var(--sage)';
    else if (this.score >= 50) this.ringColor = 'var(--gold)';
    else if (this.score >= 25) this.ringColor = 'var(--rust-light)';
    else this.ringColor = 'var(--rust)';
  }
}
