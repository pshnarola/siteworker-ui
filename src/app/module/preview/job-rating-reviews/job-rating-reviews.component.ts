import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, Subject } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { RantingAndReviewService } from 'src/app/service/rating-and-review/ranting-and-review.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { environment } from 'src/environments/environment';
import { ClientRatingDTO } from '../../admin/client-rating-dto';
import { RatingDTO } from '../../admin/rating-dto';
import { WorkerRatingDTO } from '../../admin/worker-rating-dto';
import { JobDetails } from '../../client/post-job/job-details';


@Component({
  selector: 'app-job-rating-reviews',
  templateUrl: './job-rating-reviews.component.html',
  styleUrls: ['./job-rating-reviews.component.css']
})
export class JobRatingReviewsComponent implements OnInit {
  columns = [
    { label: 'Given by Client to Worker', value: 'clientToWorker', sortable: true },
    { label: 'Given by Worker to Client', value: 'workerToClient', sortable: true }
  ];
  myForm: FormGroup;
  status = [{ label: 'Reported to Admin', value: 'REPORTED_TO_ADMIN' }];
  filteredStatus: any[];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  datatableParam = new DataTableParam();
  jobDetail: JobDetails;
  globalFilter;
  queryParam: URLSearchParams;
  jobRatingAndReviewList = [];
  rating = 4;
  submittedByClientRatingList = [];
  submittedByworkerRatingList = [];
  submittedToworkerRatingList = [];
  submittedToclientRatingList = [];
  ratingDTO: RatingDTO[] = [];
  clientRatingDTO = new ClientRatingDTO();
  workerRatingDTO = new WorkerRatingDTO();
  filterFlag: boolean;
  groupedJobRating: any[] = [];

  user: any;
  rolename: any;
  loggedInUserName: string;
  usernameLabel: string;
  displayAvatar: boolean;
  avatarColor: string = '#2196F3';
  client: any;
  profileImage: any;
  singleImageView: string;
  workerDto: any;
  subcontractor: any;

  userAccess: any;
  showButtons = true;
  btnDisabled = false;

  constructor(private captionChangeService: HeaderManagementService,
    private ratingReviewService: RantingAndReviewService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private _subContractorProfileServices: SubcontractorProfileService,
    private localStorageService: LocalStorageService,
    private translator: TranslateService,
    private confirmDialogService: ConfirmDialogueService,
    private notificationService: UINotificationService) {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.datatableParam = {
      offset: 0,
      size: this.size,
      sortField: '',
      sortOrder: 1,
      searchText: null
    };

    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
      this.loggedInUserName = this.user.firstName + ' ' + this.user.lastName;
    } else {
      this.loggedInUserName = 'Guest';
    }
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.getRatingReviewList();


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


    this.userAccess = this.localStorageService.getItem('userAccess');
    if (this.userAccess) {
      this.menuAccess();
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

  groupBy(): void {
    this.groupedJobRating = [];
    const records = this.jobRatingAndReviewList;

    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.jobDetail.id,
        null,
        null,
        () => new ReplaySubject()
      ),
      concatMap(
        object => object.pipe(
          toArray(),
          map(obj =>
            ({ key: object.key, value: obj })
          ))
      )
    );

    result.subscribe(x => {
      this.groupedJobRating.push(x);
    });

    records.forEach(x => { pipedRecords.next(x); });
    pipedRecords.complete();

  }


  filterStatus(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.status.length; i++) {
      const status = this.status[i];
      if (status.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(status);
      }
    }
    this.filteredStatus = filtered;
    this.filteredStatus = this.filteredStatus.sort();
  }

  prepareQueryParam(paramObject) {

    const params = new URLSearchParams;

    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getRatingReviewList(): void {
    const filterMap = new Map();
    filterMap.set('IS_REPORT_TO_ADMIN', true);
    filterMap.set('POST_TYPE', 'JOBS');
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.ratingDTO.length = 0;
    this.ratingReviewService.getRatingReviewList(this.queryParam).subscribe(
      data => {

        this.jobRatingAndReviewList.length = 0;
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.jobRatingAndReviewList = data.data.result;
            this.groupBy();
            this.groupedJobRating.forEach(data => {
              this.submittedByClientRatingList.length = 0;
              this.submittedByworkerRatingList.length = 0;
              this.submittedToclientRatingList.length = 0;
              this.submittedToworkerRatingList.length = 0;
              data.value.forEach(dataElement => {
                if (dataElement.submittedBy.roles[0].roleName === 'CLIENT') {
                  this.submittedByClientRatingList.push(dataElement);
                }
                if (dataElement.submittedBy.roles[0].roleName === 'WORKER') {
                  this.submittedByworkerRatingList.push(dataElement);
                }
                if (dataElement.submittedTo.roles[0].roleName === 'WORKER') {
                  this.submittedToworkerRatingList.push(dataElement);
                }
                if (dataElement.submittedTo.roles[0].roleName === 'CLIENT') {
                  this.submittedToclientRatingList.push(dataElement);
                }
              });
              this.submittedByClientRatingList.forEach(elementClientBy => {
                this.submittedByworkerRatingList.forEach(elementWorkerBy => {
                  if ((elementClientBy.submittedBy.id === elementWorkerBy.submittedTo.id) &&
                    (elementClientBy.submittedTo.id === elementWorkerBy.submittedBy.id)) {
                    const temp = {
                      clientRating: {
                        rating: elementClientBy.rating,
                        ratingText: elementClientBy.ratingText,
                        name: elementClientBy.submittedBy.firstName,
                        createdDate: elementClientBy.createdDate,
                        submittedBy: elementClientBy
                      },
                      workerRating: {
                        rating: elementWorkerBy.rating,
                        ratingText: elementWorkerBy.ratingText,
                        name: elementWorkerBy.submittedBy.firstName,
                        createdDate: elementWorkerBy.createdDate,
                        submittedBy: elementWorkerBy
                      }
                    };
                    this.ratingDTO.push(temp);
                  }
                });
              });

              this.submittedToclientRatingList.forEach((element) => {
                if (!this.submittedByClientRatingList.some((item) => item.submittedTo.id === element.submittedBy.id)) {
                  const temp1 = {
                    clientRating: {
                      rating: null,
                      ratingText: null,
                      name: null,
                      createdDate: null,
                      submittedBy: element
                    },
                    workerRating: {
                      rating: element.rating,
                      ratingText: element.ratingText,
                      name: element.submittedBy.firstName,
                      createdDate: element.createdDate,
                      submittedBy: element
                    }
                  };
                  this.ratingDTO.push(temp1);
                }
              });

              this.submittedToworkerRatingList.forEach((element) => {
                if (!this.submittedByworkerRatingList.some((item) => item.submittedBy.id === element.submittedTo.id)) {
                  const temp2 = {
                    clientRating: {
                      rating: element.rating,
                      ratingText: element.ratingText,
                      name: element.submittedBy.firstName,
                      createdDate: element.createdDate,
                      submittedBy: element
                    },
                    workerRating: {
                      rating: null,
                      ratingText: null,
                      name: null,
                      createdDate: null,
                      submittedBy: null
                    }
                  };
                  this.ratingDTO.push(temp2);
                }
              });
            });


            this.totalRecords = this.ratingDTO.length;
          }
        } else {
          this.notificationService.error(data, '');
        }
      },
      error => {

      }
    );
  }

  acceptRating(data) {

    this.ratingReviewService.acceptRatingReview(data.submittedBy.id).subscribe(e => {

      if (e.statusCode === '200' && e.message === 'OK') {
        this.notificationService.success(this.translator.instant('review.accepted'), '');
        this.getRatingReviewList();
      }
    });
  }
  rejectRating(data) {

    this.ratingReviewService.rejectRatingReview(data.submittedBy.id).subscribe(e => {

      if (e.statusCode === '200' && e.message === 'OK') {
        this.notificationService.success(this.translator.instant('review.rejected'), '');
        this.getRatingReviewList();
      }
    });
  }
  openAcceptDialog(data) {
    let options = null;
    const message = this.translator.instant('are.you.sure.you.want.to.accept');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')

    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.acceptRating(data);
      }
    });
  }
  openRejectDialog(data) {
    let options = null;
    const message = this.translator.instant('are.you.sure.you.want.to.reject');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')

    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.rejectRating(data);
      }
    });
  }


  menuAccess(): void {
    const accessPermission = this.userAccess.filter(e => e.menuName == 'Jobs');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
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
