import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectJobsiteComponent } from './select-jobsite.component';

describe('SelectJobsiteComponent', () => {
  let component: SelectJobsiteComponent;
  let fixture: ComponentFixture<SelectJobsiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectJobsiteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectJobsiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
