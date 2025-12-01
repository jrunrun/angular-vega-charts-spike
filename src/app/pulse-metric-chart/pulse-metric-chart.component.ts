import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { VegaChartComponent } from '../vega-chart/vega-chart.component';
import { compileToSvg, downloadSvgFile } from '../utils/vega-utils';
import { VisualizationSpec } from 'vega-embed';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pulse-metric-chart',
  standalone: true,
  imports: [VegaChartComponent, CommonModule],
  templateUrl: './pulse-metric-chart.component.html',
  styleUrls: ['./pulse-metric-chart.component.scss']
})
export class PulseMetricChartComponent implements OnInit {
  spec: VisualizationSpec | any = null;
  loading = true;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadSpec();
  }

  private loadSpec(): void {
    this.http.get<VisualizationSpec | any>('assets/specs/pulse-metric.json')
      .subscribe({
        next: (data) => {
          this.spec = data;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading pulse metric spec:', err);
          this.error = 'Failed to load chart specification';
          this.loading = false;
        }
      });
  }

  async downloadSvg(): Promise<void> {
    if (!this.spec) {
      console.warn('No spec available to download');
      return;
    }

    try {
      const svgString = await compileToSvg(this.spec);
      downloadSvgFile(svgString, 'pulse-metric-chart.svg');
    } catch (error) {
      console.error('Error generating SVG for download:', error);
      alert('Failed to generate SVG. Check console for details.');
    }
  }
}

