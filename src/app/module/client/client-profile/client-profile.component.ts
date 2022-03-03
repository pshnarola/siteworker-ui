import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.css']
})
export class ClientProfileComponent implements OnInit, OnDestroy {

  userId;
  logInUserId;
  clientDetail;
  profileImage;
  imageUrl;
  lat = 0;
  lng = 0;
  previewProfile = false;

  constructor(
    private captionChangeService: HeaderManagementService,
    private _clientProfile: ClientProfileService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute
  ) {
    this.logInUserId = this.localStorageService.getLoginUserId();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_PROFILE);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_PROFILE);
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.userId = params.user;
        if (this.userId === this.logInUserId) {
          this.previewProfile = false;
        } else {
          this.previewProfile = true;
        }
        this.getClientDetailByUserId(this.userId);
      }
    );
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  getClientDetailByUserId(id): void {
    this._clientProfile.getClientProfileDetailById(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.clientDetail = data.data;
          this.lat = this.clientDetail.basicProfile.latitude;
          this.lng = this.clientDetail.basicProfile.longitude;
          if (this.clientDetail.basicProfile.photo) {
            this.profileImage = this.clientDetail.basicProfile.photo;
            this.imageUrl = environment.baseURL + '/file/getById?fileId=';
          }
        }
      });
  }

  onViewAllProjectClick(userId) {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_PROJECT + '?type=client&id=' + userId);
  }

  onViewAllJobClick(userId) {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_JOB + '?type=client&id=' + userId);
  }

  onViewAllRatingReviewClick(userId) {
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_ALL_RATING_REVIEW + '?type=client&id=' + userId);
  }

}
