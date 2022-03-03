import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditClientProfileMsaComponent } from './edit-client-profile-msa.component';

describe('EditClientProfileMsaComponent', () => {
  let component: EditClientProfileMsaComponent;
  let fixture: ComponentFixture<EditClientProfileMsaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditClientProfileMsaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditClientProfileMsaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
