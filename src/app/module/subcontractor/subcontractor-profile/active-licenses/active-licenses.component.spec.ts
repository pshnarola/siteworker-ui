import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveLicensesComponent } from './active-licenses.component';

describe('ActiveLicensesComponent', () => {
  let component: ActiveLicensesComponent;
  let fixture: ComponentFixture<ActiveLicensesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActiveLicensesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActiveLicensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
