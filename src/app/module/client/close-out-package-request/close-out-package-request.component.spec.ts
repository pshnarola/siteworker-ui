import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseOutPackageRequestComponent } from './close-out-package-request.component';

describe('CloseOutPackageRequestComponent', () => {
  let component: CloseOutPackageRequestComponent;
  let fixture: ComponentFixture<CloseOutPackageRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseOutPackageRequestComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseOutPackageRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
