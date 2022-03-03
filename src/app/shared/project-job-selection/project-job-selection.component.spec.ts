import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectJobSelectionComponent } from './project-job-selection.component';

describe('ProjectJobSelectionComponent', () => {
  let component: ProjectJobSelectionComponent;
  let fixture: ComponentFixture<ProjectJobSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectJobSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectJobSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
