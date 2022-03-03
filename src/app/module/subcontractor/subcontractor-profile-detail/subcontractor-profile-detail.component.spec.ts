import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcontractorProfileDetailComponent } from './subcontractor-profile-detail.component';

describe('SubcontractorProfileDetailComponent', () => {
  let component: SubcontractorProfileDetailComponent;
  let fixture: ComponentFixture<SubcontractorProfileDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubcontractorProfileDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubcontractorProfileDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
