import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerJobDetailsComponent } from './worker-job-details.component';

describe('WorkerJobDetailsComponent', () => {
  let component: WorkerJobDetailsComponent;
  let fixture: ComponentFixture<WorkerJobDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerJobDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerJobDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
