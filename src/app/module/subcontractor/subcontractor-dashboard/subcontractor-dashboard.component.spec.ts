import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorDashboardComponent } from './subcontractor-dashboard.component';

describe('SubcontractorDashboardComponent', () => {
  let component: SubcontractorDashboardComponent;
  let fixture: ComponentFixture<SubcontractorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorDashboardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
