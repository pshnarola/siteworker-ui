import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewViewAllRatingReviewsComponent } from './preview-view-all-rating-reviews.component';

describe('PreviewViewAllRatingReviewsComponent', () => {
  let component: PreviewViewAllRatingReviewsComponent;
  let fixture: ComponentFixture<PreviewViewAllRatingReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewViewAllRatingReviewsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewViewAllRatingReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
