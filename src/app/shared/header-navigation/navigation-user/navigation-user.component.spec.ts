import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavigationUserComponent } from './navigation-user.component';

describe('NavigationUserComponent', () => {
  let component: NavigationUserComponent;
  let fixture: ComponentFixture<NavigationUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NavigationUserComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NavigationUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
