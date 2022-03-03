import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectSetMarginComponent } from './project-set-margin.component';

describe('ProjectSetMarginComponent', () => {
  let component: ProjectSetMarginComponent;
  let fixture: ComponentFixture<ProjectSetMarginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectSetMarginComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectSetMarginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
