import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerComparisonComponent } from './worker-comparison.component';

describe('WorkerComparisonComponent', () => {
  let component: WorkerComparisonComponent;
  let fixture: ComponentFixture<WorkerComparisonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerComparisonComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerComparisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
