import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobSetMarginComponent } from './job-set-margin.component';

describe('JobSetMarginComponent', () => {
  let component: JobSetMarginComponent;
  let fixture: ComponentFixture<JobSetMarginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobSetMarginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobSetMarginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
