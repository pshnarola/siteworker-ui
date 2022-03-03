import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AutoCompleteMapPlacesComponent } from './auto-complete-map-places.component';

describe('AutoCompleteMapPlacesComponent', () => {
  let component: AutoCompleteMapPlacesComponent;
  let fixture: ComponentFixture<AutoCompleteMapPlacesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AutoCompleteMapPlacesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoCompleteMapPlacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
