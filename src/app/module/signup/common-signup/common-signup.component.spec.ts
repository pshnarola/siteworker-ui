import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonSignupComponent } from './common-signup.component';

describe('CommonSignupComponent', () => {
  let component: CommonSignupComponent;
  let fixture: ComponentFixture<CommonSignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonSignupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonSignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
