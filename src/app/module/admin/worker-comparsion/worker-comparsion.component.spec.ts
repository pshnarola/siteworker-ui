import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerComparsionComponent } from './worker-comparsion.component';

describe('WorkerComparsionComponent', () => {
  let component: WorkerComparsionComponent;
  let fixture: ComponentFixture<WorkerComparsionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerComparsionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerComparsionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
