import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ReferencesService } from 'src/app/service/subcontractor-services/references/references.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { User } from 'src/app/shared/vo/User';
import { environment } from 'src/environments/environment';
import { Reference } from '../../subcontractor/subcontractor-profile/vo/reference';


@Component({
  selector: 'app-preview-view-all-references',
  templateUrl: './preview-view-all-references.component.html',
  styleUrls: ['./preview-view-all-references.component.css']
})
export class PreviewViewAllReferencesComponent implements OnInit {

  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  type: string;
  loggedInUserId: string;
  userId: string;
  referenceList: Reference[];

  offset = 0;
  datatableParam;
  totalRecords = 0;
  queryParam;
  sortField = 'CREATED_DATE';
  sortOrder = 0;
  globalFilter;
  loginUser: any;
  profileImage: any;
  singleImageView: any;
  displayAvatar: boolean = false;
  avatarColor: string = '#2196F3';
  loggedInUser: User;
  user: User;
  rolename: any;
  loggedInUserName: string;
  usernameLabel: string;
  workerDto: any;
  subcontractor: any;
  client: any;

  statusOfReference = 'APPROVED';

  constructor(
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private referencesService: ReferencesService,
    private _subContractorProfileServices: SubcontractorProfileService,
    private _workerProfileServices: BasicDetailService,
    private _clientProfileService: ClientProfileService
  ) {
    this.loggedInUserId = localStorageService.getLoginUserId();
    this.loginUser = localStorageService.getLoginUserObject();
    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
      this.loggedInUserName = this.user.firstName + ' ' + this.user.lastName;
    } else {
      this.loggedInUserName = 'Guest';
    }

  }

  ngOnInit(): void {
    this.referenceList = [];
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.type = params.type;
        this.userId = params.id;
      });
    this.datatableParam = {
      offset: this.offset,
      size: 10000,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter = `{"USER_ID":"${this.userId}" , "STATUS":"${this.statusOfReference}"}`
    };
    this.fetchReferenceData();
    this.fetchLoginDetails();
  }

  fetchReferenceData(): void {
    switch (this.type) {
      case 'subcontractor':
        this.fetchSubcontractorReferenceData();
        break;
      case 'worker':
        this.fetchWorkerReferenceData();
        break;
    }
  }
  fetchLoginDetails(): void {
    switch (this.rolename) {
      case 'SUBCONTRACTOR':
        this.getLogedInSubcontractorDetail(this.user.id);
        this.avatarColor = '#FCCC00';
        break;
      case 'WORKER':
        this.getLogedInWorkerDetail(this.user.id);
        this.avatarColor = '#FCCC00';
        break;
      case 'CLIENT':
        this.getLogedInClientDetail(this.user.id);
        break;
      default:
        this.usernameLabel = this.user.firstName.substring(0, 1) + this.user.lastName.substring(0, 1);
        this.avatarColor = '#2196F3';
        this.displayAvatar = true;
        break;
    }
  }
  fetchSubcontractorReferenceData(): void {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.referencesService.getReferenceList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.referenceList = data.data.result;
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
          }
        } else {
        }
      },
      error => {
        console.log(error);
      });
  }

  fetchWorkerReferenceData(): void {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.referencesService.getWorkerReferenceList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.referenceList = data.data.result;
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
          }
        } else {
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
      });
  }

  prepareQueryParam(paramObject): any {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  paginate(event: any): void {
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.globalFilter
    };
    this.fetchReferenceData();
  }
  getLogedInSubcontractorDetail(id) {
    this._subContractorProfileServices.getSubcontractorDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractor = data.data;
          this.profileImage = this.subcontractor.subcontractorProfile.photo;
          this.usernameLabel = this.subcontractor.subcontractorProfile.user.firstName.substring(0, 1) + this.subcontractor.subcontractorProfile.user.lastName.substring(0, 1)
          if (this.subcontractor.subcontractorProfile.photo) {
            this.singleImageView = environment.baseURL + '/file/getById?fileId=' + this.profileImage;
            this.displayAvatar = false;
          }
          else {
            this.displayAvatar = true;
          }
        } else {
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }
  getLogedInWorkerDetail(id) {
    this._workerProfileServices.getWorkerDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.workerDto = data.data;
          this.profileImage = this.workerDto.workerProfile.photo;
          this.usernameLabel = this.workerDto.workerProfile.user.firstName.substring(0, 1) + this.workerDto.workerProfile.user.lastName.substring(0, 1)
          if (this.workerDto.workerProfile.photo) {
            this.singleImageView = environment.baseURL + '/file/getById?fileId=' + this.profileImage;
            this.displayAvatar = false;
          }
          else {
            this.displayAvatar = true;
          }
        } else {
        }
      },
      error => {

      }
    );
  }
  getLogedInClientDetail(id) {
    this._clientProfileService.getClientDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.client = data.data;
          this.profileImage = this.client.photo;
          this.avatarColor = '#2196F3';
          this.usernameLabel = this.client.user.firstName.substring(0, 1) + this.client.user.lastName.substring(0, 1);
          if (this.client.photo) {
            this.singleImageView = environment.baseURL + '/file/getById?fileId=' + this.profileImage;
            this.displayAvatar = false;
          }
          else {
            this.displayAvatar = true;
          }
        } else {
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
      }
    );
  }

  onTermsOfUseClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_TERMS_OF_USE);
  }

  onPrivacyPolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_PRIVACY_POLICY);
  }

  onCookiePolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_COOKIE_POLICY);
  }
}
