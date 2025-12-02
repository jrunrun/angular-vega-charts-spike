import { Component, Input, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import embed, { EmbedOptions, VisualizationSpec, Result } from 'vega-embed';
import { applyFormatConfig } from '../utils/vega-utils';
import * as vega from 'vega';

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
      // Clone spec to avoid side effects and apply custom formatting
      const spec = JSON.parse(JSON.stringify(this.spec));
      applyFormatConfig(spec);

      // Use 'any' to allow passing the 'vega' property which might not be in the EmbedOptions type definition
      const defaultOptions: any = {
        renderer: 'svg',
        actions: false,
        vega, // Pass the vega instance where custom formatters are registered
        tooltip: {
          theme: 'custom',
          sanitize: (value: any) => value
        }
      };

      const mergedOptions: EmbedOptions = {
        ...defaultOptions,
        ...this.options
      };

      this.embedResult = await embed(
        this.chartContainer.nativeElement,
        spec,
        mergedOptions
      );
    } catch (error) {
      console.error('VegaChartComponent: Error rendering chart', error);
    }
  }
}
