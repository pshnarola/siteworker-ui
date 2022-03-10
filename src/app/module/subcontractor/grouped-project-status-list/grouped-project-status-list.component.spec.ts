import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupedProjectStatusListComponent } from './grouped-project-status-list.component';

describe('GroupedProjectStatusListComponent', () => {
  let component: GroupedProjectStatusListComponent;
  let fixture: ComponentFixture<GroupedProjectStatusListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GroupedProjectStatusListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupedProjectStatusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
