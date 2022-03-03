import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorInvoiceReportComponent } from './subcontractor-invoice-report.component';

describe('SubcontractorInvoiceReportComponent', () => {
  let component: SubcontractorInvoiceReportComponent;
  let fixture: ComponentFixture<SubcontractorInvoiceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorInvoiceReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorInvoiceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
