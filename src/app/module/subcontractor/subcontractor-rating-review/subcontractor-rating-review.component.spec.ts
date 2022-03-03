
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorRatingReviewComponent } from './subcontractor-rating-review.component';

describe('SubcontractorRatingReviewComponent', () => {
  let component: SubcontractorRatingReviewComponent;
  let fixture: ComponentFixture<SubcontractorRatingReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorRatingReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorRatingReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
