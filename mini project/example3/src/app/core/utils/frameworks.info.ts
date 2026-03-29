// SmartSociety — Financial Intelligence Platform
// frameworks.info.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 4: JS Frameworks & Libraries Intro
//     (Why Angular vs Vanilla JS, before/after comparison)
// ═══════════════════════════════════════════════════════════════

// JS FRAMEWORKS & LIBRARIES INTRO

/**
 * WHY ANGULAR OVER VANILLA JAVASCRIPT?
 *
 * Angular provides a structured, opinionated framework that solves
 * common web development challenges out of the box:
 *
 * 1. Component-Based Architecture — Encapsulate UI logic, templates,
 *    and styles into reusable, testable units.
 *
 * 2. Dependency Injection — Built-in DI system for managing service
 *    lifecycles and promoting loose coupling.
 *
 * 3. Two-Way Data Binding — Automatic synchronization between model
 *    and view reduces boilerplate DOM updates.
 *
 * 4. Routing — Declarative route config with lazy loading, guards,
 *    and resolver support built in.
 *
 * 5. RxJS Integration — First-class reactive programming support
 *    for managing async data flows.
 *
 * 6. TypeScript — Static typing catches errors at compile time,
 *    improving maintainability in large codebases.
 *
 * 7. Testing — Built-in TestBed for component/service testing
 *    with Jasmine and Karma integration.
 */

// ── BEFORE: Vanilla JS DOM Manipulation ─────────────────────
// In vanilla JS, you manually query the DOM, attach listeners,
// and imperatively update elements:
//
// ```javascript
// // VANILLA JS VERSION
// const memberList = document.getElementById('member-list');
// const searchInput = document.getElementById('search');
//
// function renderMembers(members) {
//   memberList.innerHTML = '';
//   members.forEach(member => {
//     const card = document.createElement('div');
//     card.className = 'member-card';
//     card.innerHTML = `
//       <h3>${member.name}</h3>
//       <p>Flat: ${member.flatNo}</p>
//       <p>Status: ${member.status}</p>
//       <span class="chip chip-${member.status.toLowerCase()}">
//         ${member.status}
//       </span>
//     `;
//     card.addEventListener('click', () => showDetails(member.id));
//     memberList.appendChild(card);
//   });
// }
//
// searchInput.addEventListener('input', (e) => {
//   const filtered = allMembers.filter(m =>
//     m.name.toLowerCase().includes(e.target.value.toLowerCase())
//   );
//   renderMembers(filtered);
// });
//
// // Problems:
// // - Manual DOM manipulation is error-prone
// // - No type safety
// // - No lifecycle management
// // - Hard to test
// // - State management is ad-hoc
// ```
//
// ── AFTER: Angular Component ────────────────────────────────
// Angular handles DOM updates declaratively. You define WHAT
// should render, not HOW to update the DOM:
//
// ```typescript
// // ANGULAR VERSION
// @Component({
//   selector: 'app-members',
//   template: `
//     <input [(ngModel)]="searchTerm"
//            (input)="onSearch()" />
//
//     <div *ngFor="let member of filteredMembers; trackBy: trackById"
//          class="member-card"
//          (click)="showDetails(member.id)">
//       <h3>{{ member.name }}</h3>
//       <p>Flat: {{ member.flatNo }}</p>
//       <span [ngClass]="'chip chip-' + member.status.toLowerCase()">
//         {{ member.status }}
//       </span>
//     </div>
//   `
// })
// export class MembersComponent {
//   members: IMember[] = [];
//   searchTerm = '';
//
//   constructor(private memberService: MemberService) {}
//
//   get filteredMembers(): IMember[] {
//     return this.members.filter(m =>
//       m.ownerName.toLowerCase().includes(this.searchTerm.toLowerCase())
//     );
//   }
//
//   trackById(index: number, member: IMember): string {
//     return member.id;
//   }
// }
//
// // Benefits:
// // + Declarative template with data binding
// // + Automatic change detection
// // + Type-safe with TypeScript
// // + Testable with TestBed
// // + Services for shared state
// // + Lifecycle hooks for cleanup
// ```

// Exported constant for framework comparison info
export const FRAMEWORK_INFO = {
  name: 'Angular',
  version: 17,
  type: 'Full Framework' as const,
  language: 'TypeScript',
  paradigm: 'Component-Based',
  keyFeatures: [
    'Standalone Components (no NgModule required)',
    'Signals for reactive state (Angular 17+)',
    'Built-in Dependency Injection',
    'Reactive Forms + Template-Driven Forms',
    'RxJS for async data streams',
    'Angular CLI for scaffolding and builds',
    'Lazy loading with loadComponent()',
    'Strict TypeScript for compile-time safety'
  ],
  advantages: [
    'Opinionated structure reduces decision fatigue',
    'Enterprise-grade scalability',
    'Strong typing catches bugs early',
    'Comprehensive testing utilities',
    'Powerful CLI for code generation'
  ],
  comparedTo: {
    react: 'React is a library (UI only), Angular is a full framework with routing, forms, HTTP, and DI built in.',
    vue: 'Vue is lighter and more flexible, Angular is more opinionated with stricter patterns.',
    vanillaJS: 'Vanilla JS gives full control but requires manual DOM management, state handling, and lacks built-in testing support.'
  }
} as const;

// TS: Module Export — Export type for the info object
export type FrameworkInfoType = typeof FRAMEWORK_INFO;
