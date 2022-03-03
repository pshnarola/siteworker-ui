import { ComponentFixture, TestBed } from '@angular/core/testing';

import { W2WorkerInvoiceReportComponent } from './w2-worker-invoice-report.component';

describe('W2WorkerInvoiceReportComponent', () => {
  let component: W2WorkerInvoiceReportComponent;
  let fixture: ComponentFixture<W2WorkerInvoiceReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ W2WorkerInvoiceReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(W2WorkerInvoiceReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
