import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCustomizedMsaClientComponent } from './add-customized-msa-client.component';

describe('AddCustomizedMsaClientComponent', () => {
  let component: AddCustomizedMsaClientComponent;
  let fixture: ComponentFixture<AddCustomizedMsaClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCustomizedMsaClientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCustomizedMsaClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
