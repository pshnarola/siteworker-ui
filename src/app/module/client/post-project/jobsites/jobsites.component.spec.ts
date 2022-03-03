import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsitesComponent } from './jobsites.component';

describe('JobsitesComponent', () => {
  let component: JobsitesComponent;
  let fixture: ComponentFixture<JobsitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsitesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
