import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageCertificatesWorkerComponent } from './manage-certificates-worker.component';

describe('ManageCertificatesWorkerComponent', () => {
  let component: ManageCertificatesWorkerComponent;
  let fixture: ComponentFixture<ManageCertificatesWorkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageCertificatesWorkerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCertificatesWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
