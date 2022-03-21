import { Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PostProjectService } from 'src/app/service/client-services/post-project/post-project.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { UserService } from 'src/app/service/User.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { IndustryType } from 'src/app/shared/vo/IndustryType';
import { Region } from 'src/app/shared/vo/region/region';
import { User } from 'src/app/shared/vo/User';
import { RegionService } from 'src/app/service/admin-services/region/region.service';
import { IndustryTypeService } from 'src/app/service/admin-services/industry-type/industry-type.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';
import { MapsAPILoader } from '@agm/core';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';

@Component({
  selector: 'app-subcontractor-selection',
  templateUrl: './subcontractor-selection.component.html',
  styleUrls: ['./subcontractor-selection.component.css']
})
export class SubcontractorSelectionComponent implements OnInit, OnDestroy {

  p: number;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  status;
  flag = 0;
  emailFlag = false;
  inviteFlag = false;
  email;
  otherInviteeList;
  otherInvitees = [];
  otherInviteesEmail = [];
  emailList;
  dataTableParam: DataTableParam;

  filterDataTableParam: DataTableParam;
  sortOrder = 1;
  sortField = 'CREATED_DATE';
  globalFilter;

  data: User[] = [];
  url;
  loading = false;
  offset: Number = 0;
  filteredRegion: any[];
  subcontractors;
  totalRecords: Number = 0;
  emptyFlag: boolean;
  queryParam;
  isFilterOpened = false;
  selectedSubcontractor = [];
  selectedSubcontractorEmail = [];
  subcontractorLength;
  subcontractorSelectionForm: FormGroup;
  region: Region[];
  industryType: IndustryType[];
  filteredIndustryType: any[];
  dataParam: DataTableParam = null;
  filterRegionValue = null;
  filterIndustryTypeValue = null;
  filterVendorName = [];
  location = '';
  zoom: number;
  count = 0;
  private geoCoder;
  projectBasicDetail: any;
  loginUserId: string;
  filterMap = new Map();
  @ViewChild('search')
  public searchElementRef: ElementRef;
  imageUrl;
  subcontractorIndustryType;
  industryImageUrl = 'assets/images/industryDummy.png';
  role: String;

  projectDetailForMatchMaking: any;

  subscription = new Subscription();
  subcontractorNameParams: { name: any; };
  subcontractorNameList: any;
  latitude: any;
  longitude: any;
  first: any;
  isInvited: boolean = false;

  constructor(
    private _formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private postProjectService: PostProjectService,
    private industryTypeService: IndustryTypeService,
    private translator: TranslateService,
    private router: Router,
    private projectJobselection: ProjectJobSelectionService,
    private regionService: RegionService,
    private _notificationService: UINotificationService,
    private _subcontractorService: SubcontractorProfileService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private userService: UserService,
    private filterLeftPanelService: FilterLeftPanelDataService
  ) {
    this.loginUserId = this.localStorageService.getLoginUserId();
    this.role = this.localStorageService.getLoginUserObject().roles[0].roleName;

    this.isInvited = this.localStorageService.getIsSubcontractorInvite();
    // this.localStorageService.setItem("addProjectDetail", this.projectDetail);
    // this.localStorageService.setItem("currentProjectStep", 4);
    // this.localStorageService.setItem('inviteSubcontractor', true);

    this.dataTableParam = new DataTableParam();
  }

  ngOnInit(): void {
    this.initializeForm();
    if (this.localStorageService.getItem('currentProjectStep') === 4) {
      this.getLocation();
      this.getSubcontractorSelectionListFromReplaySubject();
    }

    this.subscription.add(this.postProjectService.getSubcontractorSelectionList.subscribe(
      data => {
        if (data) {
          this.getLocation();
          this.getSubcontractorSelectionListFromReplaySubject();
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    ));
  }

  getSubcontractorSelectionListFromReplaySubject() {
    this.projectDetailForMatchMaking = this.localStorageService.getItem('addProjectDetail');
    let projectID;
    if (this.projectDetailForMatchMaking) {
      projectID = this.projectDetailForMatchMaking?.id ? this.projectDetailForMatchMaking?.id : null;
    } else {
      projectID = null;
    }
    this.globalFilter = `{"ROLE_NAME": "SUBCONTRACTOR","CLIENT_INVITEE_ID": "${this.loginUserId}", "PROJECT_OR_JOB_ID":"${projectID}"}`;
    this.dataTableParam = {
      offset: 0,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: 1,
      searchText: this.globalFilter
    };

    this.dataParam = {
      offset: 0,
      size: 1000000,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: '{"IS_ENABLE" : true}'
    };

    this.getRegionList();
    this.getIndustryTypeList();
    this.initializeForm();
    this.loadSubcontractorByMatchMaking();
  }

  ngOnDestroy() {
    this.localStorageService.removeItem('InvitedSubcontracor');
    this.localStorageService.removeItem('inviteSubcontractor');
    this.localStorageService.removeItem('inviteSubcontractorFlage');
    this.subscription.unsubscribe();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  onFilterOpen() {
    this.isFilterOpened = !this.isFilterOpened;
    if (this.isFilterOpened) {
      // this.getLocation();
    }
  }

  filter() {
    this.globalFilter = '';
    let vendorNameList: String[] = [];
    this.filterMap.clear();
    this.filterMap.set('ROLE_NAME', 'SUBCONTRACTOR');
    this.filterMap.set('CLIENT_INVITEE_ID', this.loginUserId);
    this.filterMap.set('PROJECT_OR_JOB_ID', this.projectDetailForMatchMaking?.id);
    const jsonObject = {};

    if (this.filterIndustryTypeValue) {
      this.filterMap.set('INDUSTRY_TYPE', this.filterIndustryTypeValue?.id);
    }

    if (this.filterVendorName?.length) {
      vendorNameList = this.filterVendorName.map(e => e.id);
      this.filterMap.set('VENDOR_NAME', vendorNameList.toString());
    }

    if (this.location) {
      this.filterMap.set('LATITUDE', this.latitude);
      this.filterMap.set('LONGITUDE', this.longitude);
      this.filterMap.set('SUBCONTRACTOR_LOCATION', this.location);
    }

    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);

    this.dataTableParam = {
      offset: 0,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    console.log('datatableparams', this.dataTableParam);
    console.log('datatableparams', this.globalFilter);

    if (this.filterIndustryTypeValue || this.filterVendorName?.length || this.location) {
      this.loadSubcontractor();
    } else {
      this.loadSubcontractorByMatchMaking();
    }
  }

  onFilterClear() {
    this.filterIndustryTypeValue = null;
    this.filterRegionValue = '';
    this.filterVendorName = [];
    this.location = '';
    this.longitude = '';
    this.latitude = '';
    this.loadSubcontractorByMatchMaking();
  }

  private getRegionList() {
    this.queryParam = this.prepareQueryParam(this.dataParam);
    this.regionService.getRegionList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.region = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  private getIndustryTypeList() {
    this.queryParam = this.prepareQueryParam(this.dataParam);
    this.industryTypeService.getIndustryTypeList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.industryType = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  filterRegion(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.region.length; i++) {
      const region = this.region[i];
      if (region.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(region);
      }
    }
    this.filteredRegion = filtered;
    this.filteredRegion = this.filteredRegion.sort();
  }

  filterIndustryType(event) {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.industryType.length; i++) {
      const industryType = this.industryType[i];
      if (industryType.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(industryType);
      }
    }
    this.filteredIndustryType = filtered;
    this.filteredIndustryType = this.filteredIndustryType.sort();
  }

  getSubcontractorByName(name): void {
    console.log(name);
    this.subcontractorNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.subcontractorNameParams);
    this.filterLeftPanelService.getSubcontractorByNameVirtualScroll(this.queryParam).subscribe(data => {
      if (data) {
        console.log(data);
        this.subcontractorNameList = data.data;
        this.subcontractorNameList = this.subcontractorNameList.sort();
      }
    });
  }

  getFullName(data: any): any {
    return data.first + ' ' + data.last;
  }


  loadSubcontractor() {
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.userService.userSelection(this.queryParam).subscribe(
      // this.userService.userSelectionCustom(this.queryParam).subscribe(
      data => {
        if (data.data) {
          this.subcontractors = data.data.result;
          // this.subcontractorLength = data.data.result.length;
          if (this.subcontractors.length === 0) {
            this.emptyFlag = true;
          }
          else {
            this.emptyFlag = false;
          }
          this.totalRecords = data.data.totalRecords;
          this.offset = data.data.first;
          this.imageUrl = environment.baseURL + '/file/getById?fileId=';
        } else {
          this.subcontractors = data.data;
        }
      }
    );
  }

  loadSubcontractorByMatchMaking() {
    this.globalFilter = `{"ROLE_NAME": "SUBCONTRACTOR","CLIENT_INVITEE_ID": "${this.loginUserId}", "PROJECT_OR_JOB_ID":"${this.projectDetailForMatchMaking?.id}"}`;
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    // this.userService.userSelection(this.queryParam).subscribe(
    this.userService.userSelectionCustom(this.queryParam).subscribe(
      data => {
        if (data.data) {
          this.subcontractors = data.data.result;
          // this.subcontractorLength = data.data.result.length;
          if (this.subcontractors.length === 0) {
            this.emptyFlag = true;
          }
          else {
            this.emptyFlag = false;
          }
          this.totalRecords = data.data.totalRecords;
          this.imageUrl = environment.baseURL + '/file/getById?fileId=';
        } else {
          this.subcontractors = data.data;
        }
      }
    );
  }

  onSelectSubcontractor(subcontractor) {
    if (this.selectedSubcontractor.length < 15) {
      this.selectedSubcontractor.push(subcontractor);
      this.flag = 1;
    }
  }

  removeFromSelectedSubcontractor(subcontractor) {
    const index = this.selectedSubcontractor.indexOf(subcontractor);
    if (index !== -1) {
      this.selectedSubcontractor.splice(index, 1);
      this.flag = 0;
    }
  }

  isSubcontractorSelected(id) {
    let count = 0;
    this.selectedSubcontractor.forEach(
      function (subcontractor) {
        if (subcontractor.user.id === id) {
          count++;
        }
      }
    );
    if (count > 0) {
      return true;
    }
    else {
      return false;
    }
  }

  public paginate(event: any): void {
    this.offset = event.first / event.rows;
    this.dataTableParam = {
      offset: this.offset,
      size: this.size = event.rows ? event.rows : this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: 1,
      searchText: this.globalFilter
    };

    if (this.filterIndustryTypeValue || this.filterVendorName?.length || this.location) {
      this.loadSubcontractor();
    } else {
      this.loadSubcontractorByMatchMaking();
    }
  }

  initializeForm() {
    this.subcontractorSelectionForm = this._formBuilder.group({
      id: [],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      projectId: [],
      inviteeList: [],
      otherInviteeList: [],
    });
  }

  validateEmail(event: any[]): void {
    const EMAIL_REGEXP = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
    event.forEach(element => {
      this.email = element;
      if (this.email !== '' && !EMAIL_REGEXP.test(this.email)) {
        this.emailFlag = true;
        this._notificationService.error('', this.email + ' is not a valid email');
      }
      else {
        this.emailFlag = false;
      }
    });
  }

  onInvite() {
    this.projectBasicDetail = this.localStorageService.getItem('addProjectDetail');
    this.subcontractorSelectionForm.value.leadId = this.projectBasicDetail.id;
    this.subcontractorSelectionForm.value.otherInviteeList = this.otherInvitees;
    for (let i = 0; i < this.selectedSubcontractor.length; i++) {
      this.email = this.selectedSubcontractor[i].user.email;
      this.selectedSubcontractorEmail.push(this.email);
      this.subcontractorSelectionForm.value.inviteeList = this.selectedSubcontractorEmail;
    }

    if (this.selectedSubcontractor.length === 0 && this.otherInvitees.length === 0) {
      this._notificationService.error(this.translator.instant('no.subcontractor.selected'), '');
    }
    else {
      const inviteeDetail = JSON.stringify(this.subcontractorSelectionForm.value);
      this.postProjectService.projectInvitee(inviteeDetail).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('subcontractor.invited'), '');
          this.inviteFlag = true;
          this.localStorageService.setItem('inviteSubcontractorFlage', this.inviteFlag);
          this.localStorageService.setItem('InvitedSubcontracor', this.selectedSubcontractor);
          this.selectedSubcontractor.length = 0;
          this.otherInvitees = [];
        }
        else {
          this._notificationService.error(data.message, '');
        }
      });
    }
  }

  postNewProject() {
    const project = this.localStorageService.getItem('addProjectDetail');
    if (project.type === 'PRIVATE_REQUEST' && !this.localStorageService.getItem('inviteSubcontractorFlage')) {
      this._notificationService.error(this.translator.instant('invite.error'), '');
    }
    else {
      this.localStorageService.removeItem('InvitedSubcontracor');
      this.localStorageService.removeItem('inviteSubcontractorFlage');
      this.onRemoveLocalStorage();
      const currentUrl = this.router.url;
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
    }
  }

  gotoDeshboard() {
    const project = this.localStorageService.getItem('addProjectDetail');
    if (project.type === 'PRIVATE_REQUEST' && !this.localStorageService.getItem('inviteSubcontractorFlage')) {
      this._notificationService.error(this.translator.instant('invite.error'), '');
    }
    else {
      this.onRemoveLocalStorage();
      this.router.navigate([PATH_CONSTANTS.CLIENT_DASHBOARD]);
    }
  }

  gotoProjectDetail() {
    this.localStorageService.removeItem('currentProjectStep');
    this.localStorageService.removeItem('addProjectDetail');
    this.router.navigate([PATH_CONSTANTS.CLIENT_PROJECT_DETAILS]);
  }

  onRemoveLocalStorage() {
    this.localStorageService.removeItem('addNewProjectFormValue');
    this.localStorageService.removeItem('selectedJobsiteOfDropdown');
    this.localStorageService.removeItem('Data0');
    this.localStorageService.removeItem('addProjectDetail');
    this.localStorageService.removeItem('jobsiteScreen');
    this.localStorageService.removeItem('currentProjectStep');
    this.localStorageService.removeItem('unselectedLineItem');
    this.localStorageService.removeItem('isEditMode');
  }

  previous() {
    this.localStorageService.setItem('currentProjectStep', 3, false);
    this.postProjectService.currentPostProjectStep.next(3);
  }


  getAddressFromAutocompleteMapsApi(event): void {
    console.log(event);
    this.latitude = event.get('LATITUDE');
    this.longitude = event.get('LONGITUDE');
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
          this.location = place.formatted_address;
          const jsonObject = {};
          this.getAddressFromAutocompleteMapsApi(this.filterMap);

          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
        });
      });
    });


  }

  redirectToSubcontractor(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_SUBCONTRACTOR_PROFILE + '?user=' + id);
  }

  checkSubcontractorInvitedOrNot(id): boolean {
    const invitedSubcontractor = this.localStorageService.getItem('InvitedSubcontracor');
    if (invitedSubcontractor) {
      if (!(invitedSubcontractor.some((subcontractor) => subcontractor.user.id === id))) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return true;
    }

  }

}
