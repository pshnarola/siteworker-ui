import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { WorkExpAndEducationService } from 'src/app/service/worker-services/workExpAndEducation/work-exp-and-education.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { User } from 'src/app/shared/vo/User';
import { environment } from 'src/environments/environment';
import { WorkExp } from '../../worker/vo/workExp';



@Component({
  selector: 'app-preview-view-all-work-experience',
  templateUrl: './preview-view-all-work-experience.component.html',
  styleUrls: ['./preview-view-all-work-experience.component.css']
})
export class PreviewViewAllWorkExperienceComponent implements OnInit {

  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  offset = 0;
  datatableParam;
  totalRecords = 0;
  queryParam;
  sortField = 'CREATED_DATE';
  sortOrder = 0;
  globalFilter;
  workerDto: any;
  type: string;
  loggedInUserId: string;
  workExpList: WorkExp[] = [];
  loginUser: any;
  profileImage: any;
  singleImageView: any;
  displayAvatar: boolean = false;
  avatarColor: string = '#15B533';
  usernameLabel: string;
  loggedInUserName: string;

  user: User;
  rolename: any;
  subcontractor: any;
  client: any;

  constructor(
    private route: ActivatedRoute,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    public workerProfileServices: BasicDetailService,
    public workExpService: WorkExpAndEducationService,
    private _subContractorProfileServices: SubcontractorProfileService,
    private _clientProfileService: ClientProfileService
  ) {
    this.loggedInUserId = localStorageService.getLoginUserId();
    this.loginUser = localStorageService.getLoginUserObject();
    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
      this.loggedInUserName = this.user.firstName + ' ' + this.user.lastName;
    } else {
      this.loggedInUserName = 'Guest';
    }
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe(
      (params: Params) => {
        this.type = params.type;
        this.loggedInUserId = params.id;
      });
    this.Experience();
    this.fetchLoginDetails();

  }

  fetchLoginDetails(): void {
    switch (this.rolename) {
      case 'SUBCONTRACTOR':
        this.getLogedInSubcontractorDetail(this.user.id);
        this.avatarColor = '#FCCC00';
        break;
      case 'WORKER':
        this.getLogedInWorkerDetail(this.user.id);
        this.avatarColor = '#FCCC00';
        break;
      case 'CLIENT':
        this.getLogedInClientDetail(this.user.id);
        break;
      default:
        this.usernameLabel = this.user.firstName.substring(0, 1) + this.user.lastName.substring(0, 1);
        this.avatarColor = '#2196F3';
        this.displayAvatar = true;
        break;
    }
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

  getLogedInClientDetail(id) {
    this._clientProfileService.getClientDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.client = data.data;
          this.profileImage = this.client.photo;
          this.avatarColor = '#2196F3';
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

  Experience(): void {
    switch (this.type) {
      case 'worker':
        this.getLogedInWorkerDetail(this.loggedInUserId);
        this.fetchWorkerExperienceData();
        break;
    }
  }

  fetchWorkerExperienceData(): void {
    this.workExpService.getAllWorkerExpDetailByUserId(this.loggedInUserId).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.workExpList = data.data;
        } else {
          this.notificationService.error(data.message, '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
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
    this.Experience();
  }
  getLogedInWorkerDetail(id) {
    this.workerProfileServices.getWorkerDetail(id).subscribe(
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
            this.avatarColor = '#15B533';
            this.displayAvatar = true;
          }
        } else {
        }
      },
      error => {

      }
    );
  }

}
