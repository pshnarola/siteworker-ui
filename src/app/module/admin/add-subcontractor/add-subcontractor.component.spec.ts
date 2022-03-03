import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSubcontractorComponent } from './add-subcontractor.component';

describe('AddSubcontractorComponent', () => {
  let component: AddSubcontractorComponent;
  let fixture: ComponentFixture<AddSubcontractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddSubcontractorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSubcontractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
