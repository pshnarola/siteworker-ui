import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-preview-jobsite-list',
  templateUrl: './preview-jobsite-list.component.html',
  styleUrls: ['./preview-jobsite-list.component.css']
})
export class PreviewJobsiteListComponent implements OnInit, OnDestroy {

  previewJobsiteList = [];
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords = 0;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  columns = [
    { label: 'Jobsite Title', value: 'title' },
    { label: 'Jobsite Description', value: 'description' },
    { label: 'Cost', value: 'cost' },
    { label: 'Status', value: 'status' },
    { label: 'Location', value: 'location' },
    { label: 'City', value: 'city' },
    { label: 'State', value: 'state' },
    { label: 'Zipcode', value: 'zipCode' },
  ];
  user: any;
  rolename: any;
  loggedInUserName: string;
  usernameLabel: string;
  displayAvatar: boolean;
  client: any;
  profileImage: any;
  singleImageView: string;
  avatarColor: string;
  workerDto: any;
  subcontractor: any;
  constructor(
    private localStorageService: LocalStorageService,
    private translator: TranslateService,
    private _subcontractorProfileDetail: SubcontractorProfileService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private notificationService: UINotificationService,
  ) { }

  ngOnDestroy(): void {
    this.localStorageService.removeItem('previewJobsiteList');
  }

  ngOnInit(): void {
    if (this.localStorageService.getItem('previewJobsiteList')) {
      this.previewJobsiteList = this.localStorageService.getItem('previewJobsiteList');
      this.totalRecords = this.previewJobsiteList?.length;
    } else {
      this.previewJobsiteList = null;
    }

    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
      this.loggedInUserName = this.user.firstName + ' ' + this.user.lastName;
    } else {
      this.loggedInUserName = 'Guest';
    }

    switch (this.rolename) {
      case 'ADMIN':
        this.usernameLabel = 'AU';
        this.displayAvatar = true;
        break;
      case 'CLIENT':
        this.getLogedInClientDetail(this.user.id);
        break;
      case 'SUBCONTRACTOR':
        this.getLogedInSubcontractorDetail(this.user.id);
        this.avatarColor = '#FCCC00';
        break;
      case 'WORKER':
        this.getLogedInWorkerDetail(this.user.id);
        break;
      default:
        this.usernameLabel = this.user.firstName.substring(0, 1) + this.user.lastName.substring(0, 1);
        this.avatarColor = '#2196F3';
        this.displayAvatar = true;
        break;
    }
  }


  onJobSiteClick(id) {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOBSITE + "?jobsite=" + id);
  }

  getLogedInClientDetail(id) {
    this._clientProfileService.getClientDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.client = data.data;
          this.profileImage = this.client.photo;
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
  getLogedInSubcontractorDetail(id) {
    this._subcontractorProfileDetail.getSubcontractorDetail(id).subscribe(
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
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }



}
