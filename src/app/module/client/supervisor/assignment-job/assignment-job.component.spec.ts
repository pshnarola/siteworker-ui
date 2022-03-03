import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentJobComponent } from './assignment-job.component';

describe('AssignmentJobComponent', () => {
  let component: AssignmentJobComponent;
  let fixture: ComponentFixture<AssignmentJobComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignmentJobComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
