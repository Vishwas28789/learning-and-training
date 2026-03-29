// SmartSociety — Financial Intelligence Platform
// highlight.directive.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 12: Directives (Custom Directive)
//     (HostListener, HostBinding, ElementRef)
// ═══════════════════════════════════════════════════════════════

import { Directive, ElementRef, HostListener, Input } from '@angular/core';

// ANGULAR: Custom Directive — Changes background color on hover
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective {
  // @Input — Custom highlight color, defaults to gold
  @Input() appHighlight = '';
  @Input() highlightDefault = '';

  private defaultBg = '';

  constructor(private el: ElementRef<HTMLElement>) {
    this.defaultBg = this.el.nativeElement.style.backgroundColor;
  }

  // ANGULAR: Custom Directive — HostListener for mouseenter
  @HostListener('mouseenter')
  onMouseEnter(): void {
    const color = this.appHighlight || 'rgba(201, 168, 76, 0.08)';
    this.el.nativeElement.style.backgroundColor = color;
    this.el.nativeElement.style.transition = 'background-color 200ms ease';
  }

  // ANGULAR: Custom Directive — HostListener for mouseleave
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.el.nativeElement.style.backgroundColor = this.highlightDefault || this.defaultBg;
  }
}
