import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { Client } from 'src/app/module/signup/client-signup/client';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { UserService } from 'src/app/service/User.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
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
import { SubcontractorStatusChange } from '../../admin/subcontractorStatusChange';
import { WorkerProfileDto } from '../../worker/vo/worker-profile-dto';
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
  profileImage: any;


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private notificationService: UINotificationService,
    private spinner: NgxSpinnerService,
    private workerProfileDetail: WorkerProfileDetailService,
    private _subcontractorProfileDetail: SubcontractorProfileService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private confirmDialogService: ConfirmDialogueService,
    private userService: UserService,
    private workerProfileService: WorkerProfileDetailService,
    private dateHelperService: DateHelperService,
    private filterLeftPanelService: FilterLeftPanelDataService,


  ) {
    this.datatableParam = new DataTableParam();

    this.datatableParam = {
      offset: 0,
      size: 2,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };
    this.loginUserId = this.localStorageService.getLoginUserId();
    this.status = [
      { option: 'InActive', value: 0 },
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

  selectedWorkers: any[];

  workerStatusChange = new SubcontractorStatusChange();

  dateErrorFlag: boolean;
  postedStart;
  postedEndDate: Date;

  rolename: any;
  usernameLabel: string;
  displayAvatar: boolean;
  avatarColor: string = '#2196F3';
  clientUser: any;
  singleImageView: string;
  subcontractor: any;
  workerDto: any;
  user: any;
  loggedInUserName: string;

  showButtons: boolean = true;
  workerAccess: any;
  btnDisabled: boolean = false;
  columns = [
    { label: 'Profile Image', value: 'profile_image', sortable: false },
    { label: 'Name', value: 'name', sortable: true },
    { label: 'Personal Email', value: 'email', sortable: true },
    { label: 'Mobile Phone', value: 'mobile_phone', sortable: true },
    { label: 'Created Date', value: 'created_date', sortable: true },
    { label: 'Available for Hire', value: 'available_status', sortable: true },
    { label: 'Email Verified?', value: 'is_verified', sortable: true },
    { label: 'Certificates', value: 'certificates', sortable: false },
    { label: 'Status', value: 'status', sortable: true }
  ];

  ngOnInit(): void {
    this.showFilterDialog = false;
    // this.initializeForm();
    this.spinner.hide();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CERTIFICATE);

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

    this.workerAccess = this.localStorageService.getItem("userAccess");
    if (this.workerAccess) {
      this.menuAccess();
    }

  }

  getLogedInClientDetail(id) {
    this._clientProfileService.getClientDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.clientUser = data.data;
          this.profileImage = this.clientUser.photo;
          this.usernameLabel = this.clientUser.user.firstName.substring(0, 1) + this.clientUser.user.lastName.substring(0, 1);
          if (this.clientUser.photo) {
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
    this.spinner.show();
  }

  openAddWorker(): void {
    this.workerDialog = true;
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
    this.filterLeftPanelService.getWorkerByNameForPendingCertificatesForAdmin(this.queryParam).subscribe(data => {

      this.filterWorkers = data.data;
      this.filterWorkers = this.filterWorkers.sort();
    });
  }

  filter(): void {
    const filterMap = new Map();
    const workerId = this.localStorageService.getLoginUserId();
    const datePipe = new DatePipe('en-US');
    this.dateErrorFlag = false;

    filterMap.set('PENDING_CERTIFICATES', 'id');
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
        size: 10000,
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

        }
      );
    }
    else {
      this.notificationService.error('Enter appropriate Date Range', '');
    }

  }


  public onDatesRangeFilterSelected(selectedValue: Date): void {
    if (this.CreatedBetweenFilterValue[1]) { // If second date is selected
      // this.calender.hide()
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
    // this.addWorkerForm.reset();
  }

  onLazyLoad(event): void {
    let filterMap = new Map();
    filterMap.set('PENDING_CERTIFICATES', 'id');
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.sortOrder = event.sortOrder == -1 ? 0 : 1;
    this.offset = event.first / event.rows;
    this.sortField = event.sortField ? event.sortField.toUpperCase() : this.sortField;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField,
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

      }
    );
  }

  onChangeStatusOfselected(): void {
    if (this.selectedWorkers.length !== 0 && this.selectedStatus) {
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
      this.notificationService.error('Select Action of Status', '');
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
    this.router.navigate([PATH_CONSTANTS.PREVIEW_MANAGE_CERTIFICATES_WORKER]);
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
  getFullName(data: User) {
    // 
    return data.firstName + ' ' + data.lastName;
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
