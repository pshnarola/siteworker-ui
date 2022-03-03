import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { DataTableParam } from '../vo/DataTableParam';

@Component({
  selector: 'app-subcontractor-project-list-filter',
  templateUrl: './subcontractor-project-list-filter.component.html',
  styleUrls: ['./subcontractor-project-list-filter.component.css']
})
export class SubcontractorProjectListFilterComponent implements OnInit {

  queryParam;
  dataTableParam: DataTableParam;
  projectTitleParams: { subcontractorId: any; name: any; };
  filteredProjectTitles = [];
  loggedInUserId: any;
  projectFilterFormGroup: FormGroup;
  industryForProjectParams: { subcontractorId: any; name: any; };
  stateForProjectParams: { name: any; };
  filteredStateForProject = [];
  filteredIndustryForProject = [];
  regionForProjectParams: { name: any; };
  filteredRegionForProject = [];
  clientForProjectParams: { subcontractorId: any; name: any; };
  filteredClientForProject = [];
  filteredIsNegotiable = [];
  emptyArray: any[] = [];

  negotiableList = [
    { label: 'Yes', value: 'true' },
    { label: 'No', value: 'false' },
  ];


  constructor(
    private filterLeftPanelService: FilterLeftPanelDataService,
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
  ) {
    this.dataTableParam = new DataTableParam();
    this.loggedInUserId = this.localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this.initializeProjectFilterFormGroup();
  }

  public initializeProjectFilterFormGroup(): void {
    this.projectFilterFormGroup = this.formBuilder.group({
      projectTitle: [''],
      clientName: [''],
      industryType: [''],
      state: [''],
      region: [''],
      isBidNegotiable: [''],
      startDate: [''],
      postDate: [''],
      dueDate: [''],
      estimatedDate: [''],
      min: [''],
      max: [''],
    });
  }

  getProjectTitle(event): void {
    this.projectTitleParams = {
      subcontractorId: this.loggedInUserId,
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.projectTitleParams);
    this.filterLeftPanelService.getProjectTitleForSubcontractor(this.queryParam).subscribe(data => {
      this.filteredProjectTitles = data.data;
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

  filterIsNegotiable(event): void {
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.negotiableList.length; i++) {
      const negotiable = this.negotiableList[i];
      if (negotiable.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(negotiable);
      }
    }
    this.filteredIsNegotiable = filtered;

  }

  getFilteredStateForProject(event) {
    this.stateForProjectParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.stateForProjectParams);
    this.filterLeftPanelService.getStateForProject(this.queryParam).subscribe(data => {
      this.filteredStateForProject = data.data;
      this.filteredStateForProject = this.filteredStateForProject.sort();
    });
  }

  getFilteredClientForProject(event) {
    this.clientForProjectParams = {
      subcontractorId: this.loggedInUserId,
      name: event.query
    };

    this.queryParam = this.prepareQueryParam(this.clientForProjectParams);
    this.filterLeftPanelService.getClientForProjectBySubcontractor(this.queryParam).subscribe(data => {
      this.filteredClientForProject = data.data;
      this.filteredClientForProject = this.filteredClientForProject.sort();
    });
  }

  getFilteredIndustryForProject(event) {
    this.industryForProjectParams = {
      subcontractorId: this.loggedInUserId,
      name: event.query
    };

    this.queryParam = this.prepareQueryParam(this.industryForProjectParams);
    this.filterLeftPanelService.getIndustryForProjectBySubcontractor(this.queryParam).subscribe(data => {
      this.filteredIndustryForProject = data.data;
      this.filteredIndustryForProject = this.filteredIndustryForProject.sort();
    });

  }

  getFilteredRegionForProject(event) {

    this.regionForProjectParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.regionForProjectParams);
    this.filterLeftPanelService.getRegionForProject(this.queryParam).subscribe(data => {
      this.filteredRegionForProject = data.data;
      this.filteredRegionForProject = this.filteredRegionForProject.sort();
    });
  }

  filterProjectList(): void {

    this.filterLeftPanelService.projectListFilter.next(this.projectFilterFormGroup.value);
  }

  clear(event): void {
    this.projectFilterFormGroup.reset();
    this.projectFilterFormGroup.get('projectTitle').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('clientName').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('industryType').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('state').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('region').patchValue(this.emptyArray);
    this.projectFilterFormGroup.get('min').patchValue(0);
    this.projectFilterFormGroup.get('max').patchValue(0);
    this.filterLeftPanelService.projectListFilter.next(this.projectFilterFormGroup.value);
  }

}
