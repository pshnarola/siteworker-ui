import { MapsAPILoader } from '@agm/core';
import { HttpResponse } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Service } from 'src/app/module/admin/service-component/service';
import { WorkerDto } from 'src/app/module/worker/vo/worker-dto';
import { WorkerProfileDto } from 'src/app/module/worker/vo/worker-profile-dto';
import { WorkerServicesList } from 'src/app/module/worker/vo/worker-services-list';
import { JobTitleService } from 'src/app/service/admin-services/job-title/job-title.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { City } from 'src/app/shared/vo/city/city';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobTitle } from 'src/app/shared/vo/JobTitle';
import { State } from 'src/app/shared/vo/state/state';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-basic-details',
  templateUrl: './basic-details.component.html',
  styleUrls: ['./basic-details.component.css']
})
export class BasicDetailsComponent implements OnInit {
  statusList =
    [{ 'label': 'Available For Hire', 'value': 'AVAILABLE' },
    { 'label': 'Not Available For Hire', 'value': 'NOT_AVAILABLE' }]
  selectedStatus;
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  queryParam;
  datatableParam: DataTableParam = null;
  workerDto: WorkerDto;
  workerProfile: WorkerProfileDto;
  cityData: City[];
  cityNameList = [];
  stateNameList = [];
  stateData: State[];
  filteredCity = [];
  filteredState = [];
  spinner = false;
  displayDummyImage: boolean = false;
  usernameLabel: string;
  filteredJobTitle;
  filteredJobTitleLength;
  JobTitleList: JobTitle[] = [];
  submittedJobTitle: boolean;
  jobTitleDialog: boolean;

  Jobtitle;

  subscription = new Subscription()

  myJobTitleForm: FormGroup;
  loginUserId: any;
  worker: any;

  workerServiceList = [];
  tempData = [];
  list = [];
  filteredServices = [];
  serviceList = [];
  submitted: boolean = false;

  selectedPhoto: File;
  logoBody: any;
  logoData: string;
  image: any;
  singleImageView: any;
  files: File[] = [];
  showPreview: boolean = false;

  statusDropDown = [];

  city;
  state;
  zipCode;
  latitude: number;
  longitude: number;
  zoom: number;
  address = '';
  private geoCoder;
  filterMap = new Map();
  @ViewChild('search', { static: false })
  public searchElementRef: ElementRef;
  isCityUndefined: boolean;
  isStateUndefined: any;

  @Output() goToPayDetail = new EventEmitter<any>()
  statusTemp: any;
  cityParams: { name: any; };


  constructor(
    private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private translator: TranslateService,
    private commonService: CommonService,
    private _jobTitleService: JobTitleService,
    public _workerProfileServices: BasicDetailService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private captionChangeService: HeaderManagementService,
    private filterLeftPanelService:FilterLeftPanelDataService

  ) {
    this.loginUserId = this._localStorageService.getLoginUserId();

  }

  ngOnInit(): void {
    this._workerProfileServices.initializeForm();
    this.getLocation();
    this.getLogedInClientDetail(this.loginUserId);
    this.getJobTitleList();
    this.initializeJobTitleForm();
    this.subscription.add(this.commonService.getAllStateList().subscribe(data => {
      this.stateData = data;
      this.stateData.forEach(state => {
        this.stateNameList.push(state.name);
      });
    }));
    this.subscription.add(this.commonService.getAllServicesList().subscribe(data => { this.serviceList = data; }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  get basicDetailForm() { return this._workerProfileServices.workerEditForm; }

  getLogedInClientDetail(id) {
    this._workerProfileServices.getWorkerDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.workerDto = data.data;
          this.fatchDetail();
        } else {
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  filterJobTitle(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.JobTitleList.length; i++) {
      let JobTitle = this.JobTitleList[i];
      if (JobTitle.title.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
        filtered.push(JobTitle);
      }
    }
    this.filteredJobTitle = filtered;
    let JobTitle = { 'id': 'buttonId' };
    this.filteredJobTitle.push(JobTitle);
    this.filteredJobTitleLength = this.filteredJobTitle.length;
  }

  onSelectJobTitle(event): void {
    if (event.id === 'buttonId') {
      this._workerProfileServices.workerEditForm.controls.jobTitle.setValue(null);
      this.jobTitleDialog = true;
    }
  }

  loadCityData(event:any){
    this.cityParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.cityParams);
    this.filterLeftPanelService.getCity(this.queryParam).subscribe(data => {
      this.filteredCity = data.data;
    });
  }

  filterService(event) {

    let filtered: any[] = [];
    let query = event.query;

    if (this.list.length < 5) {
      for (let i = 0; i < this.serviceList.length; i++) {
        let serviceTemp = this.serviceList[i];
        if (serviceTemp.serviceName.toLowerCase().indexOf(query.toLowerCase()) == 0) {
          filtered.push(serviceTemp);
        }
      }
      this.filteredServices = filtered;
      this.filteredServices = this.filteredServices.sort();
    } else {
      this._notificationService.error(this.translator.instant('max.limit.reached'), '');
    }

  }

  filterCity(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.cityNameList.length; i++) {
      let client = this.cityNameList[i];
      if (client.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(client);
      }
    }
    this.filteredCity = filtered;
    this.filteredCity = this.filteredCity.sort();
  }

  filterState(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.stateNameList.length; i++) {
      let state = this.stateNameList[i];
      if (state.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(state);
      }
    }
    this.filteredState = filtered;
    this.filteredState = this.filteredState.sort();
  }

  onStatusChange(event) {
    this.statusTemp = event.value;
  }

  onChange(data: Service[]) {
    this.tempData.length = 0;
    data.forEach(element => {
      this.tempData.push(new WorkerServicesList(element));
    });
  }

  openJobTitleDialog() {
    this.submittedJobTitle = false;
    this.jobTitleDialog = true;
    this.initializeJobTitleForm();
  }

  hideDialog() {
    this.jobTitleDialog = false;
    this.submittedJobTitle = false;
    this.initializeJobTitleForm();
  }

  initializeJobTitleForm() {
    this.myJobTitleForm = this._formBuilder.group({
      id: [],
      title: ['', [CustomValidator.required, Validators.maxLength(50)]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isEnable: 1
    });
  }

  private prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  private getJobTitleList() {
    this.datatableParam = {
      offset: 0,
      size: 100000,
      sortField: 'TITLE',
      sortOrder: 1,
      searchText: '{"ENABLE": true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._jobTitleService.getJobTitleList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.JobTitleList = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  onSubmitJobTitle() {
    this.submittedJobTitle = true;
    if (!this.myJobTitleForm.valid) {
      let controlName: string;
      for (controlName in this.myJobTitleForm.controls) {
        this.myJobTitleForm.controls[controlName].markAsDirty();
        this.myJobTitleForm.controls[controlName].updateValueAndValidity();
      }
      this.submittedJobTitle = true;
      return false;
    }
    if (this.myJobTitleForm.valid) {
      this._jobTitleService.addJobTitle(JSON.stringify(this.myJobTitleForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('job.title.added.successfully'), '');
            this.jobTitleDialog = false;
            this.submittedJobTitle = false;
            this.getJobTitleList();
            this._workerProfileServices.workerEditForm.controls.jobTitle.patchValue(data.data);
          }
          else {
            this._notificationService.error(data.message, '');
            this.jobTitleDialog = false;
            this.submittedJobTitle = false;
          }
        },
        error => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.jobTitleDialog = false;
          this.submittedJobTitle = false;
        }
      );
    }
  }

  fatchDetail() {
    this.tempData.length = 0;

    this.workerDto.workerServices.forEach(res => { this.workerServiceList.push(res.service); this.tempData.push(new WorkerServicesList(res.service)) })
    this._workerProfileServices.workerEditForm.patchValue({
      id: this.workerDto.workerProfile.id,
      mobilePhone: this.workerDto.workerProfile.mobilePhone,
      photo: this.workerDto.workerProfile.photo,
      summary: this.workerDto.workerProfile.summary,

      userId: this.workerDto.workerProfile.user.id,
      firstName: this.workerDto.workerProfile.user.firstName,
      lastName: this.workerDto.workerProfile.user.lastName,
      email: this.workerDto.workerProfile.user.email,

      lastSavedStep: 1,
      location: this.workerDto.workerProfile.location,
      service: this.workerServiceList,

      city: this.workerDto.workerProfile.city,
      state: this.workerDto.workerProfile.state,
      zipCode: this.workerDto.workerProfile.zipCode,
      latitude: this.workerDto.workerProfile.latitude,
      longitude: this.workerDto.workerProfile.longitude,
      preferredStates: this.workerDto.workerProfile.lstJobListPreferredState,

    });

    if (this.workerDto.workerProfile.photo) {
      this.singleImageView = environment.baseURL + "/file/getById?fileId=" + this.workerDto.workerProfile.photo;
      this.displayDummyImage = false;
    } else {
      this.displayDummyImage = true;
      this.usernameLabel = this.workerDto.workerProfile.user.firstName.substring(0, 1) + this.workerDto.workerProfile.user.lastName.substring(0, 1)
    }

    if (this.workerDto.workerProfile.jobTitle !== null && this.workerDto.workerProfile.status !== null) {
      this._workerProfileServices.workerEditForm.patchValue({
        jobTitle: this.workerDto.workerProfile.jobTitle,
        status: this.workerDto.workerProfile.status,
      });
    } else if (this.workerDto.workerProfile.jobTitle !== null && this.workerDto.workerProfile.jobTitle !== undefined) {
      this._workerProfileServices.workerEditForm.patchValue({
        jobTitle: this.workerDto.workerProfile.jobTitle,
      });
    } else if (this.workerDto.workerProfile.status !== null && this.workerDto.workerProfile.status !== undefined) {
      this._workerProfileServices.workerEditForm.patchValue({
        status: this.workerDto.workerProfile.status,
      });
    } else {
    }
  }


  getAddressFromAutocompleteMapsApi(event): void {
    this.city = event.get("LOCALITY");
    this.state = event.get("STATE");
    this.zipCode = event.get("ZIPCODE");
    this.address = event.get("ADDRESS");
    this.latitude = event.get("LATITUDE");
    this.longitude = event.get("LONGITUDE");
    this._workerProfileServices.workerEditForm.get("city").setValue(this.city)
    this._workerProfileServices.workerEditForm.get("state").setValue(this.state)
    this._workerProfileServices.workerEditForm.get("zipCode").setValue(this.zipCode)
    this._workerProfileServices.workerEditForm.get("location").setValue(this.address)
    this._workerProfileServices.workerEditForm.get("latitude").setValue(this.latitude)
    this._workerProfileServices.workerEditForm.get("longitude").setValue(this.longitude)
  }


  getLocation() {
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

  onSelect(event) {
    this.files.push(...event.addedFiles);

    if (this.files[1] != null) {
      this.onRemove(this.files[0]);
    }
    this.selectedPhoto = this.files[0];
    this.showPreview = true;
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this._notificationService.error(this.translator.instant('max.file.size.5.mb'), '');
      } else {
        this._notificationService.error(this.translator.instant('image.upload'), '');
      }
      event.rejectedFiles = [];
      this.showPreview = false;
    }
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
    this.showPreview = false;
  }

  uploadPhoto(next?: string) {
    this.spinner = true;
    if (this.selectedPhoto) {
      const uploadImageData = new FormData();
      uploadImageData.append('file', this.selectedPhoto);
      this._workerProfileServices.uploadLogo(uploadImageData).subscribe(
        event => {
          if (event instanceof HttpResponse) {
            this.logoBody = event.body;
            this.logoData = this.logoBody.data;
            this._workerProfileServices.workerEditForm.controls.photo.patchValue(this.logoData);
            if (next == "next") {
              this.onSubmit("next");
            } else {
              this.onSubmit();
            }
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.spinner = false;
        }
      );
    }
    else {
      if (next == "next") {
        this.onSubmit("next");
      } else {
        this.onSubmit();
      }
    }
  }

  onSubmit(next?) {
    this.submitted = true;

    if (!this._workerProfileServices.workerEditForm.valid) {
      CustomValidator.markFormGroupTouched(this._workerProfileServices.workerEditForm);
      this.submitted = true;
      this.spinner = false;
      return false;
    }

    if (this._workerProfileServices.workerEditForm.controls.id.value != null || !this._workerProfileServices.workerEditForm.valid) {
      this.workerDto.workerServices = this.tempData;
      this.workerDto.workerProfile.id = this._workerProfileServices.workerEditForm.get('id').value;
      this.workerDto.workerProfile.user.id = this._workerProfileServices.workerEditForm.get('userId').value;
      this.workerDto.workerProfile.user.firstName = this._workerProfileServices.workerEditForm.get('firstName').value;
      this.workerDto.workerProfile.user.lastName = this._workerProfileServices.workerEditForm.get('lastName').value;
      this.workerDto.workerProfile.user.email = this._workerProfileServices.workerEditForm.get('email').value;
      this.workerDto.workerProfile.mobilePhone = this._workerProfileServices.workerEditForm.get('mobilePhone').value;
      this.workerDto.workerProfile.summary = this._workerProfileServices.workerEditForm.get('summary').value;
      this.workerDto.workerProfile.jobTitle = this._workerProfileServices.workerEditForm.get('jobTitle').value;
      this.workerDto.workerProfile.status = this._workerProfileServices.workerEditForm.get('status').value;
      this.workerDto.workerProfile.photo = this._workerProfileServices.workerEditForm.get('photo').value;
      this.workerDto.workerProfile.city = this._workerProfileServices.workerEditForm.get('city').value;
      this.workerDto.workerProfile.state = this._workerProfileServices.workerEditForm.get('state').value;
      this.workerDto.workerProfile.location = this._workerProfileServices.workerEditForm.get('location').value;
      this.workerDto.workerProfile.latitude = this._workerProfileServices.workerEditForm.get('latitude').value;
      this.workerDto.workerProfile.longitude = this._workerProfileServices.workerEditForm.get('longitude').value;
      this.workerDto.workerProfile.zipCode = this._workerProfileServices.workerEditForm.get('zipCode').value;

      this._workerProfileServices.updateWorkerProfile(this.workerDto).subscribe(
        data => {
          
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('worker.profile.updated'), '');
            this.submitted = false;
            this.files = [];
            this.showPreview = false;
            this.spinner = false;
            this.captionChangeService.profileDataSubject.next(data.data.workerProfile.user.id);
            if (data.data.workerProfile.photo) {
              this.singleImageView = environment.baseURL + "/file/getById?fileId=" + data.data.workerProfile.photo;
              this.displayDummyImage = false;
            }
            if (next == "next") {
              this.next();
            }
          } else {
            this.spinner = false;
            this._notificationService.error(data.message, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
          this.files = [];
          this.showPreview = false;
          this.spinner = false;
        }
      );
    }
    else {
    }
  }

  next() {
    this.goToPayDetail.emit('');
    this._workerProfileServices.workerProfileDetailSubject.next(this.workerDto);
  }

}
