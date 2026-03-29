// SmartSociety — Financial Intelligence Platform
// login.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components (standalone, lifecycle)
//   - Topic 11: Data Binding (all 4 types)
//   - Topic 13: Dependency Injection (multiple services)
//   - Topic 17: Reactive Forms (FormBuilder, FormGroup, Validators)
// ═══════════════════════════════════════════════════════════════

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { StateService } from '../../core/services/state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  // REACTIVE FORMS: FormGroup
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  // ANGULAR: Dependency Injection — Multiple services injected
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private stateService: StateService,
    private router: Router
  ) {}

  // ANGULAR: Component Lifecycle — ngOnInit
  ngOnInit(): void {
    // If already logged in, redirect
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // REACTIVE FORMS: FormBuilder — Build form with validators
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /**
   * Form submission handler.
   * REACTIVE FORMS: Form submission with loading state
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password }).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.stateService.showToast(`Welcome back, ${user.name}!`, 'success');
        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.errorMessage = err.message;
        this.stateService.showToast('Login failed', 'error');
      }
    });
  }

  /**
   * Quick fill for demo purposes.
   */
  fillDemo(role: 'admin' | 'member'): void {
    const creds = role === 'admin'
      ? { email: 'admin@smartsociety.com', password: 'admin123' }
      : { email: 'member@smartsociety.com', password: 'member123' };

    // REACTIVE FORMS: setValue — Programmatic form update
    this.loginForm.setValue(creds);
  }
}
