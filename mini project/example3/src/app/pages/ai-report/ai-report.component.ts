// SmartSociety — Financial Intelligence Platform
// ai-report.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components (standalone, lifecycle)
//   - Topic 11: Data Binding
//   - Topic 19: RxJS (interval, takeUntil, Subject)
// ═══════════════════════════════════════════════════════════════

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, interval } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';
import { ReportService } from '../../core/services/report.service';
import { StateService } from '../../core/services/state.service';
import { AIReportSection } from '../../core/models';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';

@Component({
  selector: 'app-ai-report',
  standalone: true,
  imports: [CommonModule, CurrencyInrPipe],
  templateUrl: './ai-report.component.html',
  styleUrls: ['./ai-report.component.css']
})
export class AiReportComponent implements OnInit, OnDestroy {

  sections: AIReportSection[] = [];
  currentSectionIndex = 0;
  displayedText = '';
  isGenerating = false;
  isComplete = false;
  generatedSections: { heading: string; content: string; confidence: number }[] = [];

  private destroy$ = new Subject<void>();

  constructor(
    private reportService: ReportService,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.sections = this.reportService.generateAIReport();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Starts the typewriter streaming simulation.
   * Generates AI report one character at a time.
   */
  generateReport(): void {
    if (this.isGenerating) return;

    this.isGenerating = true;
    this.isComplete = false;
    this.generatedSections = [];
    this.currentSectionIndex = 0;
    this.displayedText = '';

    this.stateService.showToast('AI Report generation started...', 'info');
    this.typewriteNextSection();
  }

  private typewriteNextSection(): void {
    if (this.currentSectionIndex >= this.sections.length) {
      this.isGenerating = false;
      this.isComplete = true;
      this.stateService.showToast('AI Report generated!', 'success');
      return;
    }

    const section = this.sections[this.currentSectionIndex];
    const fullText = section.content;
    let charIndex = 0;
    this.displayedText = '';

    // Typewriter effect — one character every 20ms
    interval(20).pipe(
      take(fullText.length),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => {
        this.displayedText += fullText[charIndex];
        charIndex++;
      },
      complete: () => {
        // Store completed section
        this.generatedSections.push({
          heading: section.heading,
          content: fullText,
          confidence: section.confidence
        });
        this.currentSectionIndex++;
        this.displayedText = '';

        // Continue to next section after brief pause
        setTimeout(() => this.typewriteNextSection(), 500);
      }
    });
  }

  /**
   * Resets and regenerates the report.
   */
  resetReport(): void {
    this.generatedSections = [];
    this.currentSectionIndex = 0;
    this.displayedText = '';
    this.isComplete = false;
    this.isGenerating = false;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
