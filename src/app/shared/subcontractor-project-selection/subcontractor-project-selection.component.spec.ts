import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorProjectSelectionComponent } from './subcontractor-project-selection.component';

describe('SubcontractorProjectSelectionComponent', () => {
  let component: SubcontractorProjectSelectionComponent;
  let fixture: ComponentFixture<SubcontractorProjectSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorProjectSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorProjectSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
