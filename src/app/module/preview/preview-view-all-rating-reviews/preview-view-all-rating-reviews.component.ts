import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { RantingAndReviewService } from 'src/app/service/rating-and-review/ranting-and-review.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { User } from 'src/app/shared/vo/User';
import { environment } from 'src/environments/environment';


@Component({
  selector: 'app-preview-view-all-rating-reviews',
  templateUrl: './preview-view-all-rating-reviews.component.html',
  styleUrls: ['./preview-view-all-rating-reviews.component.css']
})
export class PreviewViewAllRatingReviewsComponent implements OnInit {

  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  type: string;
  loggedInUserId: string;
  loggedInUser: User;
  user: User;
  rolename: any;
  loggedInUserName: string;
  usernameLabel: string;
  ratingAndReviewList: any[];
  workerDto: any;
  subcontractor: any;
  offset = 0;
  datatableParam;
  totalRecords = 0;
  queryParam;
  sortField = 'CREATED_DATE';
  sortOrder = 0;
  globalFilter;
  loginUser: any;
  client: any;
  profileImage: any;
  singleImageView: any;
  displayAvatar: boolean = false;
  avatarColor: string = '#2196F3';
  constructor(
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    public ratingReviewService: RantingAndReviewService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private _subContractorProfileServices: SubcontractorProfileService
  ) {

    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
      this.loggedInUserName = this.user.firstName + ' ' + this.user.lastName;
    } else {
      this.loggedInUserName = 'Guest';
    }

    this.ratingAndReviewList = [];
    this.loggedInUserId = localStorageService.getLoginUserId();
    this.loginUser = localStorageService.getLoginUserObject();

    this.datatableParam = {
      offset: this.offset,
      size: 10000,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter = `{"USER_ID":"${this.loggedInUserId}" , "IS_ACCEPTED_BY_ADMIN":"false"}`
    };
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.type = params.type;
        this.loggedInUserId = params.id;
      });

    this.fetchRatingData();
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

  fetchRatingData(): any {
    switch (this.type) {
      case 'client':
        this.fetchClientRatingData();
        break;
      case 'subcontractor':
        this.fetchSubcontractorRatingData();
        break;
      case 'worker':
        this.fetchWorkerRatingData();
        break;
    }

  }


  // tslint:disable-next-line: typedef
  prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  fetchClientRatingData(): void {

    this.fetchSubcontractorRatingData();

  }

  fetchSubcontractorRatingData(): void {

    const filterMap = new Map();

    filterMap.set('SUBMITTED_TO', this.loggedInUserId);
    filterMap.set('IS_ACCEPTED_BY_ADMIN', false);

    const jsonObject = {};

    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.ratingReviewService.getRatingReviewList(this.queryParam).subscribe(
      data => {

        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.ratingAndReviewList = data.data.result;
            this.totalRecords = data.data.totalRecords;
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {

      }
    );
  }

  fetchWorkerRatingData(): void {

    this.fetchSubcontractorRatingData();

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
    this.fetchRatingData();
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


      }
    );
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
          // this._notificationService.error(this.translator.instant('subcontractor.profile.error'), '');
        }
      },
      error => {

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
          // this.profileImage=this.workerDto.
        } else {
        }
      },
      error => {

      }
    );
  }
}
