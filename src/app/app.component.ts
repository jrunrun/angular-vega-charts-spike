import { Component } from '@angular/core';
import { PulseMetricChartComponent } from './pulse-metric-chart/pulse-metric-chart.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PulseMetricChartComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Angular Vega Charts Spike';
}

