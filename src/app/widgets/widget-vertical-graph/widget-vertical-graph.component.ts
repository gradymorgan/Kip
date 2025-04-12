import { IDatasetServiceDatasetConfig } from './../../core/services/data-set.service';
import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, viewChild, inject } from '@angular/core';
import { BaseWidgetComponent } from '../../core/utils/base-widget.component';
import { WidgetHostComponent } from '../../core/components/widget-host/widget-host.component';
import { IWidgetSvcConfig } from '../../core/interfaces/widgets-interface';
import { DatasetService, IDatasetServiceDatapoint, IDatasetServiceDataSourceInfo } from '../../core/services/data-set.service';
import { Subscription } from 'rxjs';
import { Chart, ChartConfiguration, ChartData, ChartType } from 'chart.js';
import 'chartjs-adapter-date-fns';

interface IGraphColors {
    valueLine: string,
    valueFill: string,
    chartLabel: string,
    chartValue: string
}

interface IDataSetRow {
  x: number,
  y: number
}

@Component({
  selector: 'widget-vertical-graph',
  standalone: true,
  imports: [WidgetHostComponent],
  templateUrl: './widget-vertical-graph.component.html',
  styleUrl: './widget-vertical-graph.component.scss'
})
export class WidgetVerticalGraphComponent extends BaseWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  private dsService = inject(DatasetService);

  readonly widgetVerticalGraph = viewChild('widgetVerticalGraph', { read: ElementRef });

  public lineChartData: ChartData <'line', {x: number, y: number} []> = {
    datasets: []
  };
  public lineChartOptions: ChartConfiguration['options'] = {
    parsing: false,
    datasets: {
      line: {
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0.4,
      }
    },
    animations: {
      tension: {
        easing: "easeInOutCubic"
      }
    }
  }
  public lineChartType: ChartType = 'line';
  private chart;
  private dsServiceSub: Subscription = null;
  private datasetConfig: IDatasetServiceDatasetConfig = null;
  private dataSourceInfo: IDatasetServiceDataSourceInfo = null;

  constructor() {
    super();

    this.defaultConfig = {
      displayName: 'Vertical Graph',
      filterSelfPaths: true,
      convertUnitTo: "unitless",
      datasetUUID: null,
      numDecimal: 1,
      color: 'contrast',
    };
  }

  ngOnInit(): void {
    this.validateConfig();
  }

  ngAfterViewInit(): void {
    this.startWidget();
  }

  protected startWidget(): void {
    this.datasetConfig = this.dsService.getDatasetConfig(this.widgetProperties.config.datasetUUID);
    this.dataSourceInfo = this.dsService.getDataSourceInfo(this.widgetProperties.config.datasetUUID);

    if (this.datasetConfig) {
      this.setChartOptions();

      this.chart?.destroy();
      this.chart = new Chart(this.widgetVerticalGraph().nativeElement.getContext('2d'), {
        type: this.lineChartType,
        data: this.lineChartData,
        options: this.lineChartOptions
      });

      this.startStreaming();
    }
  }

  protected updateConfig(config: IWidgetSvcConfig): void {
    this.widgetProperties.config = config;
    this.startWidget();
  }

  private setChartOptions() {
    this.lineChartOptions.maintainAspectRatio = false;
    this.lineChartOptions.animation = false;

    this.lineChartData.datasets = [];
    this.lineChartData.datasets.push(
      {
        label: 'Value',
        data: [],
        parsing: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
        borderColor: this.getThemeColors().valueLine,
        borderWidth: 3,
        fill: true,
        backgroundColor: this.getThemeColors().valueFill,
      }
    );

    this.lineChartOptions.scales = {
      x: {
        type: "realtime",
        display: false,
        time: {
          unit: this.datasetConfig.timeScaleFormat,
          minUnit: "second",
          round: "second"
        },
        ticks: {
          display: false
        },
        grid: {
          display: false
        }
      },
      y: {
        display: false,
        grid: {
          display: false
        }
      }
    }

    this.lineChartOptions.plugins = {
      subtitle: {
        display: true,
        align: "start",
        padding: {
          top: -31,
          bottom: 4
        },
        text: `  ${this.widgetProperties.config.displayName}`,
        font: {
          size: 14,
        },
        color: this.getThemeColors().chartLabel
      },
      title: {
        display: true,
        align: "end",
        padding: {
          top: 6,
          bottom: 10
        },
        text: "",
        font: {
          size: 22,
        },
        color: this.getThemeColors().chartValue
      },
      legend: {
        display: false
      }
    }
  }

  private getThemeColors(): IGraphColors {
    const widgetColor = this.widgetProperties.config.color;
    const colors: IGraphColors = {
      valueLine: null,
      valueFill: null,
      chartLabel: null,
      chartValue: null
    };

    switch (widgetColor) {
      case "contrast":
        colors.valueLine = this.theme.contrast;
        colors.valueFill = this.theme.contrast;
        colors.chartValue = this.theme.contrast;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "blue":
        colors.valueLine = this.theme.blue;
        colors.valueFill = this.theme.blue;
        colors.chartValue = colors.valueFill;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "green":
        colors.valueLine = this.theme.green;
        colors.valueFill = this.theme.green;
        colors.chartValue = colors.valueFill;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "pink":
        colors.valueLine = this.theme.pink;
        colors.valueFill = this.theme.pink;
        colors.chartValue = colors.valueFill;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "orange":
        colors.valueLine = this.theme.orange;
        colors.valueFill = this.theme.orange;
        colors.chartValue = colors.valueFill;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "purple":
        colors.valueLine = this.theme.purple;
        colors.valueFill = this.theme.purple;
        colors.chartValue = colors.valueFill;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "grey":
        colors.valueLine = this.theme.grey;
        colors.valueFill = this.theme.grey;
        colors.chartValue = colors.valueFill;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "yellow":
        colors.valueLine = this.theme.yellow;
        colors.valueFill = this.theme.yellow;
        colors.chartValue = colors.valueFill;
        colors.chartLabel = this.theme.contrastDim;
        break;
    }
    return colors;
  }

  private getUnitsLabel(): string {
    let label: string = null;

    switch (this.widgetProperties.config.convertUnitTo) {
      case "percent":
      case "percentraw":
        label = "%";
        break;

      case "latitudeMin":
        label = "latitude in minutes";
        break;

      case "latitudeSec":
        label = "latitude in secondes";
        break;

      case "longitudeMin":
        label = "longitude in minutes";
        break;

      case "longitudeSec":
        label = "longitude in secondes";
        break;

      default:
        label = this.widgetProperties.config.convertUnitTo;
        break;
    }

    return label;
  }

  private startStreaming(): void {
    this.dsServiceSub?.unsubscribe();
    this.dsServiceSub = this.dsService.getDatasetObservable(this.widgetProperties.config.datasetUUID).subscribe(
      (dsPoint: IDatasetServiceDatapoint) => {
        const value = this.unitsService.convertToUnit(this.widgetProperties.config.convertUnitTo, dsPoint.data.value);
        this.chart.data.datasets[0].data.push(this.transformDatasetRow(dsPoint));
        
        // Update the current value display
        this.chart.options.plugins.title.text = `${value.toFixed(this.widgetProperties.config.numDecimal)} ${this.getUnitsLabel()}`;

        // Keep the chart centered on the current value
        if (this.chart.data.datasets[0].data.length > 1) {
          const currentValue = value;
          const lastValue = this.chart.data.datasets[0].data[this.chart.data.datasets[0].data.length - 2].y;
          const diff = currentValue - lastValue;
          
          // Shift all previous points to maintain centering
          this.chart.data.datasets[0].data.forEach((point, index) => {
            if (index < this.chart.data.datasets[0].data.length - 1) {
              point.y += diff;
            }
          });
        }

        this.chart?.update('quiet');
      }
    );
  }

  private transformDatasetRow(row: IDatasetServiceDatapoint): IDataSetRow {
    return {
      x: row.timestamp,
      y: this.unitsService.convertToUnit(this.widgetProperties.config.convertUnitTo, row.data.value)
    };
  }

  ngOnDestroy(): void {
    this.destroyDataStreams();
    this.dsServiceSub?.unsubscribe();
    this.chart?.destroy();
  }
} 