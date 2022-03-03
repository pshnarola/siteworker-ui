import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTimesheetDetailsComponent } from './view-timesheet-details.component';

describe('ViewTimesheetDetailsComponent', () => {
  let component: ViewTimesheetDetailsComponent;
  let fixture: ComponentFixture<ViewTimesheetDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewTimesheetDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewTimesheetDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
