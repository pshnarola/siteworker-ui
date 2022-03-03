import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationGeneralComponent } from './navigation-general.component';

describe('NavigationGeneralComponent', () => {
  let component: NavigationGeneralComponent;
  let fixture: ComponentFixture<NavigationGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigationGeneralComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
