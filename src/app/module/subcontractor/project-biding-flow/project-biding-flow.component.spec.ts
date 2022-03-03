import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectBidingFlowComponent } from './project-biding-flow.component';

describe('ProjectBidingFlowComponent', () => {
  let component: ProjectBidingFlowComponent;
  let fixture: ComponentFixture<ProjectBidingFlowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectBidingFlowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectBidingFlowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
