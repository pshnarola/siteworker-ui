import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkExpAndEducationComponent } from './work-exp-and-education.component';

describe('WorkExpAndEducationComponent', () => {
  let component: WorkExpAndEducationComponent;
  let fixture: ComponentFixture<WorkExpAndEducationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkExpAndEducationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkExpAndEducationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
