import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorProjectListFilterComponent } from './subcontractor-project-list-filter.component';

describe('SubcontractorProjectListFilterComponent', () => {
  let component: SubcontractorProjectListFilterComponent;
  let fixture: ComponentFixture<SubcontractorProjectListFilterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorProjectListFilterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorProjectListFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
