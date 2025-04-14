import { Injectable } from '@angular/core';
import { WidgetVerticalDataChartComponent } from '../widgets/widget-vertical-data-chart/widget-vertical-data-chart.component';

export interface Widget {
  id: string;
  name: string;
  description: string;
  component: any;
  defaultConfig: {
    path: string;
    units: string;
    min: number;
    max: number;
    color: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class WidgetService {
  private widgets: Widget[] = [
    {
      id: 'vertical-data-chart',
      name: 'Vertical Data Chart',
      description: 'A vertical chart widget for displaying data',
      component: WidgetVerticalDataChartComponent,
      defaultConfig: {
        path: '',
        units: '',
        min: 0,
        max: 100,
        color: '#000000'
      }
    }
  ];

  getWidgets(): Widget[] {
    return this.widgets;
  }

  getWidgetById(id: string): Widget | undefined {
    return this.widgets.find(widget => widget.id === id);
  }
} 