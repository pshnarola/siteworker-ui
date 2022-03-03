import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CloseoutPackageComponent } from './closeout-package.component';

describe('CloseoutPackageComponent', () => {
  let component: CloseoutPackageComponent;
  let fixture: ComponentFixture<CloseoutPackageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CloseoutPackageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CloseoutPackageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
