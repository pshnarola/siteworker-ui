import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MsaContentComponent } from './msa-content.component';

describe('MsaContentComponent', () => {
  let component: MsaContentComponent;
  let fixture: ComponentFixture<MsaContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MsaContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MsaContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
