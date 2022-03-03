import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectChangeRequestComponent } from './project-change-request.component';

describe('ProjectChangeRequestComponent', () => {
  let component: ProjectChangeRequestComponent;
  let fixture: ComponentFixture<ProjectChangeRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectChangeRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectChangeRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
