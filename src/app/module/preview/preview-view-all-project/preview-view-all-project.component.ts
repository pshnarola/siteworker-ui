import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ProjectBidService } from 'src/app/service/subcontractor-services/project-bid/project-bid.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { environment } from 'src/environments/environment';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';


@Component({
  selector: 'app-preview-view-all-project',
  templateUrl: './preview-view-all-project.component.html',
  styleUrls: ['./preview-view-all-project.component.css']
})
export class PreviewViewAllProjectComponent implements OnInit {

  type: string;
  userId: string;
  loggedInUser: User;
  user: User;
  rolename: any;
  loggedInUserName: string;
  usernameLabel: string;
  filterMap = new Map();
  globalFilter;
  datatableParam: DataTableParam;
  queryParam;
  projectData: ProjectDetail[] = [];
  offset = 0;
  totalRecords = 0;
  statusList = ['POSTED', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED'];
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
    private projectService: ProjectBidService,
    private clientProjectService: ProjectDetailService,
    private route: ActivatedRoute,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private _subContractorProfileServices: SubcontractorProfileService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
  ) {
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
        this.userId = params.id;
      });

    this.fetchProjectData();
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

  fetchProjectData(): void {
    switch (this.type) {
      case 'client':
        this.fetchClientProjectData();
        break;
      case 'subcontractor':
        this.fetchSubcontractorProjectData();
        break;
    }
  }

  fetchClientProjectData(): void {
    if (this.rolename === 'ADMIN') {
      this.filterMap.set('USER_ID', this.userId);
    }
    if (this.rolename === 'CLIENT') {
      this.filterMap.set('USER_ID', this.user.id);
    }
    this.filterMap.set('STATUS_IN', ['POSTED', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED'].toString());

    this.projectData = [];
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'PROJECT_POSTED_DATE',
      sortOrder: 0,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.clientProjectService.getAllProject(this.queryParam).subscribe(e => {

      this.projectData = e.data.result;
      this.offset = e.data.first;
      this.totalRecords = e.data.totalRecords;
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
          sortField: 'PROJECT_POSTED_DATE',
          sortOrder: 0,
          searchText: this.globalFilter
        };
        this.fetchClientProjectData();
        break;

      case 'subcontractor':

        this.offset = event.first / event.rows;
        this.datatableParam = {
          offset: this.offset,
          size: event.rows ? event.rows : 10,
          sortField: 'PROJECT_ACCEPTED_DATE',
          sortOrder: 0,
          searchText: this.globalFilter
        };
        this.fetchSubcontractorProjectData();
        break;
    }

  }

  fetchSubcontractorProjectData(): void {
    this.filterMap.set('SUBCONTRACTOR_ID', this.userId);
    this.filterMap.set('STATUS', 'ACCEPTED');

    this.projectData = [];
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'PROJECT_ACCEPTED_DATE',
      sortOrder: 0,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.projectService.getAllProjectBidDetail(this.queryParam).subscribe(e => {

      this.projectData = e.data.result;
      this.offset = e.data.first;
      this.totalRecords = e.data.totalRecords;
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
}
