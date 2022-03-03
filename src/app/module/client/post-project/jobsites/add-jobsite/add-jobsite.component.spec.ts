import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddJobsiteComponent } from './add-jobsite.component';

describe('AddJobsiteComponent', () => {
  let component: AddJobsiteComponent;
  let fixture: ComponentFixture<AddJobsiteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddJobsiteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddJobsiteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
