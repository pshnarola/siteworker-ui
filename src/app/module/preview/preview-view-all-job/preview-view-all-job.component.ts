import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { JobBidService } from 'src/app/service/worker-services/job-bid.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { environment } from 'src/environments/environment';
import { JobDetails } from '../../client/post-job/job-details';

@Component({
  selector: 'app-preview-view-all-job',
  templateUrl: './preview-view-all-job.component.html',
  styleUrls: ['./preview-view-all-job.component.css']
})
export class PreviewViewAllJobComponent implements OnInit {

  type: string;
  loggedInUserId: string;
  loggedInUser: User;
  user: User;
  rolename: any;
  loggedInUserName: string;
  usernameLabel: string;
  filterMap = new Map();
  globalFilter;
  datatableParam: DataTableParam;
  queryParam;
  jobData: JobDetails[];
  offset = 0;
  totalRecords = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  client: any;
  profileImage: any;
  singleImageView: any;
  displayAvatar: boolean = false;
  avatarColor: string = '#2196F3';
  workerDto: any;
  subcontractor: any;

  constructor(
    private localStorageService: LocalStorageService,
    private jobService: JobBidService,
    private clientJobService: JobDetailService,
    private route: ActivatedRoute,
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

    this.jobData = [];
  }

  ngOnInit(): void {

    this.route.queryParams.subscribe(
      (params: Params) => {
        this.type = params.type;
        this.loggedInUserId = params.id;
      });
    this.fetchJobData();
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

  fetchJobData(): void {
    switch (this.type) {
      case 'client':
        this.fetchClientJobData();
        break;
      case 'worker':
        this.fetchWorkerJobData();
        break;
    }
  }

  fetchClientJobData(): void {
    this.filterMap.set('USER_ID', this.loggedInUserId);
    this.filterMap.set('STATUS', ['POSTED', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED'].toString());

    this.jobData = [];
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: 0,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.clientJobService.getJobDetailList(this.queryParam).subscribe(data => {
      this.jobData = data.data.result;
      this.totalRecords = data.data.totalRecords;
      this.offset = data.data.first;
    });
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  paginate(event: any): void {


    switch (this.type) {
      case 'client':
        this.offset = event.first / event.rows;
        this.datatableParam = {
          offset: this.offset,
          size: event.rows ? event.rows : 10,
          sortField: 'CREATED_DATE',
          sortOrder: 0,
          searchText: this.globalFilter
        };
        this.fetchClientJobData();
        break;
      case 'worker':
        this.offset = event.first / event.rows;
        this.datatableParam = {
          offset: this.offset,
          size: event.rows ? event.rows : 10,
          sortField: 'JOB_ACCEPTED_DATE',
          sortOrder: 0,
          searchText: this.globalFilter
        };
        this.fetchWorkerJobData();
        break;
    }


  }

  fetchWorkerJobData(): void {
    this.filterMap.set('WORKER_ID', this.loggedInUserId);
    this.filterMap.set('STATUS', 'ACCEPTED');

    this.jobData = [];
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'JOB_ACCEPTED_DATE',
      sortOrder: 0,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.jobService.getAllJobBidDetail(this.queryParam).subscribe(data => {
      this.jobData = data.data.result;
      this.totalRecords = data.data.totalRecords;
      this.offset = data.data.first;
    });
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
        console.log(error);
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
