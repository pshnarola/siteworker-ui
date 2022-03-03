import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageReferencesSubcontractorComponent } from './manage-references-subcontractor.component';

describe('ManageReferencesSubcontractorComponent', () => {
  let component: ManageReferencesSubcontractorComponent;
  let fixture: ComponentFixture<ManageReferencesSubcontractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageReferencesSubcontractorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageReferencesSubcontractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
