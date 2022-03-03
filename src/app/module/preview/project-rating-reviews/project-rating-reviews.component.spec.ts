import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRatingReviewsComponent } from './project-rating-reviews.component';

describe('ProjectRatingReviewsComponent', () => {
  let component: ProjectRatingReviewsComponent;
  let fixture: ComponentFixture<ProjectRatingReviewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectRatingReviewsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectRatingReviewsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
