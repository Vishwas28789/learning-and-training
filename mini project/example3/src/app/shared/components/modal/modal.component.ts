// SmartSociety — Financial Intelligence Platform
// modal.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components (@Input, @Output)
//   - Topic 11: Data Binding (property, event)
// ═══════════════════════════════════════════════════════════════

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- BINDING: Property Binding — *ngIf="isOpen" -->
    <div class="modal-overlay" *ngIf="isOpen" (click)="onOverlayClick($event)">
      <div class="modal-content" [ngStyle]="{ 'max-width': maxWidth }">
        <div class="modal-header">
          <!-- BINDING: Interpolation -->
          <h3>{{ title }}</h3>
          <!-- BINDING: Event Binding -->
          <button class="modal-close" (click)="close()">×</button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-lg);
    }
    .modal-header h3 {
      font-family: var(--font-heading);
      font-size: var(--text-xl);
    }
    .modal-close {
      background: none;
      border: none;
      font-size: var(--text-2xl);
      cursor: pointer;
      color: var(--ink-muted);
      padding: 0;
      line-height: 1;
    }
    .modal-close:hover { color: var(--ink); }
    .modal-body { font-size: var(--text-sm); }
  `]
})
export class ModalComponent {
  // ANGULAR: @Input — Receives data from parent component
  @Input() isOpen = false;
  @Input() title = 'Modal';
  @Input() maxWidth = '500px';

  // ANGULAR: @Output — Emits events to parent component
  @Output() closed = new EventEmitter<void>();

  close(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  onOverlayClick(event: MouseEvent): void {
    // Close only if clicking the overlay, not the content
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }
}
