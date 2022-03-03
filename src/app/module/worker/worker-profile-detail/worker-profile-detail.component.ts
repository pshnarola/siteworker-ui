import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ClipboardService } from 'ngx-clipboard';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { WorkerProfileDetailService } from 'src/app/service/worker-services/worker-profile-detail/worker-profile-detail.service';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-worker-profile-detail',
  templateUrl: './worker-profile-detail.component.html',
  styleUrls: ['./worker-profile-detail.component.css']
})
export class WorkerProfileDetailComponent implements OnInit, OnDestroy {

  userId;
  logInUserId;
  workerDetail;
  profileImage;
  imageUrl;
  lat = 0;
  lng = 0;
  previewProfile = false;

  externalLink;
  constructor(
    private captionChangeService: HeaderManagementService,
    private _workerProfile: WorkerProfileDetailService,
    private notificationService: UINotificationService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private clipboardService: ClipboardService,
  ) {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.logInUserId = this.localStorageService.getLoginUserId();
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.userId = params.user;
        if (this.userId === this.logInUserId) {
          this.previewProfile = false;
        } else {
          this.previewProfile = true;
        }
        this.getWorkerDetailByUserId(this.userId);
      }

    );
  }

  getWorkerDetailByUserId(id): void {
    this._workerProfile.getWorkerDetail(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.workerDetail = data.data;
          this.externalLink = CommonUtil.createExternalURLForProfile(this.workerDetail.basicProfile.user.firstName, this.userId, 'preview-worker-profile-detail');
          this.lat = this.workerDetail.basicProfile.latitude;
          this.lng = this.workerDetail.basicProfile.longitude;
          if (this.workerDetail.basicProfile.photo) {
            this.profileImage = this.workerDetail.basicProfile.photo;
            this.imageUrl = environment.baseURL + '/file/getById?fileId=';
          }
        }
      });
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
  copyExternalLink() {
    this.clipboardService.copyFromContent(this.externalLink);
    this.notificationService.success('Copied to clipboard', '');
  }
}
