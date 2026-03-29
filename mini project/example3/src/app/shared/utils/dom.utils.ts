// SmartSociety — Financial Intelligence Platform
// dom.utils.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 1: JS Basics + DOM Manipulation
//     (variables, DOM manipulation, event listeners)
// ═══════════════════════════════════════════════════════════════

// JS BASICS DEMO: Variables (let/const/var differences)
// -------------------------------------------------------
// `var` — function-scoped, hoisted, allows redeclaration.
//   var message = 'Hello'; // Avoid in modern code
// `let` — block-scoped, NOT hoisted, no redeclaration.
//   let counter = 0; // Use when value will be reassigned
// `const` — block-scoped, NOT hoisted, cannot be reassigned.
//   const PI = 3.14; // Use for values that won't change
// In TypeScript with strict mode, always prefer `const` first,
// then `let` if reassignment is needed. Never use `var`.

// JS BASICS DEMO: DOM Manipulation — Update dashboard counter element
/**
 * Animates a counter element from 0 to a target number.
 * Uses requestAnimationFrame for smooth 60fps animation.
 * @param elementId - The DOM element ID to update
 * @param targetValue - The numeric target to count up to
 * @param duration - Animation duration in milliseconds
 */
export function animateCounter(
  elementId: string,
  targetValue: number,
  duration: number = 1500
): void {
  // JS BASICS DEMO: DOM Manipulation — querySelector
  const element = document.getElementById(elementId);
  if (!element) return;

  // let: used because these values change during animation
  let startTime: number | null = null;
  let currentValue = 0;

  // const: used because the function reference doesn't change
  const step = (timestamp: number): void => {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);

    // JS BASICS DEMO: DOM Manipulation — textContent update
    currentValue = Math.floor(progress * targetValue);
    element.textContent = currentValue.toLocaleString('en-IN');

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = targetValue.toLocaleString('en-IN');
    }
  };

  requestAnimationFrame(step);
}

// JS BASICS DEMO: DOM Manipulation — Create and append elements
/**
 * Creates an alert banner element and appends it to a container.
 * @param containerId - The container DOM element ID
 * @param message - Alert message text
 * @param type - Alert type for styling (success | warning | danger)
 */
export function createAlertBanner(
  containerId: string,
  message: string,
  type: 'success' | 'warning' | 'danger' = 'warning'
): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  // JS BASICS DEMO: DOM Manipulation — createElement + setAttribute
  const alert = document.createElement('div');
  alert.className = `alert alert-${type} animate-fadeUp`;
  alert.setAttribute('role', 'alert');

  const text = document.createElement('span');
  text.textContent = message;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.className = 'alert-close';

  // JS BASICS DEMO: Event Listener — click event
  closeBtn.addEventListener('click', () => {
    alert.style.opacity = '0';
    alert.style.transform = 'translateY(-10px)';
    setTimeout(() => alert.remove(), 300);
  });

  alert.appendChild(text);
  alert.appendChild(closeBtn);
  container.appendChild(alert);
}

// JS BASICS DEMO: Event Listener — input event with throttling
/**
 * Attaches a throttled input event listener for search fields.
 * @param inputId - The input element ID
 * @param callback - Function to call with the input value
 * @param delay - Throttle delay in milliseconds
 */
export function attachSearchListener(
  inputId: string,
  callback: (value: string) => void,
  delay: number = 300
): (() => void) {
  const input = document.getElementById(inputId) as HTMLInputElement | null;
  if (!input) return () => {};

  let timeoutId: ReturnType<typeof setTimeout>;

  // JS BASICS DEMO: Event Listener — input event
  const handler = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(target.value), delay);
  };

  input.addEventListener('input', handler);

  // JS BASICS DEMO: Event Listener — change event
  input.addEventListener('change', handler);

  // Return cleanup function
  return () => {
    input.removeEventListener('input', handler);
    input.removeEventListener('change', handler);
  };
}

// JS BASICS DEMO: DOM Manipulation — Toggle classes
/**
 * Toggles an active state class on an element.
 * @param elementId - The element ID
 * @param className - CSS class to toggle
 */
export function toggleClass(elementId: string, className: string): void {
  const element = document.getElementById(elementId);
  if (!element) return;
  element.classList.toggle(className);
}

// JS BASICS DEMO: DOM Manipulation — Update multiple elements by selector
/**
 * Updates all stat display elements matching a data attribute.
 * @param stats - Record of stat name to stat value
 */
export function updateStatDisplays(stats: Record<string, string | number>): void {
  Object.entries(stats).forEach(([key, value]) => {
    // JS BASICS DEMO: DOM Manipulation — querySelectorAll
    const elements = document.querySelectorAll(`[data-stat="${key}"]`);
    elements.forEach((el) => {
      el.textContent = String(value);
    });
  });
}
