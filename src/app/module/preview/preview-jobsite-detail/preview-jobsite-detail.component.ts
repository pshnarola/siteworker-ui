import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { JobsiteDetailService } from 'src/app/service/client-services/jobsite-details/jobsite-detail.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-preview-jobsite-detail',
  templateUrl: './preview-jobsite-detail.component.html',
  styleUrls: ['./preview-jobsite-detail.component.css']
})
export class PreviewJobsiteDetailComponent implements OnInit {
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;
  id;
  showMore = false;
  globalFilter;
  offset = 0;
  size = 10;
  datatableParam: DataTableParam;
  queryParam: URLSearchParams;
  sortOrder = 1;
  sortField: any = 'CREATED_DATE';
  jobSiteDetail: any;
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  _selectedColumns: any[];
  _selectedColumnsForDialog: any[];

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

  columns = [
    { label: 'Work Type', value: 'workType', selected: true },
    { label: 'Line Item Id', value: 'lineItemId', selected: true },
    { label: 'Line Item Name', value: 'lineItemName', selected: true },
    { label: 'Cost', value: 'cost', selected: true },
    { label: 'Description', value: 'description', selected: true },
    { label: 'Inclusion', value: 'inclusions', selected: false },
    { label: 'Exclusion', value: 'exclusions', selected: false },
    { label: 'Unit', value: 'unit.name', selected: false },
    { label: 'Quantity', value: 'quantity', selected: false },
    { label: 'Dynamic Label 1', value: 'dynamicLabel1', selected: false },
    { label: 'Dynamic Label 2', value: 'dynamicLabel2', selected: false },
    { label: 'Dynamic Label 3', value: 'dynamicLabel3', selected: false },
  ];

  columnsForDialog = [
    { label: 'Work Type', value: 'workType', selected: true },
    { label: 'Line Item Id', value: 'lineItemId', selected: true },
    { label: 'Line Item Name', value: 'lineItemName', selected: true },
    { label: 'Cost', value: 'cost', selected: true },
    { label: 'Description', value: 'description', selected: true },
    { label: 'Inclusion', value: 'inclusions', selected: false },
    { label: 'Exclusion', value: 'exclusions', selected: false },
    { label: 'Unit', value: 'unit.name', selected: false },
    { label: 'Quantity', value: 'quantity', selected: false },
    { label: 'Dynamic Label 1', value: 'dynamicLabel1', selected: false },
    { label: 'Dynamic Label 2', value: 'dynamicLabel2', selected: false },
    { label: 'Dynamic Label 3', value: 'dynamicLabel3', selected: false },
  ];

  paymentColumns = [
    { label: 'Milestone Name', value: 'name' },
    { label: 'Closeout package / Line items deliverables', value: 'lineItem' },
    { label: 'Amount Release', value: 'cost' },
    { label: 'Percentage', value: 'percentage' },
  ];
  lineItemPopup: boolean;
  viewLineItem = [];
  profileImage: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private _jobSiteDetailService: JobsiteDetailService,
    private translator: TranslateService,
    private _subcontractorProfileDetail: SubcontractorProfileService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,

  ) {
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.id = params.jobsite;
      });

    this.datatableParam = {
      offset: this.offset,
      size: 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter = `{"JOBSITE_ID":"${this.id}"}`
    };
  }

  ngOnInit(): void {
    this.getJobsiteListById();
    this._selectedColumns = this.columns.filter(x => x.selected == true);
    this._selectedColumnsForDialog = this.columns.filter(x => x.selected == true);

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

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getJobsiteListById() {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._jobSiteDetailService.getJobsiteDetailList(this.queryParam).subscribe(
      data => {
        this.jobSiteDetail = data.data.result;
        this.jobSiteDetail = this.jobSiteDetail[0];
      }
    );
  }

  lineItemDeliverablePopup(lineItem): void {
    this.lineItemPopup = true;
    this.viewLineItem = lineItem;
  }
  hideLineItemDialog(): void {
    this.lineItemPopup = false;
  }


  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }

  @Input() get selectedColumnsForDialog(): any[] {
    return this._selectedColumnsForDialog;
  }

  set selectedColumnsForDialog(val: any[]) {
    this._selectedColumnsForDialog = this.columns.filter(col => val.includes(col));
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
