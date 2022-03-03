import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsaClientComponent } from './msa-client.component';

describe('MsaClientComponent', () => {
  let component: MsaClientComponent;
  let fixture: ComponentFixture<MsaClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MsaClientComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MsaClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
