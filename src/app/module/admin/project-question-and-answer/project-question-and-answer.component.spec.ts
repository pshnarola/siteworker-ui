import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectQuestionAndAnswerComponent } from './project-question-and-answer.component';

describe('ProjectQuestionAndAnswerComponent', () => {
  let component: ProjectQuestionAndAnswerComponent;
  let fixture: ComponentFixture<ProjectQuestionAndAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectQuestionAndAnswerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectQuestionAndAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
