import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { PreviewServicesService } from 'src/app/service/preview-services/preview-services.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-preview-worker-profile',
  templateUrl: './preview-worker-profile.component.html',
  styleUrls: ['./preview-worker-profile.component.css']
})
export class PreviewWorkerProfileComponent implements OnInit {
  userId;
  logInUserId;
  workerDetail;
  profileImage;
  profileImages;
  imageUrl;
  lat = 0;
  lng = 0;
  previewProfile = true;
  rolename: any;
  usernameLabel: string;
  displayAvatar: boolean;
  avatarColor = '#2196F3';
  client: any;
  singleImageView: string;
  subcontractor: any;
  workerDto: any;
  user: any;
  loggedInUserName: string;
  workerMobilePhone: string;

  isPrivate = false;
  workerEmail: string;

  constructor(
    private _workerProfile: PreviewServicesService,
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private _subContractorProfileServices: SubcontractorProfileService,
    private notificationService: UINotificationService,
    private translator: TranslateService,

  ) {
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe(
      (params: Params) => {
        this.userId = params.user;
        this.getWorkerDetailByUserId(this.userId);
      }
    );

    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
      this.loggedInUserName = this.user.firstName + ' ' + this.user.lastName;
    } else {
      this.loggedInUserName = 'Guest';
    }

    this.logInUserId = this.localStorageService.getLoginUserId();
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
      }
    );
  }
  getLogedInSubcontractorDetail(id) {
    this._subContractorProfileServices.getSubcontractorDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractor = data.data;
          this.profileImage = this.subcontractor.subcontractorProfile.photo;
          this.usernameLabel = this.subcontractor.subcontractorProfile.user.firstName.substring(0, 1) + this.subcontractor.subcontractorProfile.user.lastName.substring(0, 1);
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
          this.usernameLabel = this.workerDto.workerProfile.user.firstName.substring(0, 1) + this.workerDto.workerProfile.user.lastName.substring(0, 1);
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


  getWorkerDetailByUserId(id): void {
    this._workerProfile.getWorkerDetail(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.workerDetail = data.data;
          this.lat = this.workerDetail.basicProfile.latitude;
          this.lng = this.workerDetail.basicProfile.longitude;
          this.workerMobilePhone = this.workerDetail.basicProfile.mobilePhone;
          this.workerEmail = this.workerDetail.basicProfile.user.email;
          if (this.workerDetail.basicProfile.photo) {
            this.profileImages = this.workerDetail.basicProfile.photo;
            this.imageUrl = environment.baseURL + '/file/getById?fileId=';
          }
          if (this.rolename === 'CLIENT') {
            this.getProfileForPrivateOrPublic(this.user.id, this.userId);
          }
        }
      });
  }

  getProfileForPrivateOrPublic(clientId, workerId): void {
    this._workerProfile.getProfileForPrivateOrPublic(clientId, workerId).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.isPrivate = data.data;
          if (this.isPrivate) {
            this.workerMobilePhone = this.workerMobilePhone;
          } else {
            // tslint:disable-next-line: max-line-length
            this.workerMobilePhone = this.getSubstring(0, 5, this.workerMobilePhone.length - 2, this.workerMobilePhone.length - 6, this.workerMobilePhone.length, this.workerMobilePhone);
            // tslint:disable-next-line: max-line-length
            this.workerEmail = this.getSubstring(0, 3, this.workerEmail.length - 2, this.workerEmail.length - 6, this.workerEmail.length, this.workerEmail);
            this.isPrivate = false;
          }
        } else {
          this.isPrivate = false;
        }
      });
  }

  getSubstring(startindexFirst, startindexSecond, endindexFirst, aistrickLength, totalLength, field): any {
    let aestrick = '';
    for (let index = 0; index < aistrickLength; index++) {
      aestrick = aestrick + '*';
    }
    field =
      field.substring(startindexFirst, startindexSecond)
      + aestrick +
      field.substring(endindexFirst, totalLength);

    return field;
  }

  onViewAllRatingReviewClick(userId) {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_RATING_REVIEW + '?type=worker&id=' + userId);
  }

  onViewAllJobClick(userId) {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_JOB + '?type=worker&id=' + userId);
  }

  onViewAllReferncesClick(userId) {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_REFERENCES + '?type=worker&id=' + userId);
  }

  onViewAllWorkExperienceClick(userId) {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_WORK_EXPERIENCE + '?type=worker&id=' + userId);
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
