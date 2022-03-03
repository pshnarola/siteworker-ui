import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingAndReviewComponent } from './rating-and-review.component';

describe('RatingAndReviewComponent', () => {
  let component: RatingAndReviewComponent;
  let fixture: ComponentFixture<RatingAndReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RatingAndReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RatingAndReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
