import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorSignupComponent } from './subcontractor-signup.component';

describe('SubcontractorSignupComponent', () => {
  let component: SubcontractorSignupComponent;
  let fixture: ComponentFixture<SubcontractorSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorSignupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
