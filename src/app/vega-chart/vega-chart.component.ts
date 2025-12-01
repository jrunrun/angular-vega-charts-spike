import { Component, Input, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import embed, { EmbedOptions, VisualizationSpec, Result } from 'vega-embed';

@Component({
  selector: 'app-vega-chart',
  standalone: true,
  templateUrl: './vega-chart.component.html',
  styleUrls: ['./vega-chart.component.scss']
})
export class VegaChartComponent implements AfterViewInit, OnDestroy {
  @Input() spec!: VisualizationSpec | any;
  @Input() options?: EmbedOptions;

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef<HTMLDivElement>;

  private embedResult: Result | null = null;

  ngAfterViewInit(): void {
    if (!this.spec) {
      console.warn('VegaChartComponent: No spec provided');
      return;
    }

    this.renderChart();
  }

  ngOnDestroy(): void {
    if (this.embedResult?.view) {
      this.embedResult.view.finalize();
      this.embedResult = null;
    }
  }

  private async renderChart(): Promise<void> {
    try {
      const defaultOptions: EmbedOptions = {
        renderer: 'svg',
        actions: false
      };

      const mergedOptions: EmbedOptions = {
        ...defaultOptions,
        ...this.options
      };

      this.embedResult = await embed(
        this.chartContainer.nativeElement,
        this.spec,
        mergedOptions
      );
    } catch (error) {
      console.error('VegaChartComponent: Error rendering chart', error);
    }
  }
}

