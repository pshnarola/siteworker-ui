import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobInvoiceComponent } from './job-invoice.component';

describe('JobInvoiceComponent', () => {
  let component: JobInvoiceComponent;
  let fixture: ComponentFixture<JobInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
