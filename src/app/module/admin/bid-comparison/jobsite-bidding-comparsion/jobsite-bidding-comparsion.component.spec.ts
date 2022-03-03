import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobsiteBiddingComparsionComponent } from './jobsite-bidding-comparsion.component';

describe('JobsiteBiddingComparsionComponent', () => {
  let component: JobsiteBiddingComparsionComponent;
  let fixture: ComponentFixture<JobsiteBiddingComparsionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobsiteBiddingComparsionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JobsiteBiddingComparsionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
