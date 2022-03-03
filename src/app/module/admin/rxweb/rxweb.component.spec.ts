import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RxwebComponent } from './rxweb.component';

describe('RxwebComponent', () => {
  let component: RxwebComponent;
  let fixture: ComponentFixture<RxwebComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RxwebComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RxwebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
