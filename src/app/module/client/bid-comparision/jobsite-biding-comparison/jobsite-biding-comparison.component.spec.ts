import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsiteBidingComparisonComponent } from './jobsite-biding-comparison.component';

describe('JobsiteBidingComparisonComponent', () => {
  let component: JobsiteBidingComparisonComponent;
  let fixture: ComponentFixture<JobsiteBidingComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsiteBidingComparisonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsiteBidingComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
