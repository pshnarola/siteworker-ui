import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonService } from 'src/app/shared/common-services/common.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { City } from 'src/app/shared/vo/city/city';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobTitle } from 'src/app/shared/vo/JobTitle';
import { State } from 'src/app/shared/vo/state/state';
import { ProjectListConfiguration } from '../subcontractor-profile/vo/project-list-configuration';
import { SubcontractorProfile } from '../subcontractor-profile/vo/subcontractor-profile';

@Component({
  selector: 'app-project-listing-configuration',
  templateUrl: './project-listing-configuration.component.html',
  styleUrls: ['./project-listing-configuration.component.css']
})
export class ProjectListingConfigurationComponent implements OnInit {

  queryParam;
  datatableParam: DataTableParam = null;
  subcontractorDto;
  subcontractorProfile: SubcontractorProfile;
  cityData: City[];
  cityNameList = [];
  stateNameList = [];
  stateData: State[];
  filteredCity = [];
  filteredState = [];
  spinner = false;
  displayDummyImage = false;
  usernameLabel: string;
  filteredJobTitle;
  filteredJobTitleLength;
  JobTitleList: JobTitle[] = [];
  submittedJobTitle: boolean;
  jobTitleDialog: boolean;

  Jobtitle;

  subscription = new Subscription();

  myJobTitleForm: FormGroup;
  loginUserId: any;
  subcontractor: any;

  subcontractorServiceList = [];
  tempData = [];
  list = [];
  filteredServices = [];
  serviceList = [];
  submitted = false;

  selectedPhoto: File;
  logoBody: any;
  logoData: string;
  image: any;
  singleImageView: any;
  files: File[] = [];
  showPreview = false;

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

  @Output() goToPayDetail = new EventEmitter<any>();
  statusTemp: any;
  myForm: FormGroup;

  constructor(
    private _formBuilder: FormBuilder,
    private _localStorageService: LocalStorageService,
    private _notificationService: UINotificationService,
    private translator: TranslateService,
    private commonService: CommonService,
    public _subcontractorProfileServices: SubcontractorProfileService,
    private captionChangeService: HeaderManagementService

  ) {
    this.loginUserId = this._localStorageService.getLoginUserId();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.PROJECT_LISTING_CONFIGURATION);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.PROJECT_LISTING_CONFIGURATION);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.initializeForm();
    this.getLogedInSubcontractorDetail(this.loginUserId);
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
      isIndustryMatch: []
    });
  }

  get basicDetailForm() { return this._subcontractorProfileServices.subcontractorEditForm; }

  getLogedInSubcontractorDetail(id) {
    this._subcontractorProfileServices.getSubcontractorDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractorDto = data.data;
          this.subcontractorProfile = this.subcontractorDto.subcontractorProfile;
          this.fatchDetail();
        } else {
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
      });
  }

  fatchDetail() {
    if (this.subcontractorProfile.projectListConfiguration) {
      this.myForm.patchValue({
        preferredStates: this.subcontractorProfile.lstPreferredStates,
        isIndustryMatch: this.subcontractorProfile.projectListConfiguration.isIndustryTypeChecked,
      });
    }
  }

  onSubmit() {
    this.submitted = true;
    const projectListConfiguration = new ProjectListConfiguration();
    projectListConfiguration.isIndustryTypeChecked = this.myForm.value.isIndustryMatch;

    if (this.subcontractorProfile.projectListConfiguration) {
      projectListConfiguration.id = this.subcontractorProfile.projectListConfiguration.id;
    }

    let projectPreferredStates = [];

    this.myForm.value.preferredStates?.forEach(element => {
      projectPreferredStates.push(element.name);
    });
    projectPreferredStates = projectPreferredStates.filter((el, i, a) => i === a.indexOf(el));
    projectListConfiguration.states = projectPreferredStates.toString();

    this.subcontractorProfile.projectListConfiguration = projectListConfiguration;

    this._subcontractorProfileServices.updateListingConfiguration(this.subcontractorProfile).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success('Listing configuration saved', '');
          this.getLogedInSubcontractorDetail(this.loginUserId);
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
        console.log(error);
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
      if (state.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(state);
      }
    }
    this.filteredState = filtered;
    this.filteredState = this.filteredState.sort();
  }

}
