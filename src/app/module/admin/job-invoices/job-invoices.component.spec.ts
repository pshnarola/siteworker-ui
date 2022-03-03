import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobInvoicesComponent } from './job-invoices.component';

describe('JobInvoicesComponent', () => {
  let component: JobInvoicesComponent;
  let fixture: ComponentFixture<JobInvoicesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobInvoicesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobInvoicesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
