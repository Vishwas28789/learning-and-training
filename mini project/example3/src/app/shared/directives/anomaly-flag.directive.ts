// SmartSociety — Financial Intelligence Platform
// anomaly-flag.directive.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 12: Directives (Custom Directive)
//     (ElementRef, Renderer2, @Input, OnChanges)
// ═══════════════════════════════════════════════════════════════

import {
  Directive, ElementRef, Input, OnChanges,
  SimpleChanges, Renderer2
} from '@angular/core';
import { ANOMALY_THRESHOLD } from '../../core/models';

// ANGULAR: Custom Directive — Adds red border if amount exceeds threshold
@Directive({
  selector: '[appAnomalyFlag]',
  standalone: true
})
export class AnomalyFlagDirective implements OnChanges {
  // @Input — The amount to check against threshold
  @Input() appAnomalyFlag = 0;

  // @Input — Custom threshold (defaults to ANOMALY_THRESHOLD constant)
  @Input() anomalyThreshold = ANOMALY_THRESHOLD;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  // ANGULAR: Component Lifecycle — ngOnChanges to react to input changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appAnomalyFlag'] || changes['anomalyThreshold']) {
      this.checkAnomaly();
    }
  }

  private checkAnomaly(): void {
    if (this.appAnomalyFlag > this.anomalyThreshold) {
      // Flag as anomaly — add red border and shadow
      this.renderer.addClass(this.el.nativeElement, 'anomaly-border');
      this.renderer.setAttribute(
        this.el.nativeElement,
        'title',
        `Anomaly: Amount ₹${this.appAnomalyFlag.toLocaleString('en-IN')} exceeds threshold of ₹${this.anomalyThreshold.toLocaleString('en-IN')}`
      );
    } else {
      // Remove anomaly flag
      this.renderer.removeClass(this.el.nativeElement, 'anomaly-border');
      this.renderer.removeAttribute(this.el.nativeElement, 'title');
    }
  }
}
