import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectRatingReviewComponent } from './project-rating-review.component';

describe('ProjectRatingReviewComponent', () => {
  let component: ProjectRatingReviewComponent;
  let fixture: ComponentFixture<ProjectRatingReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectRatingReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectRatingReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
