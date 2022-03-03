import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { Client } from 'src/app/module/signup/client-signup/client';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { LoginAsService } from 'src/app/service/login-as.service';
import { UserService } from 'src/app/service/User.service';
import { WorkerProfileDetailService } from 'src/app/service/worker-services/worker-profile-detail/worker-profile-detail.service';
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
import { WorkerProfileDto } from '../../worker/vo/worker-profile-dto';
import { SubcontractorStatusChange } from '../subcontractorStatusChange';
import { WorkerFilter } from './WorkerFilter';

@Component({
  selector: 'app-add-worker',
  templateUrl: './add-worker.component.html',
  styleUrls: ['./add-worker.component.css']
})

export class AddWorkerComponent implements OnInit, OnDestroy {
  imageUrl: string;
  workerProfile: WorkerProfileDto;
  submittedForRiplingId: boolean;
  workerNameParams: { name: any; };
  filterWorkers: any;
  submittedForTsheetId: boolean;
  workPhoneNumber: any;
  showButtons: boolean = true;
  workerAccess: any;
  btnDisabled: boolean = false;

  // Login As
  userNameForLoginAs: { name: any; };
  filteredUserNameForLoginAs: any;
  loginAsForm: any;
  logInAsDialog = false;
  _selectedColumns: { label: any; value: string; }[];
  loggedInUser: any;
  roleName: any;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private notificationService: UINotificationService,
    private spinner: NgxSpinnerService,
    private workerProfileDetail: WorkerProfileDetailService,
    private confirmDialogService: ConfirmDialogueService,
    private userService: UserService,
    private workerProfileService: WorkerProfileDetailService,
    private dateHelperService: DateHelperService,
    private loginAsService: LoginAsService,
    private filterLeftPanelService: FilterLeftPanelDataService,
  ) {
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.datatableParam = new DataTableParam();

    this.datatableParam = {
      offset: 0,
      size: this.size,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };
    this.loginUserId = this.localStorageService.getLoginUserId();
    this.status = [
      { option: 'Inactive', value: 0 },
      { option: 'Active', value: 1 },
      { option: 'All', value: 2 }
    ];

    this.changeStatus = [
      { option: 'Activate', value: 1 },
      { option: 'Inactivate', value: 0 }
    ];
  }

  @ViewChild('dt') table: Table;
  client: Client[] = [];
  private calender: any;
  selectedValue = false;
  showFilterDialog: boolean;
  private datesRangeFilter: any;
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
  filterObject = new WorkerFilter();
  CreatedBetweenFilterValue: '';

  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  status: StatusOptions[];
  changeStatus: StatusOptions[];
  selectedStatus: any;
  myForm: FormGroup;
  addWorkerForm: FormGroup;

  workerDialog = false;
  workers: any[];

  workerRipplingDialog = false;
  myRipplingForm: FormGroup;
  myTSheetForm: FormGroup;
  workerTSheetDialog = false;

  selectedWorkers: any[] = [];

  workerStatusChange = new SubcontractorStatusChange();

  dateErrorFlag: boolean;
  postedStart;
  postedStartDate: Date;
  postedEndDate: Date;

  columns = [
    { label: this.translator.instant('profile.image'), value: 'profile_image', selected: true, sortable: false },
    { label: this.translator.instant('name'), value: 'name', selected: true, sortable: true },
    { label: this.translator.instant('personal.email'), value: 'email', selected: true, sortable: true },
    { label: this.translator.instant('job.title'), value: 'job_title', selected: true, sortable: true },
    { label: this.translator.instant('mobile.phone'), value: 'mobile_phone', selected: false, sortable: true },
    { label: this.translator.instant('created.date'), value: 'created_date', selected: false, sortable: true },
    { label: this.translator.instant('payment.id'), value: 'payment_rails_id', selected: false, sortable: true },
    { label: this.translator.instant('tSheet.ids'), value: 'tsheet_id', selected: false, sortable: true },
    { label: this.translator.instant('availableforhire?'), value: 'available_status', selected: false, sortable: true },
    { label: this.translator.instant('email.verified'), value: 'is_verified', selected: false, sortable: true },
    { label: this.translator.instant('references'), value: 'references', selected: false, sortable: false },
    { label: this.translator.instant('certificates'), value: 'certificates', selected: false, sortable: false },
    { label: this.translator.instant('status'), value: 'status', selected: false, sortable: true }
  ];

  ngOnInit(): void {
    this.loggedInUser = this.localStorageService.getLoginUserObject();
    this.roleName = this.loggedInUser.roles[0].roleName;

    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.selectedColumns = this.columns.filter(a => a.selected == true);
    this.workerAccess = this.localStorageService.getItem("userAccess");
    if (this.workerAccess) {
      this.menuAccess();
    }
    this.showFilterDialog = false;
    // this.initializeForm();
    this.spinner.hide();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.WORKER_LIST);
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }

  initializeForm(): void {

    this.addWorkerForm = this.formBuilder.group({
      id: [],
      isLoginAsCompany: [false],
      companyName: [''],
      firstName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      lastName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      email: ['', [CustomValidator.required, CustomValidator.emailValidator, Validators.maxLength(100)]],
      mobilePhone: ['', [CustomValidator.required]],
      password: [COMMON_CONSTANTS.COMMON_PASSWORD_FOR_ADMIN_ADD_FUNCTIONALITY],
      workPhone: [''],
      role: 'WORKER',
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      createdDate: [],
      updatedDate: [],
      isRequestFromAdmin: [true]
    });

    this.selectedWorkers = [];
  }

  showloginAsDialog(worker) {
    this.logInAsDialog = true;
    this.initializeLoginAsForm();
    this.submitted = false;
    this.loginAsForm.controls['userName'].setValue(worker.workerProfile.user);
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
      let userParams = {
        "username": this.loginAsForm.value.adminUserName,
        "password": this.loginAsForm.value.adminPassword
      };

      let queryparam = this.prepareQueryParam(userParams);
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

  initialializeFilterForm() {
    this.myForm = this.formBuilder.group({
      name: [''],
      email: [''],
      status: [''],
      postedStart: [''],
      postedEnd: [''],
      genericSearch: []
    });

    this.selectedWorkers = [];
  }

  initializeTsheetForm() {
    this.myTSheetForm = this.formBuilder.group({
      id: [],
      TSheetID: ['', [CustomValidator.required, Validators.maxLength(25)]],
      updatedBy: this.loginUserId,
      createdDate: [],
      updatedDate: []
    });
  }
  openFilter(): void {
    this.showFilterDialog = !this.showFilterDialog;
    this.initialializeFilterForm();
  }

  private prepareQueryParam(paramObject): URLSearchParams {
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

  openAddWorker(): void {
    this.workerDialog = true;
    this.submitted = false;
    this.initializeForm();
  }

  openAddWorkerRipplingId(workerProfile): void {
    this.workerProfile = workerProfile;
    this.initializeRiplingIdForm();
    this.myRipplingForm.controls.ripplingID.setValue(this.workerProfile.ripplingId);
    this.workerRipplingDialog = true;
  }

  openAddWorkerTSheetId(workerProfile): void {
    this.workerProfile = workerProfile;
    this.initializeTsheetForm();
    this.myTSheetForm.controls.TSheetID.setValue(this.workerProfile.tsheetId);
    this.workerTSheetDialog = true;

  }

  hideRipplingDialog(): void {
    this.workerRipplingDialog = false;
  }

  hideTSheetDialog(): void {
    this.workerTSheetDialog = !this.workerTSheetDialog;
  }

  getWorkerByName(name): void {
    this.workerNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.workerNameParams);
    this.filterLeftPanelService.getWorkerByName(this.queryParam).subscribe(data => {
      this.filterWorkers = data.data;
      this.filterWorkers = this.filterWorkers.sort();
    });
  }

  filter(): void {
    this.dateErrorFlag = false;
    const filterMap = new Map();
    const workerId = this.localStorageService.getLoginUserId();
    const datePipe = new DatePipe('en-US');
    if (((this.myForm.value.postedStart && !this.myForm.value.postedEnd) ||
      (!this.myForm.value.postedStart && this.myForm.value.postedEnd))) {
      this.dateErrorFlag = true;
    }

    if (!this.myForm.value.postedStart && !this.myForm.value.postedEnd) {
      this.dateErrorFlag = false;
    }

    if (this.myForm.value.postedStart > this.myForm.value.postedEnd) {
      this.dateErrorFlag = true;
    }


    if (this.myForm.value.name) {
      filterMap.set('NAME', this.myForm.value.name.firstName);
    }
    if (this.myForm.value.email) {
      filterMap.set('EMAIL', this.myForm.value.email);
    }
    if (this.myForm.value.status) {
      if (this.myForm.value.status.value === 1) {
        filterMap.set('STATUS', true);
      }
      if (this.myForm.value.status.value === 0) {
        filterMap.set('STATUS', false);
      }
    }
    if (this.myForm.value.postedStart) {
      this.dateHelperService.setStartDate(this.myForm.value.postedStart);
      const value = datePipe.transform(this.myForm.value.postedStart, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('START_DATE', value);
    }
    if (this.myForm.value.postedEnd) {
      this.dateHelperService.setEndDate(this.myForm.value.postedEnd);
      const valueEnd = datePipe.transform(this.myForm.value.postedEnd, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('END_DATE', valueEnd);
    }
    if (this.myForm.value.genericSearch) {
      filterMap.set('GENERIC_SEARCH', this.myForm.value.genericSearch);
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
      this.workerProfileDetail.getAllWorkerDetail(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.loading = false;
            this.workers = data.data.result;
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

  onSubmit(): boolean {
    this.workPhoneNumber = this.addWorkerForm.controls.mobilePhone.value;
    this.addWorkerForm.get('workPhone').setValue(this.workPhoneNumber);
    this.submitted = true;
    if (!this.addWorkerForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.addWorkerForm.controls) {
        this.addWorkerForm.controls[controlName].markAsDirty();
        this.addWorkerForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
      }
      this.submitted = true;
      return false;
    }
    else {
      this.userService.addUser(JSON.stringify(this.addWorkerForm.value)).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('worker.added.successfully'), '');
          this.submitted = false;
          this.hideDialog();
          this.loadworkerList();
        } else {
          this.notificationService.error(data.message, '');
          this.submitted = false;
          this.loadworkerList();
        }
      });
    }

  }

  initializeRiplingIdForm() {
    this.myRipplingForm = this.formBuilder.group({
      id: [],
      ripplingID: ['', [CustomValidator.required, Validators.maxLength(25)]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      createdDate: [],
      updatedDate: []
    });
  }

  hideDialog(): void {
    this.workerDialog = false;
    this.submitted = false;
    this.initializeForm();
    // this.addWorkerForm.reset();
  }

  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder == -1 ? 0 : 1;
    this.offset = event.first / event.rows;
    this.sortField = event.sortField ? event.sortField.toUpperCase() : this.sortField;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadworkerList();
  }

  loadworkerList(): void {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.workerProfileDetail.getAllWorkerDetail(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.loading = false;
          this.workers = data.data.result;
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

  onChangeStatusOfselected(): void {
    if (this.selectedWorkers.length !== 0) {
      if (this.selectedStatus) {
        if (this.selectedStatus.option === 'Activate') {
          const idList = [];
          this.selectedWorkers.forEach(e => {
            idList.push(e.workerProfile.user.id);
          });
          this.onActiveWorker(idList);
        }
        if (this.selectedStatus.option === 'Inactivate') {
          const idList = [];
          this.selectedWorkers.forEach(e => {
            idList.push(e.workerProfile.user.id);
          });
          this.onInactiveWorker(idList);
        }
      } else {
        this.notificationService.error('Select action of Status', '');
      }
    }
    else {
      this.notificationService.error('Please select at least one worker', '');
    }
  }

  onActiveWorker(list): void {
    this.workerStatusChange = new SubcontractorStatusChange();
    this.workerStatusChange.userIds = [];
    this.workerStatusChange.userIds = list;
    this.workerStatusChange.createdBy = this.loginUserId;
    this.workerStatusChange.updatedBy = this.loginUserId;
    this.userService.activateUser(this.workerStatusChange).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('worker.activated'), '');
          this.selectedWorkers = [];
          this.selectedStatus = null;
          this.loadworkerList();
        } else {
          this.notificationService.error(data.message, '');
          this.selectedWorkers = [];
          this.loadworkerList();
        }
      });
  }

  onInactiveWorker(list): void {
    this.workerStatusChange = new SubcontractorStatusChange();
    this.workerStatusChange.userIds = [];
    this.workerStatusChange.userIds = list;
    this.workerStatusChange.createdBy = this.loginUserId;
    this.workerStatusChange.updatedBy = this.loginUserId;
    this.userService.deactivateUser(this.workerStatusChange).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('worker.inactivated'), '');
          this.selectedWorkers = [];
          this.selectedStatus = null;
          this.loadworkerList();
        } else {
          this.notificationService.error(data.message, '');
          this.selectedWorkers = [];
          this.loadworkerList();
        }
      });
  }

  manageReferences(user): void {
    this.localStorageService.setItem('workerUserForManageReferences', user);
    this.router.navigate([PATH_CONSTANTS.MANAGE_REFERENCES_WORKER]);
  }

  manageCertificates(user): void {
    this.localStorageService.setItem('workerUserForManageCertificates', user);
    this.router.navigate([PATH_CONSTANTS.MANAGE_CERTIFICATE_WORKER]);
  }



  setAvtar(firstName, lastName): any {
    const avtarName = firstName.substring(0, 1) + lastName.substring(0, 1);
    return avtarName;
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

  redirectToWorker(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_WORKER_PROFILE + '?user=' + id);
  }

  saveRipplingID() {
    this.submittedForRiplingId = true;
    if (!this.myRipplingForm.valid) {
      CustomValidator.markFormGroupTouched(this.myRipplingForm);
      this.submittedForRiplingId = false;
      return false;
    }
    else {
      let workerProfile = new WorkerProfileDto();
      workerProfile = this.workerProfile;
      workerProfile.ripplingId = this.myRipplingForm.value.ripplingID;
      workerProfile.updatedBy = this.loginUserId;
      this.workerProfileService.updateRipplingTsheetId(workerProfile).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('rippling.id.updated'), '');
          this.submittedForRiplingId = false;
          this.hideRipplingDialog();
        }
        else {
          this.notificationService.success(data.errorCode, '');
        }
      });
    }
  }

  saveTSheetID() {
    this.submittedForTsheetId = true;
    if (!this.myTSheetForm.valid) {
      CustomValidator.markFormGroupTouched(this.myTSheetForm);
      this.submittedForTsheetId = false;
      return false;
    }
    else {
      let workerProfile = new WorkerProfileDto();
      workerProfile = this.workerProfile;
      workerProfile.tsheetId = this.myTSheetForm.value.TSheetID;
      workerProfile.updatedBy = this.loginUserId;
      this.workerProfileService.updateRipplingTsheetId(workerProfile).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('tsheet.id.updated'), '');
          this.submittedForTsheetId = false;
          this.hideTSheetDialog();
        }
        else {
          this.notificationService.success(data.errorCode, '');
        }
      });
    }
  }

  clear(): void {
    this.myForm.reset();
    this.filter();
  }
  menuAccess(): void {
    let accessPermission = this.workerAccess.filter(e => e.menuName == 'Workers');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }

  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }

  openConfirmationDialog(): void {
    let options = null;
    const message = 'Do you want to cancel the add worker operation';
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

}
