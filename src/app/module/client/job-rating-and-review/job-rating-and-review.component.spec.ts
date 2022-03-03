import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobRatingAndReviewComponent } from './job-rating-and-review.component';

describe('JobRatingAndReviewComponent', () => {
  let component: JobRatingAndReviewComponent;
  let fixture: ComponentFixture<JobRatingAndReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobRatingAndReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobRatingAndReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
