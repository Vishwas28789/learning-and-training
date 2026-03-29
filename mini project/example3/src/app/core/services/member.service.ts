// SmartSociety — Financial Intelligence Platform
// member.service.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 13: Dependency Injection (constructor injection)
//   - Topic 14: Services (CRUD with BehaviorSubject)
//   - Topic 16: HTTP Client (HttpClient CRUD)
//   - Topic 19: RxJS (BehaviorSubject, map, filter operators)
// ═══════════════════════════════════════════════════════════════

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  IMember, PaymentStatus, RiskLevel, CreditScore,
  CREDIT_SCORE_BANDS, MemberFilter
} from '../models';

// ANGULAR: Dependency Injection — @Injectable singleton
@Injectable({ providedIn: 'root' })
export class MemberService {

  // ANGULAR: Dependency Injection — inject() function
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/members`;

  // ANGULAR: Service with BehaviorSubject — State management
  private membersSubject = new BehaviorSubject<IMember[]>([]);
  public members$: Observable<IMember[]> = this.membersSubject.asObservable();

  // Loading state
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$: Observable<boolean> = this.loadingSubject.asObservable();

  /**
   * Fetches all members from the API.
   * @returns Observable of IMember array
   */
  getAll(): Observable<IMember[]> {
    this.loadingSubject.next(true);

    return this.http.get<IMember[]>(this.apiUrl).pipe(
      tap((members) => {
        this.membersSubject.next(members);
        this.loadingSubject.next(false);
      }),
      catchError((error) => {
        this.loadingSubject.next(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Fetches a single member by ID.
   * @param id - Member identifier
   */
  getById(id: string): Observable<IMember> {
    return this.http.get<IMember>(`${this.apiUrl}/${id}`).pipe(
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Creates a new member.
   * @param member - Member data to create
   */
  create(member: Partial<IMember>): Observable<IMember> {
    return this.http.post<IMember>(this.apiUrl, member).pipe(
      tap((newMember) => {
        const current = this.membersSubject.getValue();
        this.membersSubject.next([...current, newMember]);
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Updates an existing member.
   * @param id - Member ID to update
   * @param data - Updated member data
   */
  update(id: string, data: Partial<IMember>): Observable<IMember> {
    return this.http.put<IMember>(`${this.apiUrl}/${id}`, data).pipe(
      tap((updated) => {
        const current = this.membersSubject.getValue();
        const index = current.findIndex((m) => m.id === id);
        if (index > -1) {
          current[index] = updated;
          this.membersSubject.next([...current]);
        }
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Deletes a member by ID.
   * @param id - Member ID to delete
   */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        const current = this.membersSubject.getValue();
        this.membersSubject.next(current.filter((m) => m.id !== id));
      }),
      catchError((error) => throwError(() => error))
    );
  }

  /**
   * Filters members based on criteria.
   * @param filters - MemberFilter criteria
   * @returns Observable of filtered IMember array
   */
  filterMembers(filters: MemberFilter): Observable<IMember[]> {
    return this.members$.pipe(
      map((members) => {
        let result = [...members];

        if (filters.searchTerm) {
          const term = filters.searchTerm.toLowerCase();
          result = result.filter((m) =>
            m.ownerName.toLowerCase().includes(term) ||
            m.flatNo.toLowerCase().includes(term) ||
            m.phone.includes(term)
          );
        }

        if (filters.status && filters.status !== 'ALL') {
          result = result.filter((m) => m.paymentStatus === filters.status);
        }

        if (filters.minCreditScore !== undefined) {
          result = result.filter((m) => m.creditScore >= (filters.minCreditScore ?? 0));
        }

        if (filters.maxCreditScore !== undefined) {
          result = result.filter((m) => m.creditScore <= (filters.maxCreditScore ?? 100));
        }

        return result;
      })
    );
  }

  /**
   * Calculates credit score for a member based on payment history.
   * Credit Score Engine: Factors include payment streak, outstanding amount,
   * and payment status.
   * @param member - Member to calculate score for
   * @returns Computed credit score (0-100)
   */
  calculateCreditScore(member: IMember): CreditScore {
    let score = 50; // Base score

    // Factor 1: Payment streak (+3 per consecutive month, max 30)
    score += Math.min(member.paymentStreak * 3, 30);

    // Factor 2: Payment status
    switch (member.paymentStatus) {
      case PaymentStatus.PAID:
        score += 15;
        break;
      case PaymentStatus.PARTIAL:
        score += 5;
        break;
      case PaymentStatus.OVERDUE:
        score -= 20;
        break;
      case PaymentStatus.PENDING:
        score -= 5;
        break;
    }

    // Factor 3: Outstanding amount penalty
    if (member.outstandingAmount > 0) {
      const penalty = Math.min(Math.floor(member.outstandingAmount / 1000), 15);
      score -= penalty;
    }

    // Clamp between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Gets the risk level for a given credit score.
   * @param score - Credit score (0-100)
   */
  getRiskLevel(score: CreditScore): RiskLevel {
    const band = CREDIT_SCORE_BANDS.find((b) => score >= b.min && score <= b.max);
    return band?.level ?? RiskLevel.HIGH;
  }

  /**
   * Gets members at risk of defaulting.
   * @returns Observable of high-risk members
   */
  getDefaultRiskMembers(): Observable<IMember[]> {
    return this.members$.pipe(
      map((members) =>
        members.filter((m) =>
          m.creditScore < 40 ||
          m.paymentStatus === PaymentStatus.OVERDUE ||
          m.outstandingAmount > 10000
        )
      )
    );
  }
}
