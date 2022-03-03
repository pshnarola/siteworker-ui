import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { UserService } from 'src/app/service/User.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { environment } from 'src/environments/environment';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-preview-project-detail',
  templateUrl: './preview-project-detail.component.html',
  styleUrls: ['./preview-project-detail.component.css']
})
export class PreviewProjectDetailComponent implements OnInit {
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords = 0;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;


  rolename: any;
  usernameLabel: string;
  displayAvatar: boolean;
  avatarColor: string;
  client: any;
  singleImageView: string;
  subcontractor: any;
  workerDto: any;
  user: any;
  loggedInUserName: string;


  filterMap = new Map();
  lat;
  lng;
  status;
  queryParam;
  supervisorList;
  supervisor;
  projectDetail: ProjectDetail;
  projectInvitees = [];
  pendingResponseData = [];
  acceptedInvitations = [];
  isSelectedProject: boolean;
  selectedProject: any;

  dataTableParam: DataTableParam;
  globalFilter: string;
  offset: Number = 0;
  loggedInUserId: any;


  columns = [
    { label: 'Jobsite Title', value: 'title' },
    { label: 'Jobsite Description', value: 'description' },
    { label: 'Bid Amount', value: 'cost' },
    { label: 'Location', value: 'location' },
    { label: 'City', value: 'city' },
    { label: 'State', value: 'state' },
    { label: 'Zipcode', value: 'zipCode' },
  ];
  id: any;
  profileImage: any;
  constructor(
    private translator: TranslateService,
    private captionChangeService: HeaderManagementService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private notificationService: UINotificationService,
    private projectDetailService: ProjectDetailService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private _subcontractorProfileDetail: SubcontractorProfileService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,

  ) {
    this.dataTableParam = new DataTableParam();
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.id = params.user;
        this.getProjectById(this.id);
      });
  }

  ngOnInit(): void {

    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
      this.loggedInUserName = this.user.firstName + ' ' + this.user.lastName;
    } else {
      this.loggedInUserName = 'Guest';
    }

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
        console.log(error);
      }
    );
  }
  getLogedInSubcontractorDetail(id) {
    this._subcontractorProfileDetail.getSubcontractorDetail(id).subscribe(
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


  ngOnDestroy(): void {
  }

  getProjectById(id) {
    this.projectDetailService.getProjectByProjectId(id).subscribe(
      data => {
        this.projectDetail = data.data;
      }
    );
  }

  getProjectInviteeList(): void {
    this.filterMap.clear();
    this.filterMap.set('PROJECT_DETAIL_ID', this.projectDetail.id);
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.dataTableParam = {
      offset: this.offset,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.projectDetailService.getAllProjectInvitee(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.projectInvitees = [];
          this.pendingResponseData = [];
          this.acceptedInvitations = [];
          this.projectInvitees = data.data.result;
          this.projectInvitees.forEach(invitees => {
            if (invitees.status === 'PENDING') {
              this.pendingResponseData.push(invitees);
            } else if (invitees.status === 'ACCEPTED' || invitees.status === 'ACCEPTED_PENDING') {
              this.acceptedInvitations.push(invitees);
            }
          });
        }
      });
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  redirectToSubcontractor(id) {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_SUBCONTRACTOR_PROFILE + '?user=' + id);
  }

  onJobSiteClick(id) {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOBSITE + '?jobsite=' + id);
  }


}
