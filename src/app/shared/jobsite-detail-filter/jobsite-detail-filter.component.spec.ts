import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsiteDetailFilterComponent } from './jobsite-detail-filter.component';

describe('JobsiteDetailFilterComponent', () => {
  let component: JobsiteDetailFilterComponent;
  let fixture: ComponentFixture<JobsiteDetailFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsiteDetailFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsiteDetailFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
