import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorInvoiceComponent } from './subcontractor-invoice.component';

describe('SubcontractorInvoiceComponent', () => {
  let component: SubcontractorInvoiceComponent;
  let fixture: ComponentFixture<SubcontractorInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
