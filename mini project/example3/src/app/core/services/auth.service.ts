// SmartSociety — Financial Intelligence Platform
// auth.service.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 13: Dependency Injection (@Injectable, inject())
//   - Topic 14: Services (BehaviorSubject state management)
//   - Topic 19: RxJS (Observable, BehaviorSubject)
// ═══════════════════════════════════════════════════════════════

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

// TS: Interface — Auth user shape
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'member' | 'viewer';
  token: string;
}

// TS: Interface — Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
}

// ANGULAR: Dependency Injection — @Injectable with providedIn: 'root'
@Injectable({ providedIn: 'root' })
export class AuthService {

  // ANGULAR: Service with BehaviorSubject — Emits current auth state
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);

  // RXJS: Observable — Expose as read-only observable
  public currentUser$: Observable<AuthUser | null> = this.currentUserSubject.asObservable();

  // BehaviorSubject for authentication status
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$: Observable<boolean> = this.isAuthenticatedSubject.asObservable();

  // Constants — No magic strings
  private readonly STORAGE_KEY = 'smart_society_token';
  private readonly USER_KEY = 'smart_society_user';

  constructor(private router: Router) {
    // Check for existing session on initialization
    this.loadStoredSession();
  }

  /**
   * Simulated JWT login.
   * Returns an Observable with delay to simulate network.
   * @param credentials - Email and password
   */
  login(credentials: LoginCredentials): Observable<AuthUser> {
    // Simulated API — Check hardcoded users
    const mockUsers: Record<string, { name: string; role: AuthUser['role']; password: string }> = {
      'admin@smartsociety.com': { name: 'Rajesh Kumar', role: 'admin', password: 'admin123' },
      'member@smartsociety.com': { name: 'Priya Sharma', role: 'member', password: 'member123' },
      'viewer@smartsociety.com': { name: 'Amit Patel', role: 'viewer', password: 'viewer123' }
    };

    const user = mockUsers[credentials.email];

    if (!user || user.password !== credentials.password) {
      return throwError(() => new Error('Invalid email or password'));
    }

    // Create mock JWT token
    const token = btoa(JSON.stringify({
      sub: credentials.email,
      name: user.name,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 3600000 // 1 hour
    }));

    const authUser: AuthUser = {
      id: `USR-${Date.now()}`,
      email: credentials.email,
      name: user.name,
      role: user.role,
      token
    };

    // Simulate network delay
    return of(authUser).pipe(
      delay(800),
      tap((loggedInUser) => {
        this.setSession(loggedInUser);
      })
    );
  }

  /**
   * Logs out the user and clears session.
   */
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Gets the current auth token.
   */
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.STORAGE_KEY);
    }
    return null;
  }

  /**
   * Checks if user is currently authenticated.
   */
  isLoggedIn(): boolean {
    return this.isAuthenticatedSubject.getValue();
  }

  /**
   * Gets current user role.
   */
  getUserRole(): string | null {
    const user = this.currentUserSubject.getValue();
    return user?.role ?? null;
  }

  /**
   * Saves session to localStorage and updates subjects.
   */
  private setSession(user: AuthUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, user.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.currentUserSubject.next(user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Loads stored session from localStorage on init.
   */
  private loadStoredSession(): void {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem(this.USER_KEY);
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser) as AuthUser;
          this.currentUserSubject.next(user);
          this.isAuthenticatedSubject.next(true);
        } catch {
          this.logout();
        }
      }
    }
  }
}
