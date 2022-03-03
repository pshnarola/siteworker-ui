import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupLoginHeaderComponent } from './signup-login-header.component';

describe('SignupLoginHeaderComponent', () => {
  let component: SignupLoginHeaderComponent;
  let fixture: ComponentFixture<SignupLoginHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupLoginHeaderComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupLoginHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
