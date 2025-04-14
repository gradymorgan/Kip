import { IDatasetServiceDatasetConfig } from './../../core/services/data-set.service';
import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, viewChild, inject } from '@angular/core';
import { BaseWidgetComponent } from '../../core/utils/base-widget.component';
import { WidgetHostComponent } from '../../core/components/widget-host/widget-host.component';
import { IWidgetSvcConfig } from '../../core/interfaces/widgets-interface';
import { DatasetService, IDatasetServiceDatapoint, IDatasetServiceDataSourceInfo } from '../../core/services/data-set.service';
import { Subscription } from 'rxjs';
import { Chart, ChartConfiguration, ChartData, ChartType, TimeUnit } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import 'chartjs-adapter-date-fns';
import ChartStreaming from '@robloche/chartjs-plugin-streaming';

interface IChartColors {
    valueLine: string,
    valueFill: string,
    averageLine: string,
    averageFill: string,
    averageChartLine: string,
    chartLabel: string,
    chartValue: string
}

interface IDataSetRow {
  x: number,
  y: number
}

@Component({
  selector: 'widget-vertical-data-chart',
  standalone: true,
  imports: [WidgetHostComponent],
  templateUrl: './widget-vertical-data-chart.component.html',
  styleUrl: './widget-vertical-data-chart.component.scss'
})
export class WidgetVerticalDataChartComponent extends BaseWidgetComponent implements OnInit, AfterViewInit, OnDestroy {
  private dsService = inject(DatasetService);

  readonly widgetVerticalDataChart = viewChild('widgetVerticalDataChart', { read: ElementRef });

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
  protected config: IWidgetSvcConfig & { units?: string };
  protected id: string;

  constructor() {
    super();

    this.defaultConfig = {
      displayName: 'Vertical Data Chart',
      filterSelfPaths: true,
      convertUnitTo: "unitless",
      datasetUUID: null,
      invertData: false,
      datasetAverageArray: 'sma',
      showAverageData: true,
      trackAgainstAverage: false,
      showDatasetMinimumValueLine: false,
      showDatasetMaximumValueLine: false,
      showDatasetAverageValueLine: true,
      showDatasetAngleAverageValueLine: false,
      showLabel: false,
      showTimeScale: false,
      startScaleAtZero: false,
      verticalGraph: true,
      showYScale: false,
      yScaleSuggestedMin: null,
      yScaleSuggestedMax: null,
      enableMinMaxScaleLimit: false,
      yScaleMin: null,
      yScaleMax: null,
      numDecimal: 1,
      color: 'contrast',
    };
  }

  ngOnInit(): void {
    this.startWidget();
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
      Chart.register(annotationPlugin, ChartStreaming);
      this.chart = new Chart(this.widgetVerticalDataChart().nativeElement.getContext('2d'), {
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
        order: this.widgetProperties.config.trackAgainstAverage ? 1 : 0,
        parsing: false,
        tension: 0,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
        borderColor: this.getThemeColors().valueLine,
        borderWidth: this.widgetProperties.config.trackAgainstAverage ? 0 : 3,
        fill: this.widgetProperties.config.trackAgainstAverage ? true : false,
        backgroundColor: this.getThemeColors().valueFill,
      }
    );

    this.lineChartData.datasets.push(
      {
        label: 'Average',
        data: [],
        order: this.widgetProperties.config.trackAgainstAverage ? 0 : 1,
        parsing: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
        pointHitRadius: 0,
        borderColor: this.getThemeColors().averageLine,
        borderWidth: this.widgetProperties.config.trackAgainstAverage ? 3 : 0,
        fill: this.widgetProperties.config.trackAgainstAverage ? false : true,
        backgroundColor: this.getThemeColors().averageFill,
      }
    );

    this.lineChartOptions.scales = {
      x: {
        type: "realtime",
        display: false,
        time: {
          unit: this.datasetConfig.timeScaleFormat as TimeUnit,
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
      annotation: {
        annotations: {
          minimumLine: {
            type: 'line',
            scaleID: 'y',
            display: this.widgetProperties.config.showDatasetMinimumValueLine,
            value: null,
            drawTime: 'afterDatasetsDraw',
            label: {
              display: true,
              position: "start",
              yAdjust: 12,
              padding: 4,
              color: this.getThemeColors().averageChartLine,
              backgroundColor: 'rgba(63,63,63,0.0)'
            }
          },
          maximumLine: {
            type: 'line',
            scaleID: 'y',
            display: this.widgetProperties.config.showDatasetMaximumValueLine,
            value: null,
            drawTime: 'afterDatasetsDraw',
            label: {
              display: true,
              position: "start",
              yAdjust: -12,
              padding: 4,
              color: this.getThemeColors().averageChartLine,
              backgroundColor: 'rgba(63,63,63,0.0)'
            }
          },
          averageLine: {
            type: 'line',
            scaleID: 'y',
            display: this.widgetProperties.config.showDatasetAverageValueLine,
            value: null,
            borderDash: [6, 6],
            borderColor: this.getThemeColors().averageChartLine,
            drawTime: 'afterDatasetsDraw',
            label: {
              display: true,
              position: "start",
              padding: 4,
              color: this.getThemeColors().chartValue,
              backgroundColor: 'rgba(63,63,63,0.7)'
            }
          }
        }
      },
      legend: {
        display: false
      },
      streaming: {
        duration: this.dataSourceInfo.maxDataPoints * this.dataSourceInfo.sampleTime,
        delay: this.dataSourceInfo.sampleTime,
        frameRate: this.datasetConfig.timeScaleFormat === "hour" ? 8 : this.datasetConfig.timeScaleFormat === "minute" ? 15 : 30,
      }
    }

    // Add background color to the chart
    this.lineChartOptions.backgroundColor = this.theme.background;
  }

  private getThemeColors(): IChartColors {
    const widgetColor = this.widgetProperties.config.color;
    const colors: IChartColors = {
      valueLine: null,
      valueFill: null,
      averageLine: null,
      averageFill: null,
      averageChartLine: null,
      chartLabel: null,
      chartValue: null
    };

    switch (widgetColor) {
      case "contrast":
        if (this.widgetProperties.config.trackAgainstAverage) {
          colors.valueLine = this.theme.contrastDimmer;
          colors.valueFill = this.theme.contrastDimmer;
          colors.averageLine = this.theme.contrast;
          colors.averageFill = this.theme.contrast;
          colors.chartValue = colors.averageLine;
        } else {
          colors.valueLine = this.theme.contrast;
          colors.valueFill = this.theme.contrast;
          colors.averageLine = this.theme.contrastDimmer;
          colors.averageFill = this.theme.contrastDimmer;
          colors.chartValue = this.theme.contrast;
        }
        colors.averageChartLine = this.theme.contrastDim;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "blue":
        if (this.widgetProperties.config.trackAgainstAverage) {
          colors.valueLine = this.theme.blueDimmer;
          colors.valueFill = this.theme.blueDimmer;
          colors.averageLine = this.theme.blue;
          colors.averageFill = this.theme.blue;
          colors.chartValue = colors.averageLine;
        } else {
          colors.valueLine = this.theme.blue;
          colors.valueFill = this.theme.blue;
          colors.averageLine = this.theme.blueDimmer;
          colors.averageFill = this.theme.blueDimmer;
          colors.chartValue = colors.valueFill;
        }
        colors.averageChartLine = this.theme.blueDim;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "green":
        if (this.widgetProperties.config.trackAgainstAverage) {
          colors.valueLine = this.theme.greenDimmer;
          colors.valueFill = this.theme.greenDimmer;
          colors.averageLine = this.theme.green;
          colors.averageFill = this.theme.green;
          colors.chartValue = colors.averageLine;
        } else {
          colors.valueLine = this.theme.green;
          colors.valueFill = this.theme.green;
          colors.averageLine = this.theme.greenDimmer;
          colors.averageFill = this.theme.greenDimmer;
          colors.chartValue = colors.valueFill;
        }
        colors.averageChartLine = this.theme.greenDim;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "pink":
        if (this.widgetProperties.config.trackAgainstAverage) {
          colors.valueLine = this.theme.pinkDimmer;
          colors.valueFill = this.theme.pinkDimmer;
          colors.averageLine = this.theme.pink;
          colors.averageFill = this.theme.pink;
          colors.chartValue = colors.averageLine;
        } else {
          colors.valueLine = this.theme.pink;
          colors.valueFill = this.theme.pink;
          colors.averageLine = this.theme.pinkDimmer;
          colors.averageFill = this.theme.pinkDimmer;
          colors.chartValue = colors.valueFill;
        }
        colors.averageChartLine = this.theme.pinkDim;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "orange":
        if (this.widgetProperties.config.trackAgainstAverage) {
          colors.valueLine = this.theme.orangeDimmer;
          colors.valueFill = this.theme.orangeDimmer;
          colors.averageLine = this.theme.orange;
          colors.averageFill = this.theme.orange;
          colors.chartValue = colors.averageLine;
        } else {
          colors.valueLine = this.theme.orange;
          colors.valueFill = this.theme.orange;
          colors.averageLine = this.theme.orangeDimmer;
          colors.averageFill = this.theme.orangeDimmer;
          colors.chartValue = colors.valueFill;
        }
        colors.averageChartLine = this.theme.orangeDim;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "purple":
        if (this.widgetProperties.config.trackAgainstAverage) {
          colors.valueLine = this.theme.purpleDimmer;
          colors.valueFill = this.theme.purpleDimmer;
          colors.averageLine = this.theme.purple;
          colors.averageFill = this.theme.purple;
          colors.chartValue = colors.averageLine;
        } else {
          colors.valueLine = this.theme.purple;
          colors.valueFill = this.theme.purple;
          colors.averageLine = this.theme.purpleDimmer;
          colors.averageFill = this.theme.purpleDimmer;
          colors.chartValue = colors.valueFill;
        }
        colors.averageChartLine = this.theme.purpleDim;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "grey":
        if (this.widgetProperties.config.trackAgainstAverage) {
          colors.valueLine = this.theme.greyDimmer;
          colors.valueFill = this.theme.greyDimmer;
          colors.averageLine = this.theme.grey;
          colors.averageFill = this.theme.grey;
          colors.chartValue = colors.averageLine;
        } else {
          colors.valueLine = this.theme.grey;
          colors.valueFill = this.theme.grey;
          colors.averageLine = this.theme.greyDimmer;
          colors.averageFill = this.theme.greyDimmer;
          colors.chartValue = colors.valueFill;
        }
        colors.averageChartLine = this.theme.greyDim;
        colors.chartLabel = this.theme.contrastDim;
        break;

      case "yellow":
        if (this.widgetProperties.config.trackAgainstAverage) {
          colors.valueLine = this.theme.yellowDimmer;
          colors.valueFill = this.theme.yellowDimmer;
          colors.averageLine = this.theme.yellow;
          colors.averageFill = this.theme.yellow;
          colors.chartValue = colors.averageLine;
        } else {
          colors.valueLine = this.theme.yellow;
          colors.valueFill = this.theme.yellow;
          colors.averageLine = this.theme.yellowDimmer;
          colors.averageFill = this.theme.yellowDimmer;
          colors.chartValue = colors.valueFill;
        }
        colors.averageChartLine = this.theme.yellowDim;
        colors.chartLabel = this.theme.contrastDim;
        break;
    }
    return colors;
  }

  private startStreaming(): void {
    this.dsServiceSub?.unsubscribe();
    this.dsServiceSub = this.dsService.getDatasetObservable(this.widgetProperties.config.datasetUUID).subscribe(
      (dsPoint: IDatasetServiceDatapoint) => {
        this.chart.data.datasets[0].data.push(this.transformDatasetRow(dsPoint, 0));
        // Average dataset
        if (this.widgetProperties.config.showAverageData) {
          this.chart.data.datasets[1].data.push(this.transformDatasetRow(dsPoint, this.widgetProperties.config.datasetAverageArray));
        }

        let trackValue: number = this.widgetProperties.config.trackAgainstAverage ? dsPoint.data.sma : dsPoint.data.value;
        this.chart.options.plugins.title.text = `${this.unitsService.convertToUnit(this.widgetProperties.config.convertUnitTo, trackValue).toFixed(this.widgetProperties.config.numDecimal)} ${this.getUnitsLabel()} `;

        const lastAverage = this.unitsService.convertToUnit(this.widgetProperties.config.convertUnitTo, dsPoint.data.lastAverage);
        const lastMinimum = this.unitsService.convertToUnit(this.widgetProperties.config.convertUnitTo, dsPoint.data.lastMinimum);
        const lastMaximum = this.unitsService.convertToUnit(this.widgetProperties.config.convertUnitTo, dsPoint.data.lastMaximum);

        if (this.chart.options.plugins.annotation.annotations.averageLine.value != lastAverage) {
          this.chart.options.plugins.annotation.annotations.averageLine.value = lastAverage;
          this.chart.options.plugins.annotation.annotations.averageLine.label.content = `${lastAverage.toFixed(this.widgetProperties.config.numDecimal)}`;
        }
        if (this.chart.options.plugins.annotation.annotations.minimumLine.value != lastMinimum) {
          this.chart.options.plugins.annotation.annotations.minimumLine.value = lastMinimum;
          this.chart.options.plugins.annotation.annotations.minimumLine.label.content = `${lastMinimum.toFixed(this.widgetProperties.config.numDecimal)}`;
        }
        if (this.chart.options.plugins.annotation.annotations.maximumLine.value != lastMaximum) {
          this.chart.options.plugins.annotation.annotations.maximumLine.value = lastMaximum;
          this.chart.options.plugins.annotation.annotations.maximumLine.label.content = `${lastMaximum.toFixed(this.widgetProperties.config.numDecimal)}`;
        }

        this.chart?.update('quiet');
      }
    );
  }

  private transformDatasetRow(row: IDatasetServiceDatapoint, datasetType): IDataSetRow {
    return {
      x: row.timestamp,
      y: row.data.value
    };
  }

  protected getUnitsLabel(): string {
    return (this.config as any)?.units || '';
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.dsServiceSub) {
      this.dsServiceSub.unsubscribe();
    }
  }
} 