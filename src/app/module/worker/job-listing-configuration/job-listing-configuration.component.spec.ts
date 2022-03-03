import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobListingConfigurationComponent } from './job-listing-configuration.component';

describe('JobListingConfigurationComponent', () => {
  let component: JobListingConfigurationComponent;
  let fixture: ComponentFixture<JobListingConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobListingConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobListingConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
