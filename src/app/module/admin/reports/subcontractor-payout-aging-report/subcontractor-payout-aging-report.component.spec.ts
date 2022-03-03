import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorPayoutAgingReportComponent } from './subcontractor-payout-aging-report.component';

describe('SubcontractorPayoutAgingReportComponent', () => {
  let component: SubcontractorPayoutAgingReportComponent;
  let fixture: ComponentFixture<SubcontractorPayoutAgingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorPayoutAgingReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorPayoutAgingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
