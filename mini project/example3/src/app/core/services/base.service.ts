// SmartSociety — Financial Intelligence Platform
// base.service.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 8: Generics (Generic service, function, interface)
//   - Topic 13: Dependency Injection (Injectable)
//   - Topic 16: HTTP Client (HttpClient usage)
// ═══════════════════════════════════════════════════════════════

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse } from '../models';

// TS: Generic Type — Generic base service providing CRUD operations
// ANGULAR: Dependency Injection — providedIn: 'root' for singleton
@Injectable({ providedIn: 'root' })
export class BaseService<T> {

  // ANGULAR: Dependency Injection — inject() function (new Angular 17 style)
  protected http = inject(HttpClient);

  // Protected base URL from environment
  protected baseUrl = environment.apiUrl;

  /**
   * TS: Generic Function — GET all entities
   * ANGULAR: HttpClient — GET request with error handling
   * @param endpoint - API endpoint path
   * @param params - Optional query parameters
   * @returns Observable of entity array
   */
  getAll(endpoint: string, params?: Record<string, string>): Observable<T[]> {
    // ANGULAR: HttpClient — HttpParams for query strings
    let httpParams = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        httpParams = httpParams.set(key, value);
      });
    }

    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`, { params: httpParams }).pipe(
      retry(2),                                       // ANGULAR: HttpClient — retry on failure
      catchError(this.handleError)                    // ANGULAR: HttpClient — error handling
    );
  }

  /**
   * TS: Generic Function — GET single entity by ID
   * @param endpoint - API endpoint path
   * @param id - Entity identifier
   * @returns Observable of single entity
   */
  getById<U = T>(endpoint: string, id: string): Observable<U> {
    return this.http.get<U>(`${this.baseUrl}/${endpoint}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * TS: Generic Function — POST create new entity
   * @param endpoint - API endpoint path
   * @param data - Entity data to create
   * @returns Observable of created entity
   */
  create(endpoint: string, data: Partial<T>): Observable<T> {
    // ANGULAR: HttpClient — HttpHeaders for content type
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * TS: Generic Function — PUT update existing entity
   * @param endpoint - API endpoint path
   * @param id - Entity identifier
   * @param data - Updated entity data
   * @returns Observable of updated entity
   */
  update(endpoint: string, id: string, data: Partial<T>): Observable<T> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}`, data, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * TS: Generic Function — DELETE entity
   * @param endpoint - API endpoint path
   * @param id - Entity identifier
   * @returns Observable of deleted confirmation
   */
  delete(endpoint: string, id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${endpoint}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * TS: Generic Function — GET paginated results
   * @param endpoint - API endpoint path
   * @param page - Page number
   * @param limit - Items per page
   * @returns Observable of paginated response
   */
  getPaginated(endpoint: string, page: number = 1, limit: number = 10): Observable<PaginatedResponse<T>> {
    const params = new HttpParams()
      .set('_page', page.toString())
      .set('_limit', limit.toString());

    return this.http.get<T[]>(`${this.baseUrl}/${endpoint}`, {
      params,
      observe: 'response'
    }).pipe(
      map(response => ({
        items: response.body || [],
        total: parseInt(response.headers.get('X-Total-Count') || '0', 10),
        page,
        limit,
        hasMore: (response.body?.length || 0) === limit
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Centralized error handler for HTTP operations.
   * @param error - The HTTP error response
   * @returns Observable that errors with a user-friendly message
   */
  protected handleError(error: { status: number; message: string }): Observable<never> {
    let errorMessage = 'An unexpected error occurred';

    if (error.status === 0) {
      errorMessage = 'Network error — please check your connection';
    } else if (error.status === 404) {
      errorMessage = 'Resource not found';
    } else if (error.status === 500) {
      errorMessage = 'Server error — please try again later';
    } else {
      errorMessage = `Error ${error.status}: ${error.message}`;
    }

    console.error('[BaseService Error]', errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}
