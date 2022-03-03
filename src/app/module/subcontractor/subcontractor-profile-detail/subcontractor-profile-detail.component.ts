import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClipboardService } from 'ngx-clipboard';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-subcontractor-profile-detail',
  templateUrl: './subcontractor-profile-detail.component.html',
  styleUrls: ['./subcontractor-profile-detail.component.css']
})
export class SubcontractorProfileDetailComponent implements OnInit, OnDestroy {
  logInUserId: any;
  userId;
  subcontractorDetail = null;
  profileImage;
  imageUrl;
  lat = 0;
  lng = 0;
  previewProfile = false;
  externalLink: string;

  constructor(
    private captionChangeService: HeaderManagementService,
    private _subcontractorProfileDetail: SubcontractorProfileService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private clipboardService: ClipboardService
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.logInUserId = this.localStorageService.getLoginUserId();
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
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
  }

  getSubcontractorDetailByUserId(id): void {
    this._subcontractorProfileDetail.getSubcontractorProfileDetailById(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractorDetail = data.data;
          this.externalLink = CommonUtil.createExternalURLForProfile(this.subcontractorDetail.basicProfile.user.firstName, id, 'preview-subcontractor-profile-detail');
          this.lat = this.subcontractorDetail.basicProfile.latitude;
          this.lng = this.subcontractorDetail.basicProfile.longitude;
          if (this.subcontractorDetail.basicProfile.photo) {
            this.profileImage = this.subcontractorDetail.basicProfile.photo;
            this.imageUrl = environment.baseURL + '/file/getById?fileId=';
          }
        }
      });
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

  copyExternalLink() {
    this.clipboardService.copyFromContent(this.externalLink);
    this.notificationService.success('Copied to clipboard', '');
  }

}
