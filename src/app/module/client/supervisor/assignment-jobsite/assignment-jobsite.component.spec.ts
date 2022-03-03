import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentJobtitleComponent } from './assignment-jobsite.component';

describe('AssignmentJobtitleComponent', () => {
  let component: AssignmentJobtitleComponent;
  let fixture: ComponentFixture<AssignmentJobtitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentJobtitleComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentJobtitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
