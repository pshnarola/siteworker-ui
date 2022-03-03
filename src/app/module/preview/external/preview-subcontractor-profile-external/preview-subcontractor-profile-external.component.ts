import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-preview-subcontractor-profile-external',
  templateUrl: './preview-subcontractor-profile-external.component.html',
  styleUrls: ['./preview-subcontractor-profile-external.component.css']
})
export class PreviewSubcontractorProfileExternalComponent implements OnInit {


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
    private subcontractorProfileDetail: SubcontractorProfileService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.logInUserId = this.localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.SUBCONTRACTOR_PROFILE);
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.userId = params.id;
        if (this.userId === this.logInUserId) {
          this.previewProfile = false;
        } else {
          this.previewProfile = true;
        }
        this.getSubcontractorDetailByUserId(this.userId);
      });

    this.renderer.setAttribute(this.document.body, 'class', 'subcontractor-theme');
  }

  getSubcontractorDetailByUserId(id): void {
    this.subcontractorProfileDetail.getSubcontractorPublicProfileDetailById(id).subscribe(
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
          this.getProfileForPrivateOrPublic();
        }
      });
  }

  getProfileForPrivateOrPublic(): void {
    if (this.subcontractorMobilePhone) {
      // tslint:disable-next-line: max-line-length
      this.subcontractorMobilePhone = this.getSubstring(0, 5, this.subcontractorMobilePhone.length - 2, this.subcontractorMobilePhone.length - 7, this.subcontractorMobilePhone.length, this.subcontractorMobilePhone);
    }
    if (this.subcontractorwebsiteURL) {
      // tslint:disable-next-line: max-line-length
      this.subcontractorwebsiteURL = this.getSubstring(0, 3, this.subcontractorwebsiteURL.length - 2, this.subcontractorwebsiteURL.length - 5, this.subcontractorwebsiteURL.length, this.subcontractorwebsiteURL);
    }
    if (this.subcontractorDetailWorkPhone) {
      // tslint:disable-next-line: max-line-length
      this.subcontractorDetailWorkPhone = this.getSubstring(0, 5, this.subcontractorDetailWorkPhone.length - 2, this.subcontractorDetailWorkPhone.length - 7, this.subcontractorDetailWorkPhone.length, this.subcontractorDetailWorkPhone);
    }
    if (this.subcontractorEmail) {
      // tslint:disable-next-line: max-line-length
      this.subcontractorEmail = this.getSubstring(0, 3, this.subcontractorEmail.length - 2, this.subcontractorEmail.length - 5, this.subcontractorEmail.length, this.subcontractorEmail);
    }
    this.isPrivate = false;
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


  onViewAllProjectClick(userId): any {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_PROJECT + '?type=subcontractor&id=' + userId);
  }

  onViewAllRatingReviewClick(userId): any {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_RATING_REVIEW + '?type=subcontractor&id=' + userId);
  }

  onViewAllReferncesClick(userId): any {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_REFERENCES + '?type=subcontractor&id=' + userId);
  }

  onTermsOfUseClick(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_TERMS_OF_USE);
  }

  onPrivacyPolicyClick(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_PRIVACY_POLICY);
  }

  onCookiePolicyClick(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_COOKIE_POLICY);
  }

  redirectToSignIn(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.LOGIN_PATH_FOR_EXTERNAL);
  }

  redirectToSignUp(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.SIGNUP_PATH_FOR_EXTERNAL);
  }

  redirectToDashboard(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.WORDPRESS_WEBSITE);
  }
}
