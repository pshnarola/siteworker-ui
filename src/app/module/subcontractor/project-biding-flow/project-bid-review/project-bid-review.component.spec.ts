import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBidReviewComponent } from './project-bid-review.component';

describe('ProjectBidReviewComponent', () => {
  let component: ProjectBidReviewComponent;
  let fixture: ComponentFixture<ProjectBidReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectBidReviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBidReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
