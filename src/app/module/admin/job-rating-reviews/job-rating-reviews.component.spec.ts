import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobRatingReviewsComponent } from './job-rating-reviews.component';

describe('JobRatingReviewsComponent', () => {
  let component: JobRatingReviewsComponent;
  let fixture: ComponentFixture<JobRatingReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobRatingReviewsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobRatingReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
