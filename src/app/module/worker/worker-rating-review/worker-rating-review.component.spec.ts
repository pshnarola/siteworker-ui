import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerRatingReviewComponent } from './worker-rating-review.component';

describe('WorkerRatingReviewComponent', () => {
  let component: WorkerRatingReviewComponent;
  let fixture: ComponentFixture<WorkerRatingReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerRatingReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerRatingReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
