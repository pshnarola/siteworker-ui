import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewClientProfileComponent } from './preview-client-profile.component';

describe('PreviewClientProfileComponent', () => {
  let component: PreviewClientProfileComponent;
  let fixture: ComponentFixture<PreviewClientProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewClientProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewClientProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
