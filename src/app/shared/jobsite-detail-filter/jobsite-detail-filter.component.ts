import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { DataTableParam } from '../vo/DataTableParam';

@Component({
  selector: 'app-jobsite-detail-filter',
  templateUrl: './jobsite-detail-filter.component.html',
  styleUrls: ['./jobsite-detail-filter.component.css']
})
export class JobsiteDetailFilterComponent implements OnInit {

  jobSiteFilterFormGroup: FormGroup;
  dataTableParam: DataTableParam;
  loggedInUserId: any;
  queryParam: URLSearchParams;
  filteredStateForJobsite: any[] = [];
  filteredCityForJobsite: any[] = [];
  filteredzipCodeForJobsite: any[] = [];
  filteredJobsiteTitles: any[] = [];
  stateForJobsiteParams: { name: any; };
  cityForJobsiteParams: { name: any; };
  jobsiteTitleForJobsiteParams: { name: any; subcontractorId: any; };
  emptyArray: any[] = [];

  constructor(
    private filterLeftPanelService: FilterLeftPanelDataService,
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private projectJobSelectionService: ProjectJobSelectionService) {
    this.dataTableParam = new DataTableParam();
    this.loggedInUserId = this.localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this.initializeProjectFilterFormGroup();
  }

  public initializeProjectFilterFormGroup(): void {
    this.jobSiteFilterFormGroup = this.formBuilder.group({
      jobSiteTitle: [''],
      state: [''],
      city: [''],
      zipCode: [''],
      min: [''],
      max: [''],
    });
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getFilteredStateForJobsite(event) {
    this.stateForJobsiteParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.stateForJobsiteParams);
    this.filterLeftPanelService.getStateForJobsite(this.queryParam).subscribe(data => {
      this.filteredStateForJobsite = data.data;
      this.filteredStateForJobsite = this.filteredStateForJobsite.sort();
    });
  }

  // http://localhost:8080/filterData/getJobsiteTitleForSubContractor?name=11&subcontractorId=04
  // http://localhost:8080/filterData/getJobsiteTitleForSubcontractor?name=11&subcontractorId=04

  getJobsiteTitle(event?) {
    this.jobsiteTitleForJobsiteParams = {
      name: event.query,
      subcontractorId: this.loggedInUserId
    };
    this.queryParam = this.prepareQueryParam(this.jobsiteTitleForJobsiteParams);
    this.filterLeftPanelService.getJobsiteTitleForSubcontractor(this.queryParam).subscribe(data => {
      this.filteredJobsiteTitles = data.data;
      this.filteredJobsiteTitles = this.filteredJobsiteTitles.sort();
    });
  }

  getFilteredCityForJobsite(event?) {
    this.cityForJobsiteParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.cityForJobsiteParams);
    this.filterLeftPanelService.getCityForJobsite(this.queryParam).subscribe(data => {
      this.filteredCityForJobsite = data.data;
      this.filteredCityForJobsite = this.filteredCityForJobsite.sort();
    });
  }

  getFilteredzipCodeForJobsite(event?) {
    this.cityForJobsiteParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.cityForJobsiteParams);
    this.filterLeftPanelService.getCityForJobsite(this.queryParam).subscribe(data => {
      this.filteredzipCodeForJobsite = data.data;
    });
  }

  applyFilter() {
    console.log(this.jobSiteFilterFormGroup.value);
    this.filterLeftPanelService.jobSiteListFilter.next(this.jobSiteFilterFormGroup);
  }

  clear(event) {
    this.jobSiteFilterFormGroup.reset();
    this.jobSiteFilterFormGroup.get('jobSiteTitle').patchValue(this.emptyArray);
    this.jobSiteFilterFormGroup.get('state').patchValue(this.emptyArray);
    this.jobSiteFilterFormGroup.get('city').patchValue(this.emptyArray);
    this.filterLeftPanelService.jobSiteListFilter.next(this.jobSiteFilterFormGroup);
    // this.projectJobSelectionService.addProjectSubject.next(event);
  }


}
