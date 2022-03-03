import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { City } from 'src/app/shared/vo/city/city';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobTitle } from 'src/app/shared/vo/JobTitle';
import { State } from 'src/app/shared/vo/state/state';
import { JobListConfiguration } from '../vo/JobListConfiguration';
import { WorkerDto } from '../vo/worker-dto';
import { WorkerProfileDto } from '../vo/worker-profile-dto';

@Component({
  selector: 'app-job-listing-configuration',
  templateUrl: './job-listing-configuration.component.html',
  styleUrls: ['./job-listing-configuration.component.css']
})
export class JobListingConfigurationComponent implements OnInit {

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
  filterMap = new Map();
  @ViewChild('search', { static: false })
  public searchElementRef: ElementRef;
  isCityUndefined: boolean;
  isStateUndefined: any;

  @Output() goToPayDetail = new EventEmitter<any>();
  statusTemp: any;
  myForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private translator: TranslateService,
    private commonService: CommonService,
    public _workerProfileServices: BasicDetailService,
    private captionChangeService: HeaderManagementService

  ) {
    this.loginUserId = this._localStorageService.getLoginUserId();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.JOBS_LISTING_CONFIGURATION);
    this.captionChangeService.hideSidebarSubject.next(true);

  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.JOBS_LISTING_CONFIGURATION);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.initializeForm();
    this.getLogedInWorkerDetail(this.loginUserId);
    this.subscription.add(this.commonService.getAllStateList().subscribe(data => {
      this.stateData = data;
      this.stateData.forEach(state => {
        this.stateNameList.push(state.name);
      });
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.captionChangeService.hideSidebarSubject.next(false);
  }
  initializeForm() {
    this.myForm = this._formBuilder.group({
      preferredStates: [],
      certificateMatch: [],
      jobTitleMatch: []
    });
  }
  get basicDetailForm() { return this._workerProfileServices.workerEditForm; }

  getLogedInWorkerDetail(id) {
    this._workerProfileServices.getWorkerDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.workerDto = data.data;
          this.workerProfile = this.workerDto.workerProfile;
          this.fatchDetail();
        } else {
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }
  fatchDetail() {
    if (this.workerProfile.jobListConfiguration) {
      this.myForm.patchValue({
        preferredStates: this.workerProfile.lstJobListPreferredState,
        certificateMatch: this.workerProfile.jobListConfiguration.isCertificateMatch,
        jobTitleMatch: this.workerProfile.jobListConfiguration.isJobTitleMatch,
      });
    }
  }
  onSubmit() {
    this.submitted = true;
    let jobListConfiguration = new JobListConfiguration();
    jobListConfiguration.isCertificateMatch = this.myForm.value.certificateMatch;
    jobListConfiguration.isJobTitleMatch = this.myForm.value.jobTitleMatch;
    if (this.workerProfile.jobListConfiguration) {
      jobListConfiguration.id = this.workerProfile.jobListConfiguration.id;
    }

    let jobPreferredStates = [];

    this.myForm.value.preferredStates?.forEach(element => {
      jobPreferredStates.push(element.name);
    });
    jobPreferredStates = jobPreferredStates.filter((el, i, a) => i === a.indexOf(el));
    jobListConfiguration.states = jobPreferredStates.toString();

    this.workerProfile.jobListConfiguration = jobListConfiguration;
    this._workerProfileServices.updateListingConfiguration(this.workerProfile).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success('Listing configuration saved', '');
          this.getLogedInWorkerDetail(this.loginUserId);
          this.submitted = false;
          this.files = [];
          this.showPreview = false;
          this.spinner = false;
        } else {
          this.spinner = false;
          if (data.message === 'Please add required configuration by completing profile') {
            this._notificationService.error(data.message, 'Attention!');
          }
          else {
            this._notificationService.error(data.message, '');

          }
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
  filterState(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.stateData.length; i++) {
      const state = this.stateData[i];
      if (state.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(state);
      }
    }
    this.filteredState = filtered;
    this.filteredState = this.filteredState.sort();
  }
}
