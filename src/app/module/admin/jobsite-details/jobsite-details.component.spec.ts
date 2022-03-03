import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsiteDetailsComponent } from './jobsite-details.component';

describe('JobsiteDetailsComponent', () => {
  let component: JobsiteDetailsComponent;
  let fixture: ComponentFixture<JobsiteDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsiteDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsiteDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
