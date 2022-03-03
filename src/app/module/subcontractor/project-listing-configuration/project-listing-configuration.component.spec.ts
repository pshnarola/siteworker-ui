import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectListingConfigurationComponent } from './project-listing-configuration.component';

describe('ProjectListingConfigurationComponent', () => {
  let component: ProjectListingConfigurationComponent;
  let fixture: ComponentFixture<ProjectListingConfigurationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProjectListingConfigurationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectListingConfigurationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
