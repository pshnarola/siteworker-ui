import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { WorkerProfileDetailService } from 'src/app/service/worker-services/worker-profile-detail/worker-profile-detail.service';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-preview-worker-profile-external',
  templateUrl: './preview-worker-profile-external.component.html',
  styleUrls: ['./preview-worker-profile-external.component.css']
})
export class PreviewWorkerProfileExternalComponent implements OnInit {
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
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private translator: TranslateService,
    private workerProfileService: WorkerProfileDetailService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
  ) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.userId = params.id;
        this.getWorkerDetailByUserId(this.userId);
      }
    );
    this.renderer.setAttribute(this.document.body, 'class', 'worker-theme');
  }
  getWorkerDetailByUserId(id): void {
    this.workerProfileService.getViewWorkerProfileDetailPublic(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.workerDetail = data.data;
          this.lat = this.workerDetail.basicProfile.latitude;
          this.lng = this.workerDetail.basicProfile.longitude;
          // tslint:disable-next-line: max-line-length
          if (this.workerDetail.basicProfile.mobilePhone) {
            this.workerMobilePhone = this.workerDetail.basicProfile.mobilePhone;
            this.workerMobilePhone = this.getSubstring(0, 5, this.workerMobilePhone.length - 2, this.workerMobilePhone.length - 6, this.workerMobilePhone.length, this.workerMobilePhone);
          }
          if (this.workerDetail.basicProfile.user.email) {
            this.workerEmail = this.workerDetail.basicProfile.user.email;
            this.workerEmail = this.getSubstring(0, 3, this.workerEmail.length - 2, this.workerEmail.length - 6, this.workerEmail.length, this.workerEmail);
          }
          // tslint:disable-next-line: max-line-length
          if (this.workerDetail.basicProfile.photo) {
            this.profileImages = this.workerDetail.basicProfile.photo;
            this.imageUrl = environment.baseURL + '/file/getById?fileId=';
          }
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
  onTermsOfUseClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_TERMS_OF_USE);
  }

  onPrivacyPolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_PRIVACY_POLICY);
  }

  onCookiePolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_COOKIE_POLICY);
  }
  redirectToSignIn(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.LOGIN_PATH_FOR_EXTERNAL);
  }

  redirectToSignUp(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.SIGNUP_PATH_FOR_EXTERNAL);
  }
  redirectToDashboard() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.WORDPRESS_WEBSITE);
  }
}
