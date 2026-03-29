// SmartSociety — Financial Intelligence Platform
// toast.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components (standalone)
//   - Topic 11: Data Binding (all 4 types)
//   - Topic 12: Directives (*ngFor, *ngSwitch, [ngClass])
//   - Topic 19: RxJS (async pipe)
// ═══════════════════════════════════════════════════════════════

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService, ToastMessage } from '../../../core/services/state.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- RXJS: async pipe — Subscribe to observable in template -->
    <div class="toast-container" *ngIf="toasts$ | async as toasts">
      <!-- ANGULAR: Directive — *ngFor with trackBy -->
      <div *ngFor="let toast of toasts; trackBy: trackById"
           class="toast animate-fadeUp"
           [ngClass]="'toast-' + toast.type">
        <!-- ANGULAR: Directive — *ngSwitch for toast icon -->
        <span class="toast-icon" [ngSwitch]="toast.type">
          <span *ngSwitchCase="'success'"></span>
          <span *ngSwitchCase="'error'"></span>
          <span *ngSwitchCase="'warning'"></span>
          <span *ngSwitchDefault></span>
        </span>
        <!-- BINDING: Interpolation -->
        <span class="toast-message">{{ toast.message }}</span>
        <!-- BINDING: Event Binding -->
        <button class="toast-close" (click)="dismiss(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: var(--space-lg);
      right: var(--space-lg);
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }
    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: var(--space-sm) var(--space-lg);
      border-radius: var(--radius-md);
      background: white;
      box-shadow: var(--shadow-lg);
      font-family: var(--font-body);
      font-size: var(--text-sm);
      min-width: 280px;
      border-left: 3px solid;
    }
    .toast-success { border-color: var(--sage); }
    .toast-error { border-color: var(--rust); }
    .toast-warning { border-color: var(--gold); }
    .toast-info { border-color: var(--slate); }
    .toast-close {
      margin-left: auto;
      background: none;
      border: none;
      font-size: var(--text-lg);
      cursor: pointer;
      color: var(--ink-muted);
      padding: 0 var(--space-xs);
    }
    .toast-close:hover { color: var(--ink); }
  `]
})
export class ToastComponent {
  private stateService = inject(StateService);
  toasts$: Observable<ToastMessage[]> = this.stateService.toasts$;

  trackById(index: number, toast: ToastMessage): string {
    return toast.id;
  }

  dismiss(id: string): void {
    this.stateService.removeToast(id);
  }
}
