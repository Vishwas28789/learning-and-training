// SmartSociety — Financial Intelligence Platform
// api.service.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 3: Fetch API + Async/Await + Promises
//     (Raw Fetch, Promise chain, async/await, Promise.all,
//      try/catch error handling, loading state)
//   - Topic 16: HTTP Client (Angular HttpClient)
//   - Topic 13: Dependency Injection
// ═══════════════════════════════════════════════════════════════

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { IPayment, IMember, IExpense } from '../models';

// ANGULAR: Dependency Injection — @Injectable with providedIn: 'root'
@Injectable({ providedIn: 'root' })
export class ApiService {

  // ANGULAR: Dependency Injection — inject() function
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Loading state management flag
  public isLoading = false;

  // ═══════════════════════════════════════════════════════════
  // FETCH API DEMO — Raw Fetch API call to mock endpoint
  // ═══════════════════════════════════════════════════════════
  /**
   * Demonstrates raw Fetch API usage (Topic 3).
   * Note: In Angular, prefer HttpClient. This is for syllabus demo.
   */
  fetchMembersRaw(): Promise<IMember[]> {
    // FETCH API DEMO — Using the browser Fetch API
    return fetch(`${this.apiUrl}/members`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return response.json() as Promise<IMember[]>;
    });
  }

  // ═══════════════════════════════════════════════════════════
  // PROMISE CHAIN — Fetch with .then().catch()
  // ═══════════════════════════════════════════════════════════
  /**
   * Demonstrates Promise chain pattern with then/catch.
   */
  fetchPaymentsWithPromise(): Promise<IPayment[]> {
    this.isLoading = true;

    // PROMISE CHAIN — .then() for success, .catch() for errors
    return fetch(`${this.apiUrl}/payments`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch payments: ${response.statusText}`);
        }
        return response.json() as Promise<IPayment[]>;
      })
      .then((payments: IPayment[]) => {
        console.log(`[ApiService] Fetched ${payments.length} payments`);
        return payments;
      })
      .catch((error: Error) => {
        console.error('[ApiService] Promise chain error:', error.message);
        throw error;
      })
      .finally(() => {
        // Loading state management
        this.isLoading = false;
      });
  }

  // ═══════════════════════════════════════════════════════════
  // ASYNC/AWAIT — Modern async pattern
  // ═══════════════════════════════════════════════════════════
  /**
   * Demonstrates async/await pattern with try/catch error handling.
   */
  async getPaymentsAsync(): Promise<IPayment[]> {
    this.isLoading = true;

    // ASYNC/AWAIT — try/catch for error handling
    try {
      const response = await fetch(`${this.apiUrl}/payments`);

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const payments = await response.json() as IPayment[];
      console.log(`[ApiService] Async fetched ${payments.length} payments`);
      return payments;

    } catch (error) {
      // ASYNC/AWAIT — Error handling with try/catch
      console.error('[ApiService] Async error:', error);
      throw error;

    } finally {
      // Loading state management
      this.isLoading = false;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // PROMISE.ALL — Parallel requests
  // ═══════════════════════════════════════════════════════════
  /**
   * Demonstrates Promise.all() for parallel HTTP requests.
   * Fetches members, payments, and expenses simultaneously.
   */
  async fetchDashboardData(): Promise<{
    members: IMember[];
    payments: IPayment[];
    expenses: IExpense[];
  }> {
    this.isLoading = true;

    try {
      // PROMISE.ALL — Execute multiple requests in parallel
      const [members, payments, expenses] = await Promise.all([
        fetch(`${this.apiUrl}/members`).then(r => r.json() as Promise<IMember[]>),
        fetch(`${this.apiUrl}/payments`).then(r => r.json() as Promise<IPayment[]>),
        fetch(`${this.apiUrl}/expenses`).then(r => r.json() as Promise<IExpense[]>)
      ]);

      console.log('[ApiService] Dashboard data loaded via Promise.all');
      return { members, payments, expenses };

    } catch (error) {
      console.error('[ApiService] Promise.all error:', error);
      throw error;

    } finally {
      this.isLoading = false;
    }
  }

  // ═══════════════════════════════════════════════════════════
  // ANGULAR: HttpClient — Observable-based HTTP methods
  // ═══════════════════════════════════════════════════════════

  /**
   * ANGULAR: HttpClient — GET request
   * @param endpoint - API path
   * @param params - Optional query params
   * @returns Observable of response data
   */
  get<T>(endpoint: string, params?: Record<string, string>): Observable<T> {
    // ANGULAR: HttpClient — HttpParams for query strings
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, value);
      });
    }

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params: httpParams }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * ANGULAR: HttpClient — POST request
   */
  post<T>(endpoint: string, data: unknown): Observable<T> {
    // ANGULAR: HttpClient — HttpHeaders for JWT token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });

    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * ANGULAR: HttpClient — PUT request
   */
  put<T>(endpoint: string, data: unknown): Observable<T> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * ANGULAR: HttpClient — DELETE request
   */
  deleteReq<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get JWT token from localStorage.
   */
  private getToken(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('smart_society_token') || '';
    }
    return '';
  }

  /**
   * Centralized error handler.
   */
  private handleError(error: { status: number; message: string }): Observable<never> {
    const msg = `[ApiService Error] Status: ${error.status} — ${error.message}`;
    console.error(msg);
    return throwError(() => new Error(msg));
  }
}
