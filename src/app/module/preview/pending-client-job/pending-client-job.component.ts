import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ClientService } from 'src/app/service/admin-services/client-services/client.service';
import { IndustryTypeService } from 'src/app/service/admin-services/industry-type/industry-type.service';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { UserService } from 'src/app/service/User.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { StatusOptions } from 'src/app/shared/OptionsClass/StatusOptions';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { IndustryType } from 'src/app/shared/vo/IndustryType';
import { environment } from 'src/environments/environment';
import { clientFilter } from '../../admin/add-client/clientFilter';
import { SubcontractorStatusChange } from '../../admin/subcontractorStatusChange';
import { Client } from '../../signup/client-signup/client';

@Component({
  selector: 'app-pending-client-job',
  templateUrl: './pending-client-job.component.html',
  styleUrls: ['./pending-client-job.component.css']
})
export class PendingClientJobComponent implements OnInit {

  imageUrl: string;

  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;

  @ViewChild('dt') table: Table;
  client: Client[] = [];
  private calender: any;
  showFilterDialog: boolean;
  private datesRangeFilter: any;
  filteredIndustryType: any[];
  loading = false;
  offset = 0;
  datatableParam: DataTableParam;
  totalRecords = 0;
  loginUserId;
  showConfirmDialog = false;
  sortField = 'CREATED_DATE';
  queryParam;
  globalFilter = null;
  sortOrder = 0;
  submitted: boolean;
  isAllCertificatedSelected = false;
  rowIndex = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  filterObject = new clientFilter();
  CreatedBetweenFilterValue: '';

  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  status: StatusOptions[];
  emailStatus: StatusOptions[];
  selectedStatus: StatusOptions;
  industryType: IndustryType[];
  myForm: FormGroup;
  filterForm: FormGroup;
  clientDialog = false;
  clients: any[];

  selectedClients: any[];
  _selectedColumns: any[];
  clientStatusChange = new SubcontractorStatusChange();

  user: any;
  rolename: any;
  loggedInUserName: string;
  usernameLabel: string;
  displayAvatar: boolean;
  avatarColor: string = '#2196F3';
  client1: any;
  profileImage: any;
  singleImageView: string;
  workerDto: any;
  subcontractor: any;

  columns = [
    { label: 'Profile Image', value: 'profile_image', selected: true },
    { label: 'Client Company Name', value: 'company_name', selected: true },
    { label: 'Company Email', value: 'company_email', selected: true },
    { label: 'Work Phone', value: 'work_phone', selected: true },
    { label: 'Contact Name', value: 'contact_name', selected: true },
    { label: 'Contact Email', value: 'contact_email', selected: false },
    { label: 'Mobile Phone', value: 'mobile_phone', selected: false },
    { label: 'Created Date', value: 'created_date', selected: false },
    { label: 'Email Verified?', value: 'email_verified', selected: false },
    { label: 'Status', value: 'Status', selected: false }
  ];
  dateErrorFlag: boolean;
  contactNameParams: { name: any; };
  filterContactNames: any;

  constructor(
    private clientservice: ClientService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private spinner: NgxSpinnerService,
    private industryTypeService: IndustryTypeService,
    private userService: UserService,
    private notificationService: UINotificationService,
    private dateHelperService: DateHelperService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private _subContractorProfileServices: SubcontractorProfileService,

  ) {

    this.status = [
      { option: 'Activate', value: 1 },
      { option: 'Inactivate', value: 0 }];

    this.emailStatus = [
      { option: 'Pending', value: 0 },
      { option: 'Approved', value: 1 }];

    this.selectedClients = [];

    this.datatableParam = new DataTableParam();
    this.loginUserId = this.localStorageService.getLoginUserId();

    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
      this.loggedInUserName = this.user.firstName + ' ' + this.user.lastName;
    } else {
      this.loggedInUserName = 'Guest';
    }
  }

  ngOnInit(): void {
    this.showFilterDialog = false;
    this.initializeFilterForm();
    this.spinner.hide();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_LIST);
    this._selectedColumns = this.columns.filter(a => a.selected == true);

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
    this.clientProfileService.getClientDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.client1 = data.data;
          this.profileImage = this.client1.photo;
          this.usernameLabel = this.client1.user.firstName.substring(0, 1) + this.client1.user.lastName.substring(0, 1);
          if (this.client1.photo) {
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

  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      id: [],
      isLoginAsCompany: [false],
      companyName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      firstName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      lastName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      email: ['', [CustomValidator.required, CustomValidator.emailValidator, CustomValidator.clientEmailValidator, Validators.maxLength(50)]],
      password: [COMMON_CONSTANTS.COMMON_PASSWORD_FOR_ADMIN_ADD_FUNCTIONALITY],
      workPhone: ['', [CustomValidator.required]],
      mobilePhone: ['', [CustomValidator.required]],
      role: 'CLIENT',
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      createdDate: [],
      updatedDate: [],
      isRequestFromAdmin: [true]
    });
  }

  initializeFilterForm(): void {
    this.filterForm = this.formBuilder.group({
      name: [''],
      email: [''],
      status: [''],
      industryType: [''],
      companyName: [''],
      postedStart: [''],
      postedEnd: [''],
      genericSearch: []
    });
  }


  filterIndustryType(event): void {
    const filtered: any[] = [];
    const query = event.query;
    if (this.industryType) {
      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.industryType.length; i++) {
        const industryType = this.industryType[i];
        if (industryType.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
          filtered.push(industryType);
        }
      }
      this.filteredIndustryType = filtered;
      this.filteredIndustryType = this.filteredIndustryType.sort();
    }
  }

  openFilter(): void {
    this.showFilterDialog = !this.showFilterDialog;
    this.getIndustryTypeList();
  }

  private getIndustryTypeList(): void {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.industryTypeService.getIndustryTypeList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.industryType = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  // tslint:disable-next-line: typedef
  private prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  ngOnDestroy(): void {
    this.spinner.show();
  }

  openAddClient(): void {
    this.clientDialog = !this.clientDialog;
    this.initializeForm();
  }

  search(): void {
    const data = this.filterObject;
    if (this.CreatedBetweenFilterValue) {
      this.filterObject.createdFromDate = this.CreatedBetweenFilterValue[0];
      this.filterObject.createdToDate = this.CreatedBetweenFilterValue[1];
    }
  }

  public onDatesRangeFilterSelected(selectedValue: Date): void {
    if (this.CreatedBetweenFilterValue[1]) { // If second date is selected
      // this.calender.hide()
    }
  }

  onSubmit(): boolean {
    this.submitted = true;
    if (!this.myForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.myForm.controls) {
        this.myForm.controls[controlName].markAsDirty();
        this.myForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = true;
      return false;
    }

    this.userService.addUserFromAdmin(JSON.stringify(this.myForm.value)).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('client.added.successfully'), '');
          this.hideDialog();
          this.loadClientList();
        }
        else {
          this.notificationService.error(this.translator.instant('email.already.exists'), '');
          this.hideDialog();
          this.loadClientList();
          this.submitted = false;
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        this.hideDialog();
        this.loadClientList();
        this.submitted = false;
      }
    );
  }

  hideDialog(): void {
    this.clientDialog = !this.clientDialog;
  }

  onLazyLoad(event): void {

    let filterMap = new Map();
    filterMap.set('PENDING_JOB_CLIENTS', 'id');
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);


    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.offset = event.first / event.rows;

    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };



    this.loadClientList();
  }

  loadClientList(): void {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);

    this.clientservice.getClientList(this.queryParam).subscribe(
      data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.loading = false;
          this.clients = data.data.result;
          this.offset = data.data.first;
          this.totalRecords = data.data.totalRecords;
          this.imageUrl = environment.baseURL + '/file/getById?fileId=';
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;

      }
    );
  }

  getContactName(name): void {
    this.contactNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.contactNameParams);
    this.filterLeftPanelService.getClientByContactName(this.queryParam).subscribe(data => {

      this.filterContactNames = data.data;
      this.filterContactNames = this.filterContactNames.sort();
    });
  }

  filter(): void {
    const filterMap = new Map();
    const workerId = this.localStorageService.getLoginUserId();
    const datePipe = new DatePipe('en-US');
    this.dateErrorFlag = false;
    filterMap.set('PENDING_JOB_CLIENTS', 'id');
    if (((this.filterForm.value.postedStart && !this.filterForm.value.postedEnd) ||
      (!this.filterForm.value.postedStart && this.filterForm.value.postedEnd))) {
      this.dateErrorFlag = true;
    }

    if (!this.filterForm.value.postedStart && !this.filterForm.value.postedEnd) {
      this.dateErrorFlag = false;
    }

    if (this.filterForm.value.postedStart > this.filterForm.value.postedEnd) {
      this.dateErrorFlag = true;
    }

    if (this.filterForm.value.name) {
      filterMap.set('CONTACT_NAME', this.filterForm.value.name);
    }
    if (this.filterForm.value.companyName) {
      filterMap.set('COMPANY_NAME', this.filterForm.value.companyName);
    }
    if (this.filterForm.value.email) {
      filterMap.set('EMAIL', this.filterForm.value.email);
    }
    if (this.filterForm.value.status) {
      if (this.filterForm.value.status.value === 1) {
        filterMap.set('APPROVAL_STATUS', true);
      }
      if (this.filterForm.value.status.value === 0) {
        filterMap.set('APPROVAL_STATUS', false);
      }
    }
    if (this.filterForm.value.postedStart) {
      this.dateHelperService.setStartDate(this.filterForm.value.postedStart);
      const value = datePipe.transform(this.filterForm.value.postedStart, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('START_DATE', value);
    }
    if (this.filterForm.value.postedEnd) {
      this.dateHelperService.setEndDate(this.filterForm.value.postedEnd);
      const valueEnd = datePipe.transform(this.filterForm.value.postedEnd, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('END_DATE', valueEnd);
    }
    if (this.filterForm.value.genericSearch) {
      filterMap.set('GENERIC_SEARCH', this.filterForm.value.genericSearch);
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    if (!this.dateErrorFlag) {

      this.globalFilter = JSON.stringify(jsonObject);
      this.datatableParam = {
        offset: 0,
        size: 10000,
        sortField: '',
        sortOrder: 1,
        searchText: this.globalFilter
      };



      this.queryParam = this.prepareQueryParam(this.datatableParam);

      this.clientservice.getClientList(this.queryParam).subscribe(
        data => {

          if (data.statusCode === '200' && data.message === 'OK') {
            this.loading = false;
            this.clients = data.data.result;
          } else {
            this.loading = false;
          }
        },
        error => {
          this.loading = false;

        }
      );
    }
    else {
      this.notificationService.error('Enter appropriate Date Range', '');
    }

  }

  onChangeStatusOfselected(): void {
    if (this.selectedClients.length !== 0 && this.selectedStatus) {
      if (this.selectedStatus.option === 'Activate') {
        const idList = [];
        this.selectedClients.forEach(e => {
          idList.push(e.user.id);
        });
        this.onActiveClient(idList);
      }
      if (this.selectedStatus.option === 'Inactivate') {
        const idList = [];
        this.selectedClients.forEach(e => {
          idList.push(e.user.id);
        });
        this.onInactiveClient(idList);
      }
    } else {
      this.notificationService.error('Select Action of Status', '');
    }
  }

  onActiveClient(list): void {
    this.clientStatusChange = new SubcontractorStatusChange();
    this.clientStatusChange.userIds = [];
    this.clientStatusChange.userIds = list;
    this.clientStatusChange.createdBy = this.loginUserId;
    this.clientStatusChange.updatedBy = this.loginUserId;

    this.userService.activateUser(this.clientStatusChange).subscribe(
      data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('worker.activated'), '');
          this.selectedClients = [];
          this.loadClientList();
        } else {
          this.notificationService.error(data.message, '');
          this.selectedClients = [];
          this.loadClientList();
        }
      });
  }

  onInactiveClient(list): void {
    this.clientStatusChange = new SubcontractorStatusChange();
    this.clientStatusChange.userIds = [];
    this.clientStatusChange.userIds = list;
    this.clientStatusChange.createdBy = this.loginUserId;
    this.clientStatusChange.updatedBy = this.loginUserId;

    this.userService.deactivateUser(this.clientStatusChange).subscribe(
      data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('worker.inactivated'), '');
          this.selectedClients = [];
          this.loadClientList();
        } else {
          this.notificationService.error(data.message, '');
          this.selectedClients = [];
          this.loadClientList();
        }
      });
  }

  forgotPassword(userEmail): any {
    this.submitted = true;
    this.spinner.show();

    const datatableParam = {
      email: userEmail
    };

    this.queryParam = this.prepareQueryParam(datatableParam);
    this.userService.forgotPassword(this.queryParam).subscribe(data => {
      if (data.statusCode === '200') {
        this.notificationService.success(this.translator.instant('forgot.password.successMessage'), '');
      }
      else {
        this.notificationService.error(data.message, '');
      }
    },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  changeProjectAccess(client, flag): void {
    let clientObject = client;
    clientObject.isProjectAccess = !flag;
    this.clientProfileService.toggleProjectAccess(clientObject).subscribe(
      data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.loadClientList();
          this.submitted = false;
        } else {
          this.notificationService.error(data.message, '');
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');

        this.submitted = false;
      }
    );


  }

  changeJobAccess(client, flag): void {
    let clientObject = client;
    clientObject.isJobAccess = !flag;
    this.clientProfileService.toggleProjectAccess(clientObject).subscribe(
      data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.loadClientList();
          this.submitted = false;
        } else {
          this.notificationService.error(data.message, '');
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');

        this.submitted = false;
      }
    );


  }

  changeMSA(client): void {
    this.localStorageService.setItem('customizedMSAOfClient', client);
    this.router.navigate([PATH_CONSTANTS.MSA_CLIENT], { queryParams: { user: client.user.id } });
  }

  changeApprovalStatus(client): void {
    this.localStorageService.setItem('approvalOfClient', client);
    this.router.navigate([PATH_CONSTANTS.APPROVE_CLIENT], { queryParams: { user: client.user.id } });
  }

  setAvtar(firstName, lastName): any {
    const avtarName = firstName.substring(0, 1) + lastName.substring(0, 1);
    return avtarName;
  }

  redirectToClient(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_CLIENT_PROFILE + '?user=' + id);
  }

  clear(): void {
    this.filterForm.reset();
    this.filter();
  }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
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
