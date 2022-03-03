import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenceCommentComponent } from './reference-comment.component';

describe('ReferenceCommentComponent', () => {
  let component: ReferenceCommentComponent;
  let fixture: ComponentFixture<ReferenceCommentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReferenceCommentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferenceCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
