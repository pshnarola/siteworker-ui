import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBidingComparisonComponent } from './project-biding-comparison.component';

describe('ProjectBidingComparisonComponent', () => {
  let component: ProjectBidingComparisonComponent;
  let fixture: ComponentFixture<ProjectBidingComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectBidingComparisonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBidingComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
