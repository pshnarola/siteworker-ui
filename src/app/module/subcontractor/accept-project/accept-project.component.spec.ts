import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptProjectComponent } from './accept-project.component';

describe('AcceptProjectComponent', () => {
  let component: AcceptProjectComponent;
  let fixture: ComponentFixture<AcceptProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AcceptProjectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
