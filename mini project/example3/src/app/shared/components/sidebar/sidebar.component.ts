// SmartSociety — Financial Intelligence Platform
// sidebar.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components (standalone, lifecycle)
//   - Topic 11: Data Binding (interpolation, property, event)
//   - Topic 12: Directives (*ngFor, [ngClass], [routerLinkActive])
//   - Topic 15: Routing (RouterLink, RouterLinkActive)
// ═══════════════════════════════════════════════════════════════

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService, AuthUser } from '../../../core/services/auth.service';

// TS: Interface — Navigation item shape
interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  // ANGULAR: Component Lifecycle — ngOnInit, ngOnDestroy

  currentUser: AuthUser | null = null;
  isCollapsed = false;

  // RXJS: takeUntil — Cleanup pattern
  private destroy$ = new Subject<void>();

  // Navigation items — no magic strings
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: '', route: '/dashboard', adminOnly: false },
    { label: 'Members', icon: '', route: '/members', adminOnly: false },
    { label: 'Payments', icon: '', route: '/payments', adminOnly: false },
    { label: 'Reports', icon: '', route: '/reports', adminOnly: false },
    { label: 'Voting', icon: '', route: '/voting', adminOnly: false },
    { label: 'AI Report', icon: '', route: '/ai-report', adminOnly: false },
    { label: 'Admin', icon: '', route: '/admin', adminOnly: true }
  ];

  // ANGULAR: Dependency Injection — Constructor injection
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // ANGULAR: Component Lifecycle — ngOnInit
  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((user) => {
      this.currentUser = user;
    });
  }

  // ANGULAR: Component Lifecycle — ngOnDestroy
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Checks if the current route is the login page.
   */
  isLoginPage(): boolean {
    return this.router.url === '/login';
  }

  /**
   * Filters nav items based on user role.
   * @returns Visible navigation items
   */
  getVisibleNavItems(): NavItem[] {
    if (!this.currentUser) return [];
    return this.navItems.filter(
      (item) => !item.adminOnly || this.currentUser?.role === 'admin'
    );
  }

  /**
   * Handles user logout.
   * Event binding: (click)="onLogout()"
   */
  onLogout(): void {
    this.authService.logout();
  }

  /**
   * Toggles sidebar collapsed state.
   */
  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  /**
   * trackBy function for *ngFor performance.
   * ANGULAR: Directive — trackBy on *ngFor
   */
  trackByRoute(index: number, item: NavItem): string {
    return item.route;
  }
}
