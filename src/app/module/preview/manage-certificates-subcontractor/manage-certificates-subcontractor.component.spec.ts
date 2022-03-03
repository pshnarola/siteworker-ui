import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCertificatesSubcontractorComponent } from './manage-certificates-subcontractor.component';

describe('ManageCertificatesSubcontractorComponent', () => {
  let component: ManageCertificatesSubcontractorComponent;
  let fixture: ComponentFixture<ManageCertificatesSubcontractorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCertificatesSubcontractorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCertificatesSubcontractorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
