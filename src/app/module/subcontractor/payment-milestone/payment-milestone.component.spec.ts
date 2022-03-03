import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentMilestoneComponent } from './payment-milestone.component';

describe('PaymentMilestoneComponent', () => {
  let component: PaymentMilestoneComponent;
  let fixture: ComponentFixture<PaymentMilestoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PaymentMilestoneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentMilestoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
