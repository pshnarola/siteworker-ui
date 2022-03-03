import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllReferencesComponent } from './all-references.component';

describe('AllReferencesComponent', () => {
  let component: AllReferencesComponent;
  let fixture: ComponentFixture<AllReferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AllReferencesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AllReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
