import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewViewAllReferencesComponent } from './preview-view-all-references.component';

describe('PreviewViewAllReferencesComponent', () => {
  let component: PreviewViewAllReferencesComponent;
  let fixture: ComponentFixture<PreviewViewAllReferencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewViewAllReferencesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreviewViewAllReferencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
