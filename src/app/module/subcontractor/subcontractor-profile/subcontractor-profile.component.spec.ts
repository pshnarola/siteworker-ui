import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorProfileComponent } from './subcontractor-profile.component';

describe('SubcontractorProfileComponent', () => {
  let component: SubcontractorProfileComponent;
  let fixture: ComponentFixture<SubcontractorProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
