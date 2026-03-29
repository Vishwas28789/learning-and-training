// SmartSociety — Financial Intelligence Platform
// app.routes.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 15: Routing + Navigation
//     (Lazy loading with loadComponent, route guards,
//      route parameters, query parameters)
// ═══════════════════════════════════════════════════════════════

import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Login — No guard needed (public route)
  {
    path: 'login',
    // ANGULAR: Lazy Loading Route — loadComponent for code splitting
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
    title: 'SmartSociety — Login'
  },

  // Dashboard — Protected by auth guard
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    // ANGULAR: Route Guard — canActivate with authGuard
    canActivate: [authGuard],
    title: 'SmartSociety — Dashboard'
  },

  // Members — With route parameter :id for member detail
  {
    path: 'members',
    loadComponent: () =>
      import('./pages/members/members.component').then((m) => m.MembersComponent),
    canActivate: [authGuard],
    title: 'SmartSociety — Members'
  },
  {
    // ANGULAR: Route Parameters — :id for dynamic member detail
    path: 'members/:id',
    loadComponent: () =>
      import('./pages/members/members.component').then((m) => m.MembersComponent),
    canActivate: [authGuard],
    title: 'SmartSociety — Member Detail'
  },

  // Payments — Supports query parameters (?month=june)
  {
    path: 'payments',
    loadComponent: () =>
      import('./pages/payments/payments.component').then((m) => m.PaymentsComponent),
    canActivate: [authGuard],
    title: 'SmartSociety — Payments'
  },

  // Reports — Financial reports with SVG charts
  {
    path: 'reports',
    loadComponent: () =>
      import('./pages/reports/reports.component').then((m) => m.ReportsComponent),
    canActivate: [authGuard],
    title: 'SmartSociety — Reports'
  },

  // Voting — Expense proposals and live voting
  {
    path: 'voting',
    loadComponent: () =>
      import('./pages/voting/voting.component').then((m) => m.VotingComponent),
    canActivate: [authGuard],
    title: 'SmartSociety — Expense Voting'
  },

  // AI Report — Typewriter streaming simulation
  {
    path: 'ai-report',
    loadComponent: () =>
      import('./pages/ai-report/ai-report.component').then((m) => m.AiReportComponent),
    canActivate: [authGuard],
    title: 'SmartSociety — AI Report'
  },

  // Admin — Admin-only route with additional guard
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin.component').then((m) => m.AdminComponent),
    // ANGULAR: Route Guard — Multiple guards (auth + admin)
    canActivate: [authGuard, adminGuard],
    title: 'SmartSociety — Admin'
  },

  // Default redirect
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Wildcard — 404
  { path: '**', redirectTo: '/dashboard' }
];
