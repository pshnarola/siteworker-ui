import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientJobTimeSheetComponent } from './client-job-time-sheet.component';

describe('ClientJobTimeSheetComponent', () => {
  let component: ClientJobTimeSheetComponent;
  let fixture: ComponentFixture<ClientJobTimeSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientJobTimeSheetComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientJobTimeSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
