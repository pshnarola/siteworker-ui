import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { Client } from 'src/app/module/signup/client-signup/client';
import { ClientService } from 'src/app/service/admin-services/client-services/client.service';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { LoginAsService } from 'src/app/service/login-as.service';
import { UserService } from 'src/app/service/User.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { StatusOptions } from 'src/app/shared/OptionsClass/StatusOptions';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { environment } from 'src/environments/environment';
import { SubcontractorStatusChange } from '../subcontractorStatusChange';
import { clientFilter } from './clientFilter';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.css'],
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddClientComponent implements OnInit, OnDestroy {
  imageUrl: string;

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
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  status: StatusOptions[];
  emailStatus: StatusOptions[];
  selectedStatus: StatusOptions;
  myForm: FormGroup;
  filterForm: FormGroup;
  clientDialog = false;
  clients: any[];
  showButtons = true;
  clientAccess: any;
  btnDisabled = false;

  selectedClients: any[];

  clientStatusChange = new SubcontractorStatusChange();

  postedStartDate: Date;
  postedEndDate: Date;

  // Log in As
  loginAsForm: FormGroup;
  logInAsDialog = false;

  columns = [
    { label: this.translator.instant('profile.image'), value: 'profile_image', selected: true, sortable: false },
    { label: this.translator.instant('client.company.name'), value: 'company_name', selected: true, sortable: true },
    { label: this.translator.instant('company.email'), value: 'user_email', selected: true, sortable: true },
    { label: this.translator.instant('work.phone'), value: 'company_phone', selected: true, sortable: true },
    { label: this.translator.instant('contact.name'), value: 'contact_name', selected: true, sortable: true },
    { label: this.translator.instant('contact.email'), value: 'email', selected: true, sortable: true },
    { label: this.translator.instant('mobile.phone'), value: 'mobile_phone', selected: true, sortable: true },
    { label: this.translator.instant('created.date'), value: 'created_date', selected: true, sortable: true },
    { label: this.translator.instant('email.verified'), value: 'is_verified', selected: true, sortable: true },
    { label: this.translator.instant('approval.status.project'), value: 'pending_project_clients', selected: true, sortable: true },
    { label: this.translator.instant('approval.status.job'), value: 'pending_job_clients', selected: true, sortable: true },
    { label: this.translator.instant('msa'), value: 'msa', selected: true, sortable: false },
    { label: this.translator.instant('project.access'), value: 'project_access', selected: true, sortable: true },
    { label: this.translator.instant('job.access'), value: 'job_access', selected: true, sortable: true },
    { label: this.translator.instant('status'), value: 'is_active', selected: true, sortable: true }
  ];

  dateErrorFlag: boolean;
  contactNameParams: { name: any; };
  filterContactNames: any;
  userNameForLoginAs: { name: any; };
  filteredUserNameForLoginAs: any;
  _selectedColumns: any[];
  companyNameParams: { name: any; };
  filterCompanyNames: any;
  loggedInUser;
  roleName: any;

  constructor(
    private clientservice: ClientService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private spinner: NgxSpinnerService,
    private userService: UserService,
    private loginAsService: LoginAsService,
    private notificationService: UINotificationService,
    private dateHelperService: DateHelperService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private clientProfileService: ClientProfileService,
    private confirmDialogService: ConfirmDialogueService
  ) {
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.status = [
      { option: 'Activate', value: 1 },
      { option: 'Inactivate', value: 0 }];

    this.emailStatus = [
      { option: 'Pending', value: 0 },
      { option: 'Approved', value: 1 }];

    this.selectedClients = [];

    this.datatableParam = new DataTableParam();
    this.loginUserId = this.localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this.captionChangeService.hideSidebarSubject.next(true);
    this.selectedColumns = this.columns.filter(a => a.selected == true);
    this.showFilterDialog = false;
    this.clientAccess = this.localStorageService.getItem('userAccess');
    this.loggedInUser = this.localStorageService.getLoginUserObject();
    this.roleName = this.loggedInUser.roles[0].roleName;
    this.initializeFilterForm();
    this.initializeLoginAsForm();
    this.spinner.hide();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_LIST);
    if (this.clientAccess) {
      this.menuAccess();
    }
  }


  showloginAsDialog(client) {
    this.logInAsDialog = true;
    this.initializeLoginAsForm();
    this.submitted = false;
    this.loginAsForm.controls.userName.setValue(client.user);
  }

  hideloginAsDialog() {
    this.logInAsDialog = false;
  }

  initializeLoginAsForm() {
    this.loginAsForm = this.formBuilder.group({
      id: [],
      userName: ['', [CustomValidator.required]],
      adminUserName: ['', [CustomValidator.required]],
      adminPassword: ['', [CustomValidator.required]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      enable: 1,
    });
  }

  onSubmitLoginAs() {
    this.submitted = true;
    if (!this.loginAsForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.loginAsForm.controls) {
        this.loginAsForm.controls[controlName].markAsDirty();
        this.loginAsForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = true;
      return false;
    }
    else {

      const userParams = {
        'username': this.loginAsForm.value.adminUserName,
        'password': this.loginAsForm.value.adminPassword
      };

      const queryparam = this.prepareQueryParam(userParams);
      setTimeout(() => {
        this.loginAsService.generateTokenForLoginAs(queryparam, this.loginAsForm.value.userName.email);
      }, 3000);
    }
  }

  getFilteredUsernameForLogin(event) {
    this.userNameForLoginAs = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.userNameForLoginAs);
    this.filterLeftPanelService.getUserDetailByName(this.queryParam).subscribe(data => {
      this.filteredUserNameForLoginAs = data.data;
      this.filteredUserNameForLoginAs = this.filteredUserNameForLoginAs.sort();
    });
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
      mobilePhone: [''],
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
      companyName: [''],
      postedStart: [''],
      postedEnd: [''],
      genericSearch: []
    });
  }

  openFilter(): void {
    this.showFilterDialog = !this.showFilterDialog;
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
    this.captionChangeService.hideSidebarSubject.next(false);
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
      // tslint:disable-next-line: forinzhvjdvjdfbj
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
          this.submitted = false;
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
    this.clientDialog = false;
    this.initializeFilterForm();
    this.submitted = false;
  }

  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.offset = event.first / event.rows;
    this.sortField = event.sortField ? event.sortField.toUpperCase() : this.sortField;

    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };

    this.loadClientList();
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
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
        console.log(error);
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
    this.dateErrorFlag = false;
    const filterMap = new Map();
    const workerId = this.localStorageService.getLoginUserId();
    const datePipe = new DatePipe('en-US');
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
        size: this.size,
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
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
            this.imageUrl = environment.baseURL + '/file/getById?fileId=';
          } else {
            this.loading = false;
          }
        },
        error => {
          this.loading = false;
          console.log(error);
        }
      );
    }
    else {
      this.notificationService.error('Enter appropriate Date Range', '');
    }
  }

  onChangeStatusOfselected(): void {
    if (this.selectedClients.length !== 0) {
      if (this.selectedStatus) {
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
        this.notificationService.error('Select action of Status', '');
      }
    }
    else {
      this.notificationService.error('Please select at least one client', '');
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
          this.notificationService.success(this.translator.instant('client.activated'), '');
          this.selectedClients = [];
          this.selectedStatus = null;
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
          this.notificationService.success(this.translator.instant('client.inactivated'), '');
          this.selectedClients = [];
          this.selectedStatus = null;
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
    const clientObject = client;
    clientObject.isProjectAccess = !flag;
    this.clientProfileService.toggleProjectAccess(clientObject).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success('Access Changed', '');
          this.loadClientList();
          this.submitted = false;
        } else {
          this.notificationService.error(data.message, '');
          this.loadClientList();
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
        this.loadClientList();
        this.submitted = false;
      }
    );
  }

  changeJobAccess(client, flag): void {
    const clientObject = client;
    clientObject.isJobAccess = !flag;
    this.clientProfileService.toggleProjectAccess(clientObject).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success('Access Changed', '');
          this.loadClientList();
          this.submitted = false;
        } else {
          this.notificationService.error(data.message, '');
          this.loadClientList();
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
        this.loadClientList();
        this.submitted = false;
      }
    );
  }

  changeMSA(client): void {
    this.localStorageService.setItem('customizedMSAOfClient', client);
    this.router.navigate([PATH_CONSTANTS.MSA_CLIENT], { queryParams: { user: client.user.id } });
  }

  changeApprovalStatus(client, type): void {
    this.localStorageService.setItem('approvalOfClient', client);
    this.router.navigate([PATH_CONSTANTS.APPROVE_CLIENT], { queryParams: { user: client.user.id, type } });
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

  hasProjectAccess(isProjectMSAccepted, approvedByAdmin) {
    if (isProjectMSAccepted && approvedByAdmin) {
      return true;
    }
    if (!isProjectMSAccepted && !approvedByAdmin) {
      return false;
    }
    if (!isProjectMSAccepted && approvedByAdmin) {
      return false;
    }
    if (isProjectMSAccepted && !approvedByAdmin) {
      return false;
    }
  }

  menuAccess(): void {
    const accessPermission = this.clientAccess.filter(e => e.menuName == 'Clients');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }

  getCompanyName(name): void {
    this.companyNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.companyNameParams);
    this.filterLeftPanelService.getClientByNameForClientListForAdmin(this.queryParam).subscribe(data => {
      this.filterCompanyNames = data.data;
      this.filterCompanyNames = this.filterCompanyNames.sort();
    });
  }

  openConfirmationDialog(): void {
    let options = null;
    const message = 'Do you want to cancel the add client operation';
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.hideDialog();
      }
    });
  }

  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }

}

