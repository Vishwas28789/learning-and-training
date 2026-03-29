// SmartSociety — Financial Intelligence Platform
// reports.component.ts
// ═══════════════════════════════════════════════════════════════
// SYLLABUS COVERAGE:
//   - Topic 9: Angular Components
//   - Topic 11: Data Binding (SVG property bindings)
//   - Topic 12: Directives (*ngFor, [ngStyle])
//   - Topic 19: RxJS (async pipe, combineLatest)
// ═══════════════════════════════════════════════════════════════

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReportService } from '../../core/services/report.service';
import { StateService } from '../../core/services/state.service';
import { ChartDataPoint, TrendData, ReportSummary } from '../../core/models';
import { CurrencyInrPipe } from '../../shared/pipes/currency-inr.pipe';
import { HealthRingComponent } from '../../shared/components/health-ring/health-ring.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, CurrencyInrPipe, HealthRingComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit, OnDestroy {

  summary: ReportSummary | null = null;
  trends: TrendData[] = [];
  collectionChart: ChartDataPoint[] = [];
  healthScore = 0;
  isLoading = true;

  // Expose Math to template for SVG calculations
  Math = Math;

  private destroy$ = new Subject<void>();

  constructor(
    private reportService: ReportService,
    private stateService: StateService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadReports(): void {
    this.reportService.getFinancialSummary().pipe(
      takeUntil(this.destroy$)
    ).subscribe((summary) => {
      this.summary = summary;
      this.isLoading = false;
    });

    this.reportService.getMonthlyTrends().pipe(
      takeUntil(this.destroy$)
    ).subscribe((trends) => this.trends = trends);

    this.reportService.getCollectionRateChart().pipe(
      takeUntil(this.destroy$)
    ).subscribe((chart) => this.collectionChart = chart);

    this.reportService.healthScore$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((score) => this.healthScore = score);
  }

  /**
   * SVG Bar Chart — Returns Y position for bar.
   */
  getBarHeight(value: number, maxValue: number): number {
    if (maxValue === 0) return 0;
    return (value / maxValue) * 180;
  }

  getBarY(value: number, maxValue: number): number {
    return 200 - this.getBarHeight(value, maxValue);
  }

  getMaxTrendValue(): number {
    if (this.trends.length === 0) return 1;
    return Math.max(...this.trends.map((t) => Math.max(t.income, t.expenses)));
  }

  /**
   * SVG Line Chart — Generate path for line.
   */
  getLinePath(key: 'income' | 'expenses'): string {
    if (this.trends.length === 0) return '';
    const max = this.getMaxTrendValue();
    const width = 500;
    const height = 200;
    const stepX = width / Math.max(this.trends.length - 1, 1);

    return this.trends.map((t, i) => {
      const x = i * stepX;
      const y = height - (t[key] / max) * (height - 20);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  }

  trackByIndex(index: number): number {
    return index;
  }
}
