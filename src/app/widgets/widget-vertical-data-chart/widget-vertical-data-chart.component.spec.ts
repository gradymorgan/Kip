import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WidgetVerticalDataChartComponent } from './widget-vertical-data-chart.component';

describe('WidgetVerticalDataChartComponent', () => {
  let component: WidgetVerticalDataChartComponent;
  let fixture: ComponentFixture<WidgetVerticalDataChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetVerticalDataChartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WidgetVerticalDataChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 