import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageReferencesWorkerComponent } from './manage-references-worker.component';

describe('ManageReferencesWorkerComponent', () => {
  let component: ManageReferencesWorkerComponent;
  let fixture: ComponentFixture<ManageReferencesWorkerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageReferencesWorkerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageReferencesWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
