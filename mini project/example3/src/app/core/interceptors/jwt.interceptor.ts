// SmartSociety — Financial Intelligence Platform
// jwt.interceptor.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 13: Dependency Injection (inject() function)
//   - Topic 16: HTTP Client (HttpInterceptor, HttpHeaders)
// ═══════════════════════════════════════════════════════════════

import { inject } from '@angular/core';
import {
  HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

// ANGULAR: HttpInterceptor — Functional interceptor (Angular 17 style)
// Automatically attaches JWT token to all outgoing HTTP requests.

/**
 * JWT Interceptor: Clones every outgoing request and adds the
 * Authorization header with the Bearer token from AuthService.
 * ANGULAR: HttpClient — HttpHeaders for JWT token
 */
export const jwtInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {

  // ANGULAR: Dependency Injection — inject() in functional interceptor
  const authService = inject(AuthService);
  const token = authService.getToken();

  // If token exists, clone the request and attach the Authorization header
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
        'X-App-Version': '1.0.0'
      }
    });

    return next(clonedReq);
  }

  // If no token, pass the original request through
  return next(req);
};
