import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { Client } from 'src/app/module/signup/client-signup/client';
import { MarginService } from 'src/app/service/admin-services/margin/margin.service';
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
import { User } from 'src/app/shared/vo/User';
import { environment } from 'src/environments/environment';
import { SubcontractorStatusChange } from '../../admin/subcontractorStatusChange';
import { SubcontractorFilter } from './SubcontractorFilter';

@Component({
  selector: 'app-add-subcontractor',
  templateUrl: './add-subcontractor.component.html',
  styleUrls: ['./add-subcontractor.component.css']
})
export class AddSubcontractorComponent implements OnInit, OnDestroy {
  statusChangeToApproveList: any[];
  statusChangeToRejectList: any[];
  isAllCloseOutSelected: boolean;
  dateErrorFlag: any;
  subcontractorNameParams: { name: any; };
  filterSubcontractors: any;

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
  profileImage: any;

  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private notificationService: UINotificationService,
    private spinner: NgxSpinnerService,
    private subcontractorProfileDetail: SubcontractorProfileService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private confirmDialogService: ConfirmDialogueService,
    private userService: UserService,
    private marginService: MarginService,
    private forgotPasswordService: UserService,
    private dateHelperService: DateHelperService,
    private filterLeftPanelService: FilterLeftPanelDataService,

  ) {
    this.datatableParam = new DataTableParam();

    this.datatableParam = {
      offset: 0,
      size: this.size,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };
    this.loginUserId = this.localStorageService.getLoginUserId();
  }

  totalStatusCount;

  @ViewChild('dt') table: Table;
  client: Client[] = [];
  private calender: any;
  loginAsCompany: boolean;
  selectedValue = false;
  showFilterDialog: boolean;
  subcontractorRipplingDialog = false;
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
  filterObject = new SubcontractorFilter();
  CreatedBetweenFilterValue: '';
  subcontractorMarginDialog = false;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  status: StatusOptions[];
  changeStatus: StatusOptions[];
  selectedStatus: any;
  companyType: StatusOptions[];
  myForm: FormGroup;
  filterForm: FormGroup;
  myRipplingForm: FormGroup;
  myMarginForm: FormGroup;
  SubcontractorName: string;
  submittedForMargin = false;
  submittedForRiplingId = false;

  subcontractorDialog = false;
  subcontractors: any[];
  imageUrl;
  selectedSubcontractorForMargin: any;
  selectedSubcontractorForRipling: any;

  selectedSubcontractors: any[];

  subcontractorStatusChange = new SubcontractorStatusChange();

  _selectedColumns: any[];

  showButtons = true;
  subcontractorAccess: any;
  btnDisabled = false;
  columns = [
    { label: 'Profile Image', value: 'profile_image', selected: true, sortable: false },
    { label: 'Name', value: 'name', selected: true, sortable: true },
    { label: 'Company/Individual', value: 'type', selected: true, sortable: true },
    { label: 'Company Name', value: 'company_name', selected: false, sortable: true },
    { label: 'Company/Personal Email', value: 'email', selected: true, sortable: true },
    { label: 'Work Phone', value: 'work_phone', selected: false, sortable: true },
    { label: 'Mobile Phone', value: 'mobile_phone', selected: false, sortable: true },
    { label: 'Created Date', value: 'created_date', selected: false, sortable: true },
    { label: 'Email Verified?', value: 'is_verified', selected: false, sortable: true },
    { label: 'Certificates', value: 'certificates', selected: true, sortable: false },
    { label: 'Status', value: 'is_active', selected: false, sortable: true }
  ];

  ngOnInit(): void {
    this.selectedSubcontractors = [];
    this.showFilterDialog = false;
    this.initializeForm();
    this.initializeMarginForm();
    this.initializeRiplingIdForm();
    this.spinner.hide();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CERTIFICATE);
    this.SubcontractorName = 'Subcontractor User';
    this._selectedColumns = this.columns.filter(a => a.selected == true);

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


    this.subcontractorAccess = this.localStorageService.getItem('userAccess');
    if (this.subcontractorAccess) {
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
    this.subcontractorProfileDetail.getSubcontractorDetail(id).subscribe(
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

    this.filterForm = this.formBuilder.group({
      name: [''],
      email: [''],
      status: [''],
      type: [''],
      postedStart: [''],
      postedEnd: [''],
      genericSearch: []
    });

    this.companyType = [
      { option: 'All', value: 2 },
      { option: 'Company', value: 1 },
      { option: 'Individual', value: 0 },
    ];

    this.status = [
      { option: 'All', value: 2 },
      { option: 'Active', value: 1 },
      { option: 'Inactive', value: 0 },
    ];

    this.changeStatus = [{ option: 'Activate', value: 1 },
    { option: 'Inactivate', value: 0 }];

    this.selectedSubcontractors = [];
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }

  openFilter(): void {
    this.showFilterDialog = !this.showFilterDialog;
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

  initializeMarginForm() {
    this.myMarginForm = this.formBuilder.group({
      id: [],
      setMargin: [null, [CustomValidator.required, Validators.maxLength(3)]],
      paymentTerms: [null, [CustomValidator.required, Validators.maxLength(3)]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      createdDate: [],
      updatedDate: []
    });
  }

  openAddsubcontractor(): void {
    this.submitted = false;
    this.subcontractorDialog = true;
    this.initializeForm();
  }

  hideAddsubcontractor(): void {
    this.submitted = false;
    this.subcontractorDialog = false;
  }

  onClick(event) {

    this.initializeForm();
    this.submitted = false;
  }

  apply(): void {
  }

  search(): void {
    const data = this.filterObject;
    if (this.CreatedBetweenFilterValue) {
      // this.filterObject.createdFromDate=this.CreatedBetweenFilterValue[0];
      // this.filterObject.createdToDate=this.CreatedBetweenFilterValue[1];
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
        this.myForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
      }
      this.submitted = true;
      return false;
    }
    else {

      this.userService.addUser(JSON.stringify(this.myForm.value)).subscribe(data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success('Subcontractor added successfully', '');
          this.submitted = false;
          this.hideAddsubcontractor();
          this.loadsubContractorList();
        } else {
          this.notificationService.error(data.message, '');
          this.submitted = false;
          this.loadsubContractorList();
        }
      });
    }
  }

  hideDialog(): void {
    this.subcontractorDialog = !this.subcontractorDialog;
  }

  onLazyLoad(event): void {

    let filterMap = new Map();
    filterMap.set('PENDING_CERTIFICATES', 'id');
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

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

    this.loadsubContractorList();
  }

  loadsubContractorList(): void {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.subcontractorProfileDetail.getAllSubcontractorDetail(this.queryParam).subscribe(
      data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.loading = false;
          this.subcontractors = data.data.result;
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

  getSubcontractorByName(name): void {
    this.subcontractorNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.subcontractorNameParams);
    this.filterLeftPanelService.getSubcontractorByNameForPendingCertificatesForAdmin(this.queryParam).subscribe(data => {

      this.filterSubcontractors = data.data;
      this.filterSubcontractors = this.filterSubcontractors.sort();
    });
  }

  filter(): void {
    const filterMap = new Map();
    const workerId = this.localStorageService.getLoginUserId();
    const datePipe = new DatePipe('en-US');
    this.dateErrorFlag = false;

    filterMap.set('PENDING_CERTIFICATES', 'id');

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
      filterMap.set('NAME', this.filterForm.value.name.firstName);
    }

    if (this.filterForm.value.email) {
      filterMap.set('EMAIL', this.filterForm.value.email);
    }

    if (this.filterForm.value.status) {
      if (this.filterForm.value.status.value === 1) {
        filterMap.set('STATUS', true);
      }
      if (this.filterForm.value.status.value === 0) {
        filterMap.set('STATUS', false);
      }
    }

    if (this.filterForm.value.type) {
      if (this.filterForm.value.type.value === 1) {
        filterMap.set('TYPE', true);
      }
      if (this.filterForm.value.type.value === 0) {
        filterMap.set('TYPE', false);
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
      this.subcontractorProfileDetail.getAllSubcontractorDetail(this.queryParam).subscribe(
        data => {

          if (data.statusCode === '200' && data.message === 'OK') {
            this.loading = false;
            this.subcontractors = data.data.result;
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

  onChangeStatusOfselected(): void {
    if (this.selectedSubcontractors.length !== 0 && this.selectedStatus) {
      if (this.selectedStatus.option === 'Activate') {
        const idList = [];
        this.selectedSubcontractors.forEach(e => {
          idList.push(e.subcontractorProfile.user.id);
        });
        this.onActiveSubcontractor(idList);
      }
      if (this.selectedStatus.option === 'Inactivate') {
        const idList = [];
        this.selectedSubcontractors.forEach(e => {
          idList.push(e.subcontractorProfile.user.id);
        });
        this.onInactiveSubcontractor(idList);
      }
    } else {
      this.notificationService.error('Select Action of Status', '');
    }
  }

  onActiveSubcontractor(list): void {
    this.subcontractorStatusChange = new SubcontractorStatusChange();
    this.subcontractorStatusChange.userIds = [];
    this.subcontractorStatusChange.userIds = list;
    this.subcontractorStatusChange.createdBy = this.loginUserId;
    this.subcontractorStatusChange.updatedBy = this.loginUserId;

    this.userService.activateUser(this.subcontractorStatusChange).subscribe(
      data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('subcontractor.activated'), '');
          this.selectedSubcontractors = [];
          this.loadsubContractorList();
        } else {
          this.notificationService.error(data.message, '');
          this.selectedSubcontractors = [];
          this.loadsubContractorList();
        }
      });
  }

  onInactiveSubcontractor(list): void {
    this.subcontractorStatusChange = new SubcontractorStatusChange();
    this.subcontractorStatusChange.userIds = [];
    this.subcontractorStatusChange.userIds = list;
    this.subcontractorStatusChange.createdBy = this.loginUserId;
    this.subcontractorStatusChange.updatedBy = this.loginUserId;

    this.userService.deactivateUser(this.subcontractorStatusChange).subscribe(
      data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('subcontractor.inactivated'), '');
          this.selectedSubcontractors = [];
          this.loadsubContractorList();
        } else {
          this.notificationService.error(data.message, '');
          this.selectedSubcontractors = [];
          this.loadsubContractorList();
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
    this.forgotPasswordService.forgotPassword(this.queryParam).subscribe(data => {
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

  manageReferences(user): void {
    this.localStorageService.setItem('subcontractorUserForManageReferences', user.subcontractorProfile.user);
    this.router.navigate([PATH_CONSTANTS.MANAGE_REFERENCES_SUBCONTRACTOR]);
  }

  manageCertificates(user): void {
    this.localStorageService.setItem('subcontractorUserForManageCertificates', user.subcontractorProfile.user);
    this.router.navigate([PATH_CONSTANTS.PREVIEW_MANAGE_CERTIFICATES_SUBCONTRACOR]);
  }

  hideRipplingDialog(): void {
    this.subcontractorRipplingDialog = false;
    this.submittedForRiplingId = false;
  }

  hideMarginDialog(): void {
    this.submittedForMargin = false;
    this.subcontractorMarginDialog = false;
  }

  showMarginDialog(subcontractor): void {

    this.selectedSubcontractorForMargin = subcontractor.subcontractorProfile;
    this.submittedForMargin = false;
    this.initializeMarginForm();
    this.myMarginForm.controls.setMargin.setValue(this.selectedSubcontractorForMargin.projectMargin);
    this.myMarginForm.controls.paymentTerms.setValue(this.selectedSubcontractorForMargin.creditPeriod);
    this.subcontractorMarginDialog = true;
  }

  showRiplingIdDialog(subcontractor): void {

    this.selectedSubcontractorForRipling = subcontractor.subcontractorProfile;
    this.submittedForRiplingId = false;
    this.initializeRiplingIdForm();
    this.myRipplingForm.controls.ripplingID.setValue(this.selectedSubcontractorForRipling.ripplingId);
    this.subcontractorRipplingDialog = true;
  }

  setAvtar(firstName, lastName): any {
    const avtarName = firstName.substring(0, 1) + lastName.substring(0, 1);
    return avtarName;
  }

  redirectToSubcontractor(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_SUBCONTRACTOR_PROFILE + '?user=' + id);
  }


  submitSetMarginForm() {
    this.submittedForMargin = true;
    if (!this.myMarginForm.valid) {
      CustomValidator.markFormGroupTouched(this.myMarginForm);
      this.submittedForMargin = false;
      return false;
    }
    else {
      let percentage: number = 0.00;
      percentage = (+parseFloat(this.myMarginForm.value.setMargin).toFixed(2));
      if ((+percentage.toFixed(2)) < 99.99) {
        this.selectedSubcontractorForMargin.projectMargin = percentage;
        this.selectedSubcontractorForMargin.creditPeriod = this.myMarginForm.value.paymentTerms;

        this.marginService.setMarginOfSubconrtactor(JSON.stringify(this.selectedSubcontractorForMargin)).subscribe(data => {

          if (data.statusCode === '200' && data.message === 'OK') {
            this.submittedForMargin = false;
            this.subcontractorMarginDialog = false;
            this.notificationService.success('Set margin successful', '');
          } else {
            this.notificationService.error(data.message, '');
          }
        },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          });
      }
      else {
        this.notificationService.error('Percentage should be less than 100.00', '');
      }
    }
  }

  submitRiplingForm() {
    this.submittedForRiplingId = true;
    if (!this.myRipplingForm.valid) {
      CustomValidator.markFormGroupTouched(this.myRipplingForm);
      this.submittedForRiplingId = false;
      return false;
    }
    else {
      this.selectedSubcontractorForRipling.ripplingId = this.myRipplingForm.value.ripplingID;

      this.marginService.setRiplingIdOfSubconrtactor(JSON.stringify(this.selectedSubcontractorForRipling)).subscribe(data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.submittedForRiplingId = false;
          this.subcontractorRipplingDialog = false;
          this.notificationService.success('RiplingId added successfully', '');
        }
        else {
          this.notificationService.error(data.message, '');
        }
      },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
        });
    }
  }


  clear(): void {
    this.filterForm.reset();
    this.filter();
  }
  getFullName(data: User) {
    // 
    return data.firstName + ' ' + data.lastName;
  }

  menuAccess(): void {
    const accessPermission = this.subcontractorAccess.filter(e => e.menuName == 'Subcontractors');
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

