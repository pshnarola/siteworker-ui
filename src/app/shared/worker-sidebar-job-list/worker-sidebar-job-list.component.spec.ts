import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerSidebarJobListComponent } from './worker-sidebar-job-list.component';

describe('WorkerSidebarJobListComponent', () => {
  let component: WorkerSidebarJobListComponent;
  let fixture: ComponentFixture<WorkerSidebarJobListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkerSidebarJobListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkerSidebarJobListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
