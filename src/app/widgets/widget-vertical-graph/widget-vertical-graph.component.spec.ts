import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WidgetVerticalGraphComponent } from './widget-vertical-graph.component';

describe('WidgetVerticalGraphComponent', () => {
  let component: WidgetVerticalGraphComponent;
  let fixture: ComponentFixture<WidgetVerticalGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WidgetVerticalGraphComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(WidgetVerticalGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
}); 