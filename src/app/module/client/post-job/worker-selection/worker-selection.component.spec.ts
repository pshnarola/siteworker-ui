import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerSelectionComponent } from './worker-selection.component';

describe('WorkerSelectionComponent', () => {
  let component: WorkerSelectionComponent;
  let fixture: ComponentFixture<WorkerSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
