import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobRateCardComponent } from './job-rate-card.component';

describe('JobRateCardComponent', () => {
  let component: JobRateCardComponent;
  let fixture: ComponentFixture<JobRateCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobRateCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobRateCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
