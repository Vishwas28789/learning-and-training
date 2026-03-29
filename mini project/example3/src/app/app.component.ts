// SmartSociety — Financial Intelligence Platform
// app.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Architecture + Components (@Component)
//   - Topic 11: Templates + Data Binding (interpolation)
//   - Topic 15: Routing (RouterOutlet)
// ═══════════════════════════════════════════════════════════════

import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ToastComponent } from './shared/components/toast/toast.component';

// ANGULAR: Component — Root application component
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, ToastComponent],
  template: `
    <!-- BINDING: Interpolation -->
    <div class="app-layout">
      <app-sidebar></app-sidebar>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
    <app-toast></app-toast>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  title = 'SmartSociety';
}
