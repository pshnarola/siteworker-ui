import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPaymentAgingReportComponent } from './client-payment-aging-report.component';

describe('ClientPaymentAgingReportComponent', () => {
  let component: ClientPaymentAgingReportComponent;
  let fixture: ComponentFixture<ClientPaymentAgingReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientPaymentAgingReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPaymentAgingReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
