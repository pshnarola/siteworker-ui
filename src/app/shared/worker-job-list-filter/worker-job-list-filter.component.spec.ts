import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerJobListFilterComponent } from './worker-job-list-filter.component';

describe('WorkerJobListFilterComponent', () => {
  let component: WorkerJobListFilterComponent;
  let fixture: ComponentFixture<WorkerJobListFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerJobListFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerJobListFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
