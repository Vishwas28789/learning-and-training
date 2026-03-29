# SmartSociety — Financial Intelligence Platform

> Production-quality Angular 17 project demonstrating **24 syllabus topics** through a complete apartment society financial management application.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start mock API server (port 3000)
npm run api

# Start Angular dev server (port 4200)
npm start

# Run unit tests
npm test
```

**Demo Accounts:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@smartsociety.com | admin123 |
| Member | member@smartsociety.com | member123 |

---

## Architecture

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # TypeScript models, enums, interfaces, generics
│   │   ├── services/        # Angular services (CRUD, state, auth, reports)
│   │   ├── guards/          # Route guards (auth, admin)
│   │   └── interceptors/    # HTTP interceptors (JWT)
│   ├── shared/
│   │   ├── components/      # Sidebar, Toast, Modal, Health Ring, Credit Score
│   │   ├── pipes/           # CurrencyINR, RiskLevel
│   │   ├── directives/      # Highlight, AnomalyFlag
│   │   └── utils/           # DOM utils, ES6 utils, Framework comparison
│   └── pages/
│       ├── login/           # Reactive Forms + JWT auth
│       ├── dashboard/       # Stat cards, Health Ring, recent activity
│       ├── members/         # Template-driven forms + credit scores
│       ├── payments/        # Reactive Forms (FormArray, custom validators)
│       ├── reports/         # SVG bar + line charts
│       ├── voting/          # Live countdown timer + vote casting
│       ├── ai-report/       # Typewriter streaming simulation
│       └── admin/           # Expense approval + Router.navigate()
├── environments/            # Dev/prod config
└── styles.css               # CSS design system
```

---

## Syllabus Coverage Map

| # | Topic | Files | Key Demonstration |
|---|-------|-------|-------------------|
| 1 | JS Basics | `dom.utils.ts`, `dashboard.component.ts` | Variables, types, DOM manipulation, `requestAnimationFrame` counter |
| 2 | Control Flow | `dom.utils.ts`, `es6.utils.ts` | If/else, switch, for/while, ternary |
| 3 | Functions | `es6.utils.ts` | Arrow functions, closures, IIFE, callbacks |
| 4 | Arrays + Objects | `es6.utils.ts`, `member.service.ts` | map, filter, reduce, spread, destructuring |
| 5 | ES6+ Features | `es6.utils.ts` | Template literals, optional chaining, nullish coalescing, `Promise.all` |
| 6 | Async JS | `api.service.ts` | Fetch API, Promise chains, async/await, `Promise.all` |
| 7 | DOM APIs | `dom.utils.ts` | querySelector, addEventListener, classList, animations |
| 8 | Angular vs Vanilla | `frameworks.info.ts` | Feature comparison table |
| 9 | Angular Architecture | All components | Standalone components, lifecycle hooks (OnInit, OnDestroy, AfterViewInit, OnChanges) |
| 10 | Modules | `app.config.ts` | `provideRouter`, `provideHttpClient`, `provideAnimations` |
| 11 | Templates + Binding | All templates | Interpolation `{{}}`, Property `[]`, Event `()`, Two-way `[()]` |
| 12 | Directives + Pipes | Templates, pipes, directives | `*ngFor`, `*ngIf`, `*ngSwitch`, `[ngClass]`, `[ngStyle]`, `trackBy`, custom pipes + directives |
| 13 | Dependency Injection | All services, guards | `inject()`, constructor DI, providedIn, `@Injectable` |
| 14 | Services | All 8 services | Generic CRUD, state management, auth, reports, anomaly detection |
| 15 | Routing | `app.routes.ts`, guards, admin page | Lazy loading, `canActivate`, route params, query params, `Router.navigate()` |
| 16 | HTTP Client | `base.service.ts`, `api.service.ts`, interceptor | GET/POST/PUT/DELETE, error handling, retry, `HttpHeaders`, JWT interceptor |
| 17 | Reactive Forms | `payments.component.ts` | `FormBuilder`, `FormGroup`, `FormArray`, custom validators, cross-field validation, `valueChanges`, `statusChanges`, `patchValue`, `reset` |
| 18 | Template Forms | `members.component.html` | `ngModel`, `#formRef="ngForm"`, required, minlength, pattern validators |
| 19 | RxJS | `state.service.ts`, all components | `Subject`, `BehaviorSubject`, `ReplaySubject`, `interval`, `combineLatest`, `forkJoin`, `map`, `filter`, `switchMap`, `mergeMap`, `debounceTime`, `distinctUntilChanged`, `takeUntil`, `catchError`, `tap`, `shareReplay`, `async` pipe |
| 20 | Why Testing | `payments.component.spec.ts` | Regression prevention, documentation, refactoring safety |
| 21 | Jasmine + Karma | All `.spec.ts` files | `describe`, `beforeEach`, `it`, `toBe`, `toEqual`, `toBeTruthy`, `toContain`, `toBeGreaterThan` |
| 22 | Component Testing | `dashboard.component.spec.ts` | `TestBed`, `ComponentFixture`, `DebugElement`, DOM queries, mock child components |
| 23 | Service Testing | `payment.service.spec.ts` | `HttpClientTestingModule`, `HttpTestingController`, mock responses, Observable testing |
| 24 | Negative Testing | All `.spec.ts` files | Invalid form data, empty arrays, boundary values, error scenarios |

---

## Key Features

- 🏠 **Member Management** — Credit scores, payment streaks, risk assessment
- 💰 **Payment Processing** — Full CRUD, CSV export, anomaly detection
- 📊 **SVG Charts** — Bar and line charts built with pure SVG
- 🗳️ **Live Voting** — Real-time countdown, vote bars, approve/reject
- 🤖 **AI Report** — Typewriter streaming simulation with confidence scores
- 🔐 **Authentication** — JWT simulation, route guards, role-based access
- 🎨 **Design System** — CSS custom properties, Google Fonts, animations

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Angular 17 (standalone) |
| Language | TypeScript (strict mode) |
| Styling | CSS + Custom Properties |
| State | RxJS BehaviorSubject |
| HTTP | Angular HttpClient + json-server |
| Testing | Jasmine + Karma |
| Forms | Reactive Forms + Template-driven Forms |
