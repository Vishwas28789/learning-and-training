// SmartSociety — Financial Intelligence Platform
// app.config.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 10: Modules (provideRouter, provideHttpClient,
//     provideAnimations — standalone Angular 17 approach)
//   - Topic 13: Dependency Injection (providers array)
// ═══════════════════════════════════════════════════════════════

import { ApplicationConfig } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt.interceptor';

// ANGULAR: Module System — In Angular 17 with standalone components,
// we use ApplicationConfig instead of NgModule. The providers array
// replaces the imports/providers of the traditional @NgModule.

// ── Legacy NgModule version (for reference) ────────────────
// In older Angular versions (pre-15), you would use:
//
// @NgModule({
//   declarations: [AppComponent],
//   imports: [
//     BrowserModule,
//     BrowserAnimationsModule,
//     HttpClientModule,
//     RouterModule.forRoot(routes),
//     FormsModule,
//     ReactiveFormsModule
//   ],
//   providers: [
//     { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
//   ],
//   bootstrap: [AppComponent]
// })
// export class AppModule { }
//
// The standalone approach below is the modern Angular 17 way.
// ────────────────────────────────────────────────────────────

export const appConfig: ApplicationConfig = {
  providers: [
    // ANGULAR: Module System — provideRouter replaces RouterModule.forRoot()
    provideRouter(routes, withComponentInputBinding()),

    // ANGULAR: Module System — provideHttpClient replaces HttpClientModule
    // withInterceptors() replaces the multi-provider pattern
    provideHttpClient(
      withInterceptors([jwtInterceptor])
    ),

    // ANGULAR: Module System — provideAnimations replaces BrowserAnimationsModule
    provideAnimations()
  ]
};
