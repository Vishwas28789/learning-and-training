// SmartSociety — Financial Intelligence Platform
// auth.guard.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 13: Dependency Injection (inject() function)
//   - Topic 15: Routing (Route Guards — canActivate)
// ═══════════════════════════════════════════════════════════════

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// ANGULAR: Route Guard — Functional guard using inject()
// This is the new Angular 17 style of writing guards using functions
// instead of class-based guards.

/**
 * Auth guard: Prevents navigation to protected routes if the user
 * is not authenticated. Redirects to /login.
 * ANGULAR: Dependency Injection — inject() function (new Angular style)
 */
export const authGuard: CanActivateFn = (route, state) => {
  // ANGULAR: Dependency Injection — inject() instead of constructor injection
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Navigate to login with return URL
  router.navigate(['/login'], {
    queryParams: { returnUrl: state.url }
  });

  return false;
};

/**
 * Admin guard: Only allows admin users to access certain routes.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.getUserRole() === 'admin') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
