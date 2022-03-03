import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsiteDetailComponent } from './jobsite-detail.component';

describe('JobsiteDetailComponent', () => {
  let component: JobsiteDetailComponent;
  let fixture: ComponentFixture<JobsiteDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsiteDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsiteDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
