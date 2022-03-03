import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorSelectionComponent } from './subcontractor-selection.component';

describe('SubcontractorSelectionComponent', () => {
  let component: SubcontractorSelectionComponent;
  let fixture: ComponentFixture<SubcontractorSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorSelectionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
