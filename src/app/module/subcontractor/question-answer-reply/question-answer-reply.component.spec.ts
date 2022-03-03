import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionAnswerReplyComponent } from './question-answer-reply.component';

describe('QuestionAnswerReplyComponent', () => {
  let component: QuestionAnswerReplyComponent;
  let fixture: ComponentFixture<QuestionAnswerReplyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionAnswerReplyComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionAnswerReplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
