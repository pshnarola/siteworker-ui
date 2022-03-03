import { MapsAPILoader } from '@agm/core';
import { Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { RxFormBuilder } from '@rxweb/reactive-form-validators';
import { RegionService } from 'src/app/service/admin-services/region/region.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { DataTableParam } from '../vo/DataTableParam';
import { User } from '../vo/User';

@Component({
  selector: 'app-worker-job-list-filter',
  templateUrl: './worker-job-list-filter.component.html',
  styleUrls: ['./worker-job-list-filter.component.css']
})
export class WorkerJobListFilterComponent implements OnInit {

  jobFilterFormGroup: FormGroup;

  filteredStatus: any[];
  filteredEmployeType: any[];
  filteredRadius: any[];
  jobTitleParams;
  workerNameParams;
  loggedInUserId;
  jobTitles = [];
  workers = [];
  queryParam;
  dataTableParam: DataTableParam;
  emptyArray: any[] = [];
  employeType = [
    { label: 'Temporary Worker - 1099', value: 'WORKER_1099' },
    { label: 'Temporary Worker - W2', value: 'WORKER_W2' },
    { label: 'Full-time Employee', value: 'FULL_TIME' },
  ];

  status = [
    { label: 'Posted', value: 'POSTED' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Offered', value: 'OFFERED' },
    { label: 'Accepted', value: 'ACCEPTED' },
    { label: 'Canceled', value: 'CANCELED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Published', value: 'PUBLISHED' },
  ];
  locationRadius = [
    { label: '25', value: '25' },
    { label: '50', value: '50' },
    { label: '75', value: '75' },
    { label: '100', value: '100' },
    // { label: '200', value: '200' },
    // { label: '250', value: '250' }
  ];
  filteredCityForJob = [];
  filteredStateForJob = [];
  cityParams: {};
  stateParams: { name: any; };
  clientNameParams: { name: any; };
  clients = [];
  regionParams: { name: any; };
  filteredRegionForJob = [];
  defaultMiles = 50;
  adminRegion = [];
  region;

  // Maps API
  filterMap = new Map();
  @ViewChild('search')
  public searchElementRef: ElementRef;
  geoCoder;
  zoom: number;
  constructor(
    private router: Router,
    private formBuilder: RxFormBuilder,
    private localStorageService: LocalStorageService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private filterlLeftPanelService: FilterLeftPanelDataService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private regionService: RegionService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone) {
    this.initializeJobfilterFormGroup();
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.dataTableParam = new DataTableParam();
  }

  ngOnInit(): void {
    this.getLocation();
  }

  public initializeJobfilterFormGroup(): void {
    this.jobFilterFormGroup = this.formBuilder.group({
      keyword: [''],
      jobTitle: [''],
      dateRange: [''],
      employmentType: [''],
      city: null,
      state: null,
      region: null,
      postedBy: [''],
      location: [''],
      miles: ['50']
    });

  }
  filterStatus(event): void {
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.status.length; i++) {
      const status = this.status[i];
      if (status.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(status);
      }
    }
    this.filteredStatus = filtered;
  }

  filterEmployeType(event): void {
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.employeType.length; i++) {
      const employeType = this.employeType[i];
      if (employeType.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(employeType);
      }
    }
    this.filteredEmployeType = filtered;

  }
  filterRadius(event): void {
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.locationRadius.length; i++) {
      const locationRadius = this.locationRadius[i];
      if (locationRadius.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(locationRadius);
      }
    }
    this.filteredRadius = filtered;

  }
  getAddressFromAutocompleteMapsApi(event): void {

    this.jobFilterFormGroup.get('location').setValue(event.get('ADDRESS'));
    if (event.get('LOCALITY')) {
      let cityArray = [];
      if (this.jobFilterFormGroup.get('city').value) {
        cityArray = this.jobFilterFormGroup.get('city').value;
      }
      if (!cityArray.includes(event.get('LOCALITY'))) {
        cityArray.push(event.get('LOCALITY'));
      }
      this.jobFilterFormGroup.get('city').setValue(cityArray);
    }
    if (event.get('STATE')) {
      let stateArray = [];
      if (this.jobFilterFormGroup.get('state').value) {
        stateArray = this.jobFilterFormGroup.get('state').value;
      }
      if (!stateArray.includes(event.get('STATE'))) {
        stateArray.push(event.get('STATE'));
      }
      this.jobFilterFormGroup.get('state').setValue(stateArray);
    }
    if (event.get('REGION')) {
      let regionArray = [];
      if (this.jobFilterFormGroup.get('region').value) {
        regionArray = this.jobFilterFormGroup.get('region').value;
      }
      regionArray.push(event.get('REGION'));
      this.jobFilterFormGroup.get('region').setValue(regionArray);
    }
  }
  getJobTitleForWorker(name): void {

    this.jobTitleParams = {
      workerId: this.loggedInUserId,
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.jobTitleParams);
    this.filterLeftPanelService.getJobTitleForWorker(this.queryParam).subscribe(data => {

      this.jobTitles = data.data;
      this.jobTitles = this.jobTitles.sort();
    });
  }
  getWorkerByName(name): void {
    this.workerNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.workerNameParams);
    this.filterLeftPanelService.getWorkerByName(this.queryParam).subscribe(data => {

      this.workers = data.data;
      this.workers = this.workers.sort();
    });
  }
  getClientByName(name): void {
    this.clientNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.clientNameParams);
    this.filterLeftPanelService.getClientByName(this.queryParam).subscribe(data => {

      this.clients = data.data;
      this.clients = this.clients.sort();
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
  getFilteredCityForJob(event): void {
    this.cityParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.cityParams);
    this.filterlLeftPanelService.getCityForJob(this.queryParam).subscribe(data => {

      this.filteredCityForJob = data.data;
    });
  }
  getFilteredStateForJob(event): void {
    this.stateParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.stateParams);
    this.filterlLeftPanelService.getStateForJob(this.queryParam).subscribe(data => {

      this.filteredStateForJob = data.data;
    });
  }
  getFilteredRegionForJob(event): void {

    this.regionParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.regionParams);
    this.filterlLeftPanelService.getRegionForJob(this.queryParam).subscribe(data => {

      this.filteredRegionForJob = data.data;

    });
  }
  filterJobList(): void {

    this.filterLeftPanelService.jobListFilter.next(this.jobFilterFormGroup.value);
  }
  onLocationRadius(event): void {
    this.jobFilterFormGroup.get('miles').setValue(event.value);

  }
  getAdminRegion() {
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.regionService.getRegionList(this.queryParam).subscribe(data => {
      this.adminRegion = data.data.result;
    });
  }
  filterAdminRegion(event) {
    this.getAdminRegion();
    this.filteredRegionForJob.length = 0;
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.adminRegion.length; i++) {
      const adminRegion = this.adminRegion[i];
      if (adminRegion.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(adminRegion.name);
      }
      this.filteredRegionForJob = filtered;
    }



  }
  clear(event): void {
    this.jobFilterFormGroup.reset();
    // this.jobFilterFormGroup.get('location').setValue('');
    this.jobFilterFormGroup.get('jobTitle').patchValue(this.emptyArray);
    this.jobFilterFormGroup.get('employmentType').patchValue(this.emptyArray);
    // this.jobFilterFormGroup.get('city').patchValue(this.emptyArray);
    // this.jobFilterFormGroup.get('state').patchValue(this.emptyArray);
    // this.jobFilterFormGroup.get('region').patchValue(this.emptyArray);
    this.jobFilterFormGroup.get('postedBy').patchValue(this.emptyArray);
    // this.initializeJobfilterFormGroup();
    this.filterLeftPanelService.jobListFilter.next(this.jobFilterFormGroup.value);
  }
  getLocation(): void {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();

      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.filterMap.clear();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          const info = place.address_components;
          info.forEach(e => {
            switch (e.types[0]) {
              case 'sublocality_level_1':
                this.filterMap.set('REGION', e.long_name);
                break;
              case 'administrative_area_level_1':
                this.filterMap.set('STATE', e.long_name);
                break;
              case 'country':
                this.filterMap.set('COUNTRY', e.long_name);
                break;
              case 'postal_code':
                this.filterMap.set('ZIPCODE', e.long_name);
                break;
              case 'locality':
                this.filterMap.set('LOCALITY', e.long_name);
                break;
              default:
                break;
            }
          });
          this.filterMap.set('LATITUDE', place.geometry.location.lat());
          this.filterMap.set('LONGITUDE', place.geometry.location.lng());
          this.filterMap.set('ADDRESS', place.formatted_address);
          this.zoom = 12;
          const jsonObject = {};
          this.getAddressFromAutocompleteMapsApi(this.filterMap);

          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
        });
      });
    });


  }
  getFullName(data: User) {
    // 
    return data.firstName + ' ' + data.lastName;
  }
}
