import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-preview-subcontractor-profile',
  templateUrl: './preview-subcontractor-profile.component.html',
  styleUrls: ['./preview-subcontractor-profile.component.css']
})
export class PreviewSubcontractorProfileComponent implements OnInit {

  logInUserId: any;
  userId;
  subcontractorDetail;
  profileImage;
  profileImages;
  imageUrl;
  lat;
  lng;
  previewProfile = false;

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
  isPrivate: any;
  subcontractorEmail: any;
  subcontractorMobilePhone: any;
  subcontractorwebsiteURL: any;
  subcontractorDetailWorkPhone: any;

  constructor(
    private captionChangeService: HeaderManagementService,
    private _subcontractorProfileDetail: SubcontractorProfileService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.logInUserId = this.localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.SUBCONTRACTOR_PROFILE);
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.userId = params.user;
        if (this.userId === this.logInUserId) {
          this.previewProfile = false;
        } else {
          this.previewProfile = true;
        }
        this.getSubcontractorDetailByUserId(this.userId);
      });

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

  getSubcontractorDetailByUserId(id): void {
    this._subcontractorProfileDetail.getSubcontractorProfileDetailById(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractorDetail = data.data;
          this.lat = this.subcontractorDetail.basicProfile.latitude;
          this.lng = this.subcontractorDetail.basicProfile.longitude;
          this.subcontractorMobilePhone = this.subcontractorDetail.basicProfile.mobilePhone;
          this.subcontractorEmail = this.subcontractorDetail.basicProfile.user.email;
          this.subcontractorwebsiteURL = this.subcontractorDetail.basicProfile.websiteURL;
          this.subcontractorDetailWorkPhone = this.subcontractorDetail.basicProfile.workPhone;
          if (this.subcontractorDetail.basicProfile.photo) {
            this.profileImages = this.subcontractorDetail.basicProfile.photo;
            this.imageUrl = environment.baseURL + '/file/getById?fileId=';
          }
          if (this.rolename === 'CLIENT') {
            this.getProfileForPrivateOrPublic(this.user.id, this.userId);
          }
        }
      });
  }

  getProfileForPrivateOrPublic(clientId, workerId): void {
    this._subcontractorProfileDetail.getProfileForPrivateOrPublic(clientId, workerId).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.isPrivate = data.data;
          if (this.isPrivate) {
            this.subcontractorMobilePhone = this.subcontractorMobilePhone;
            this.subcontractorEmail = this.subcontractorEmail;
            this.subcontractorwebsiteURL = this.subcontractorwebsiteURL;
            this.subcontractorDetailWorkPhone = this.subcontractorDetailWorkPhone;
          } else {
            // tslint:disable-next-line: max-line-length
            this.subcontractorMobilePhone = this.getSubstring(0, 5, this.subcontractorMobilePhone.length - 2, this.subcontractorMobilePhone.length - 7, this.subcontractorMobilePhone.length, this.subcontractorMobilePhone);
            // tslint:disable-next-line: max-line-length
            this.subcontractorwebsiteURL = this.getSubstring(0, 3, this.subcontractorwebsiteURL.length - 2, this.subcontractorwebsiteURL.length - 5, this.subcontractorwebsiteURL.length, this.subcontractorwebsiteURL);
            // tslint:disable-next-line: max-line-length
            this.subcontractorDetailWorkPhone = this.getSubstring(0, 5, this.subcontractorDetailWorkPhone.length - 2, this.subcontractorDetailWorkPhone.length - 7, this.subcontractorDetailWorkPhone.length, this.subcontractorDetailWorkPhone);
            // tslint:disable-next-line: max-line-length
            this.subcontractorEmail = this.getSubstring(0, 3, this.subcontractorEmail.length - 2, this.subcontractorEmail.length - 5, this.subcontractorEmail.length, this.subcontractorEmail);
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


  onViewAllProjectClick(userId) {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_PROJECT + '?type=subcontractor&id=' + userId);
  }

  onViewAllRatingReviewClick(userId) {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_RATING_REVIEW + '?type=subcontractor&id=' + userId);
  }

  onViewAllReferncesClick(userId) {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_REFERENCES + '?type=subcontractor&id=' + userId);
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
