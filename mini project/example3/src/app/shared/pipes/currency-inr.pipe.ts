// SmartSociety — Financial Intelligence Platform
// currency-inr.pipe.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 12: Angular Pipes (Custom pipe)
// ═══════════════════════════════════════════════════════════════

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Custom pipe to format numbers as Indian Rupee currency.
 * Usage: {{ amount | currencyInr }}
 * Usage with decimals: {{ amount | currencyInr:2 }}
 */
@Pipe({
  name: 'currencyInr',
  standalone: true
})
export class CurrencyInrPipe implements PipeTransform {

  /**
   * Transforms a number into formatted INR string.
   * @param value - The numeric value to format
   * @param decimals - Number of decimal places (default: 0)
   * @returns Formatted currency string like "₹1,23,456"
   */
  transform(value: number | null | undefined, decimals: number = 0): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '₹0';
    }

    // Indian number formatting: 1,23,45,678
    const formatted = value.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });

    return `₹${formatted}`;
  }
}
