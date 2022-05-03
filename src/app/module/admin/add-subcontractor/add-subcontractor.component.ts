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
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { LoginAsService } from 'src/app/service/login-as.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
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
import { SubcontractorFilter } from './SubcontractorFilter';
import { Company } from '../company/company';
import { CompanyService } from 'src/app/service/admin-services/company/company.service';

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

  // Login As
  userNameForLoginAs: { name: any; };
  filteredUserNameForLoginAs: any;
  loginAsForm: FormGroup;
  logInAsDialog = false;
  _selectedColumns: any[];
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  loggedInUser: any;
  roleName: any;
  // vik
  myCompanyForm: FormGroup;


  constructor(
    private router: Router,
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private notificationService: UINotificationService,
    private spinner: NgxSpinnerService,
    private subcontractorProfileDetail: SubcontractorProfileService,
    private confirmDialogService: ConfirmDialogueService,
    private userService: UserService,
    private marginService: MarginService,
    private forgotPasswordService: UserService,
    private loginAsService: LoginAsService,
    private dateHelperService: DateHelperService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private companyService: CompanyService,
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
  }

  totalStatusCount;

  // vik
  filteredClients: any[];
  filteredClientLength;
  companyName: any;
  companyDialog = false;
  submittedCompany = false;
  clients: Company[];

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
  addCompanyForm:FormGroup;
  SubcontractorName: string;
  submittedForMargin = false;
  submittedForRiplingId = false;


  subcontractorDialog = false;
  subcontractors: any[];
  imageUrl;
  usernameLabel;
  selectedSubcontractorForMargin: any;
  selectedSubcontractorForRipling: any;

  selectedSubcontractors: any[];

  subcontractorStatusChange = new SubcontractorStatusChange();

  postedStartDate: Date;
  postedEndDate: Date;
  showButtons = true;
  subcontractorAccess: any;
  btnDisabled = false;


  columns = [
    { label: this.translator.instant('profile.image'), value: 'profile_image', selected: true, sortable: false },
    { label: this.translator.instant('name'), value: 'name', selected: true, sortable: true },
    { label: this.translator.instant('company.type'), value: 'type', selected: true, sortable: true },
    { label: this.translator.instant('company.name'), value: 'company_name', selected: true, sortable: true },
    { label: this.translator.instant('company.personal.email'), value: 'email', selected: false, sortable: true },
    { label: this.translator.instant('work.phone'), value: 'work_phone', selected: false, sortable: true },
    { label: this.translator.instant('mobile.phone'), value: 'mobile_phone', selected: false, sortable: true },
    { label: this.translator.instant('created.date'), value: 'created_date', selected: false, sortable: true },
    { label: this.translator.instant('payment.id'), value: 'payment_rails_id', selected: false, sortable: true },
    { label: this.translator.instant('subcontarctor.ownership'), value: 'ownership', selected: true, sortable: true },
    { label: this.translator.instant('email.verified'), value: 'is_verified', selected: false, sortable: true },
    { label: this.translator.instant('set.margin'), value: 'set_margin', selected: false, sortable: false },
    { label: this.translator.instant('references'), value: 'references', selected: false, sortable: false },
    { label: this.translator.instant('certificates'), value: 'certificates', selected: false, sortable: false },
    { label: this.translator.instant('status'), value: 'is_active', selected: false, sortable: true }
  ];

  ngOnInit(): void {

    this.loggedInUser = this.localStorageService.getLoginUserObject();
    this.roleName = this.loggedInUser.roles[0].roleName;

    this.companyType = [
      { option: 'All', value: 2 },
      { option: 'Company', value: 1 },
      { option: 'Individual', value: 0 }
    ];

    this.status = [
      { option: 'All', value: 2 },
      { option: 'Active', value: 1 },
      { option: 'Inactive', value: 0 }
    ];

    this.changeStatus = [
      { option: 'Activate', value: 1 },
      { option: 'Inactivate', value: 0 }
    ];

    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.SUBCONTRACTOR_LIST);
    this.selectedColumns = this.columns.filter(a => a.selected == true);
    this.selectedSubcontractors = [];
    this.showFilterDialog = false;
    this.initializeForm();
    this.initializeMarginForm();
    this.initializeRiplingIdForm();
    this.initializeFilterForm();
    this.getClientList();
    this.spinner.hide();
    this.SubcontractorName = '';

    this.subcontractorAccess = this.localStorageService.getItem('userAccess');
    if (this.subcontractorAccess) {
      this.menuAccess();
    }

    this.addCompanyForm = this.formBuilder.group({
      company: [null],
    });
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }

  // vik
  private getClientList() {
    let datatableParam: DataTableParam = {
      offset: 0,
      size: 1000000,
      sortField: '',
      sortOrder: 1,
      searchText: '{"IS_ENABLE" : true}'
    }
    console.log(datatableParam);
    this.queryParam = this.prepareQueryParam(datatableParam);
    this.companyService.getCompanyList(this.queryParam).subscribe(
      data => {

        console.log(data);
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.clients = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  onSelectCompany(event) {
    if (event.id === 'buttonId') {
      this.companyDialog = true;
    }
  }

  filterClient(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.clients.length; i++) {
      let client = this.clients[i];
      if (client.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(client);
      }
    }
    this.filteredClients = filtered;
    let client = { 'id': 'buttonId' };
    this.filteredClients.push(client);
    this.filteredClientLength = this.filteredClients.length;

  }

  openClientDialog() {
    this.submittedCompany = false;
    this.companyDialog = true;
    this.initializeCompanyForm();
  }

  hideDialogClient() {
    this.companyDialog = false;
    this.submittedCompany = false;
    this.initializeCompanyForm();
  }


  initializeCompanyForm(): void {
    this.myCompanyForm = this.formBuilder.group({
      id: [],
      name: ['', [CustomValidator.required, Validators.maxLength(50)]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isEnable: 1
    });
  }

  onSubmitClient() {
    this.submittedCompany = true;
    if (!this.myCompanyForm.valid) {
      let controlName: string;
      for (controlName in this.myCompanyForm.controls) {
        this.myCompanyForm.controls[controlName].markAsDirty();
        this.myCompanyForm.controls[controlName].updateValueAndValidity();
      }
      this.submittedCompany = true;
      return false;
    }
    if (this.myCompanyForm.valid) {
      this.companyService.addCompany(JSON.stringify(this.myCompanyForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('create.company.successMessage'), '');
            this.companyDialog = false;
            this.submittedCompany = false;
            this.getClientList();
            // this.addNewProjectForm.controls.company.patchValue(data.data);
          }
          else {
            this.notificationService.error(data.message, '');
            this.companyDialog = false;
            this.submittedCompany = false;
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.companyDialog = false;
          this.submittedCompany = false;
        }
      );
    }
  }

  addOwnerShip() {
    if (this.selectedSubcontractors.length !== 0) {
      if (this.addCompanyForm.value.company) {
          const idList = [];
          this.selectedSubcontractors.forEach(e => {
            idList.push(e.subcontractorProfile.user.id);
          });
          this.onAddOwnerShip(idList);
      } else {
        this.notificationService.error('Select Company name', '');
      }
    }
    else {
      this.notificationService.error('Please select at least one subcontractor', '');
    }
  }

  onAddOwnerShip(list) {
    var obj = {
      "companyId": this.addCompanyForm.value.company.id,
      "subcontrcatorIds": list
    }
    this.companyService.assignCompany(obj).subscribe(
      data => {
        console.log('data =>', data);
        
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('subcontractor.ownership.added'), '');
          this.selectedSubcontractors = [];
          this.selectedStatus = null;
          this.loadsubContractorList();
        } else {
          this.notificationService.error(data.message, '');
          this.selectedSubcontractors = [];
          this.loadsubContractorList();
        }
      });
  }

  showloginAsDialog(subcontractor) {
    this.logInAsDialog = true;
    this.initializeLoginAsForm();
    this.submitted = false;
    this.loginAsForm.controls.userName.setValue(subcontractor.subcontractorProfile.user);
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
      isLoginAsCompany: [false, Boolean],
      companyName: [''],
      firstName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      lastName: ['', [CustomValidator.required, Validators.maxLength(50)]],
      email: ['', [CustomValidator.required, CustomValidator.emailValidator, Validators.maxLength(50)]],
      password: ['jKii@3456'],
      workPhone: ['', [CustomValidator.required]],
      mobilePhone: [''],
      role: 'SUBCONTRACTOR',
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      createdDate: [],
      updatedDate: [],
      isRequestFromAdmin: [true]
    });
    this.selectedSubcontractors = [];
  }

  openFilter(): void {
    this.showFilterDialog = !this.showFilterDialog;
    this.initializeFilterForm();
  }

  initializeFilterForm() {
    this.filterForm = this.formBuilder.group({
      name: [''],
      email: [''],
      status: [''],
      type: [''],
      postedStart: [''],
      postedEnd: [''],
      genericSearch: []
    });
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
      setMargin: [, [CustomValidator.required, Validators.maxLength(2), Validators.min(0.01)]],
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
    this.myForm.controls.isLoginAsCompany.setValue(false);
    this.initializeForm();
  }

  onClick(event) {
    this.initializeForm();
    this.submitted = false;
  }

  apply(): void {
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
    this.initializeForm();
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
        console.log(error);
      }
    );
  }

  getSubcontractorByName(name): void {
    this.subcontractorNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.subcontractorNameParams);
    this.filterLeftPanelService.getSubcontractorByName(this.queryParam).subscribe(data => {
      this.filterSubcontractors = data.data;
      this.filterSubcontractors = this.filterSubcontractors.sort();
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
          console.log(error);
        }
      );
    }
    else {
      this.notificationService.error('Enter appropriate Date Range', '');
    }
  }

  onChangeStatusOfselected(): void {
    if (this.selectedSubcontractors.length !== 0) {
      if (this.selectedStatus) {
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
        this.notificationService.error('Select action of Status', '');
      }
    }
    else {
      this.notificationService.error('Please select at least one subcontractor', '');
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
          this.selectedStatus = null;
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
          this.selectedStatus = null;
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
    this.router.navigate([PATH_CONSTANTS.MANAGE_CERTIFICATE_SUBCONTRACTOR]);
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
    this.SubcontractorName = subcontractor.subcontractorProfile.user.firstName + ' ' + subcontractor.subcontractorProfile.user.lastName;
    this.submittedForMargin = false;
    this.initializeMarginForm();
    if (this.selectedSubcontractorForMargin.projectMargin !== 0) {
      this.myMarginForm.controls.setMargin.setValue(this.selectedSubcontractorForMargin.projectMargin);
    }
    if (this.selectedSubcontractorForMargin.creditPeriod !== 0) {
      this.myMarginForm.controls.paymentTerms.setValue(this.selectedSubcontractorForMargin.creditPeriod);
    }
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
      let percentage = 0.00;
      percentage = (+parseFloat(this.myMarginForm.value.setMargin).toFixed(2));
      if ((+percentage.toFixed(2)) < 99.99) {
        this.selectedSubcontractorForMargin.projectMargin = percentage;
        this.selectedSubcontractorForMargin.creditPeriod = this.myMarginForm.value.paymentTerms;
        this.marginService.setMarginOfSubconrtactor(JSON.stringify(this.selectedSubcontractorForMargin)).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.submittedForMargin = false;
            this.subcontractorMarginDialog = false;
            this.notificationService.success('Set margin successfully', '');
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
    this.globalFilter = null;
    this.filter();
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

  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }

  openConfirmationDialog(): void {
    let options = null;
    const message = 'Do you want to cancel the add subcontractor operation';
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.hideAddsubcontractor();
      }
    });
  }

}
