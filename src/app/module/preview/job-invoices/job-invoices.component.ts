import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { InvoiceService } from 'src/app/service/subcontractor-services/invoice.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { environment } from 'src/environments/environment';
import { InvoiceDTO } from '../../admin/vos/InvoiceDTO';
@Component({
  selector: 'app-job-invoices',
  templateUrl: './job-invoices.component.html',
  styleUrls: ['./job-invoices.component.css']
})
export class JobInvoicesComponent implements OnInit {

  columns = [
    { label: 'User', value: 'user', sortable: false, isHidden: false, field: 'user', selected: true },
    { label: 'Week', value: 'WEEK_START', sortable: true, isHidden: false, field: 'week', selected: true },
    { label: 'Invoice Date', value: 'INVOICE_DATE', sortable: true, isHidden: false, field: 'invoiceDate', selected: false },
    { label: 'Invoice Type', value: 'status', sortable: false, isHidden: false, field: 'invoiceType', selected: true },
    { label: 'Invoice No', value: 'invoiceNumber', sortable: false, isHidden: false, field: 'invoiceNumber', selected: false },
    { label: 'Invoice Amount', value: 'INVOICE_AMOUNT', sortable: true, isHidden: false, field: 'invoiceAmount', selected: true },
    { label: 'Invoice', value: 'invoice', sortable: false, isHidden: false, field: 'invoice', selected: false },
    { label: 'Invoice Status', value: 'status', sortable: false, isHidden: false, field: 'status', selected: true },
  ];
  myForm: FormGroup;
  status = [
    { label: 'Due', value: 'DUE' },
    { label: 'Paid', value: 'PAID' }
  ];
  filteredStatus: any[];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords = 0;
  workWeekEndDate = new Date();
  workWeekStartDate;
  subscription = new Subscription();
  selectedJob: any;
  globalFilter: string;
  datatableParam = new DataTableParam();
  queryParam;
  invoiceList = [];
  workerNameParams: { name: any; };
  filterWorkers: any;
  isSelectedJob: boolean;
  jobTitle: any;
  weekErrorFlag: boolean;
  isFilterOpened = false;
  user: any;
  rolename: any;
  loggedInUserName: string;
  usernameLabel: string;
  displayAvatar: boolean;
  avatarColor: string = '#2196F3';
  client: any;
  profileImage: any;
  singleImageView: string;
  workerDto: any;
  subcontractor: any;

  showButtons: boolean = true;
  jobAccess: any;
  btnDisabled: boolean = false;

  sortField = 'CREATED_DATE';
  offset = 0;
  sortOrder = 0;
  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private localStorageService: LocalStorageService,
    private fileService: FileDownloadService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private _subContractorProfileServices: SubcontractorProfileService,
    private dateHelperService: DateHelperService
  ) {
    this.captionChangeService.hideHeaderSubject.next(true);

    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
      this.loggedInUserName = this.user.firstName + ' ' + this.user.lastName;
    } else {
      this.loggedInUserName = 'Guest';
    }

  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.initializeForm();
    this.setDefaultCriteria();
    this.myForm.get('workerWeekStart').valueChanges.subscribe(data => {
      this.workWeekEndDate = new Date(data);
      this.workWeekEndDate.setDate(this.workWeekEndDate.getDate() + 6);
      if (data === undefined) {
        this.myForm.get('workerWeekEnd').patchValue(null);
      }
      else {
        this.myForm.get('workerWeekEnd').patchValue(this.workWeekEndDate);
      }

    });


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
    this.jobAccess = this.localStorageService.getItem("userAccess");
    if (this.jobAccess) {
      this.menuAccess();
    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      worker: [],
      status: [],
      workerWeekStart: [],
      workerWeekEnd: []

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


  downloadExcel() {
    const filterMap = new Map();
    filterMap.set('TYPE', 'JOB');
    filterMap.set('STATUS', 'DUE');
    filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED_JOB', ['CANCELLED', 'COMPLETED'].toString());
    const datePipe = new DatePipe('en-US');
    if (((this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) ||
      (!this.myForm.value.workerWeekStart && this.myForm.value.workerWeekEnd))) {
      this.weekErrorFlag = true;
    }

    if (!this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) {
      this.weekErrorFlag = false;
    }
    if (this.selectedJob) {
      filterMap.set('JOB_ID', this.selectedJob.id);
    }
    if (this.myForm.value.worker) {
      filterMap.set('WORKER_ID', this.myForm.value.worker.id);
    }
    if (this.myForm.value.status) {
      filterMap.set('STATUS', this.myForm.value.status.value);
    }
    if (this.myForm.value.workerWeekStart) {
      this.dateHelperService.setStartDate(this.myForm.value.workerWeekStart);
      const value = datePipe.transform(this.myForm.value.workerWeekStart, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('WEEK_START', value);
    }
    if (this.myForm.value.workerWeekEnd) {
      this.dateHelperService.setEndDate(this.myForm.value.workerWeekEnd);
      const valueEnd = datePipe.transform(this.myForm.value.workerWeekEnd, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('WEEK_END', valueEnd);
    }

    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    const queryParam = this.prepareQueryParam(this.datatableParam);
    this.invoiceService.exportToExcel(queryParam).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
        const fileName = 'worker-invoices';
        saveAs(blob, fileName);
      },
      error => {

      }
    );
  }
  // tslint:disable-next-line: typedef
  prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }
  filterStatus(event): void {
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.status.length; i++) {
      const status = this.status[i];
      if (status.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(status);
      }
    }
    this.filteredStatus = filtered;
    this.filteredStatus = this.filteredStatus.sort();
  }
  filter(): void {

    const filterMap = new Map();
    const datePipe = new DatePipe('en-US');
    this.weekErrorFlag = false;
    if (((this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) ||
      (!this.myForm.value.workerWeekStart && this.myForm.value.workerWeekEnd))) {
      this.weekErrorFlag = true;
    }

    if (!this.myForm.value.workerWeekStart && !this.myForm.value.workerWeekEnd) {
      this.weekErrorFlag = false;
    }
    filterMap.set('TYPE', 'JOB');
    filterMap.set('STATUS', 'DUE');
    filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED_JOB', ['CANCELLED', 'COMPLETED'].toString());
    if (this.selectedJob) {
      filterMap.set('JOB_ID', this.selectedJob.id);
    }

    if (this.myForm.value.worker) {
      filterMap.set('WORKER_ID', this.myForm.value.worker.id);
      filterMap.set('TO_TYPE', 'WORKER_TO_PLATFORM');

    }
    if (this.myForm.value.status) {
      filterMap.set('STATUS', this.myForm.value.status.value);
    }
    if (this.myForm.value.workerWeekStart) {
      this.dateHelperService.setStartDate(this.myForm.value.workerWeekStart);
      const value = datePipe.transform(this.myForm.value.workerWeekStart, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('WEEK_START', value);
    }
    if (this.myForm.value.workerWeekEnd) {
      this.dateHelperService.setEndDate(this.myForm.value.workerWeekEnd);
      const valueEnd = datePipe.transform(this.myForm.value.workerWeekEnd, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('WEEK_END', valueEnd);
    }

    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getInvoiceList();

  }
  setDefaultCriteria(): void {
    const filterMap = new Map();
    filterMap.set('TYPE', 'JOB');
    filterMap.set('STATUS', 'DUE');
    filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED_JOB', ['CANCELLED', 'COMPLETED'].toString());
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getInvoiceList();
  }
  getInvoiceList(): void {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.invoiceService.getAllInvoices(this.queryParam).subscribe(data => {
      if (data.data?.result) {
        this.invoiceList = data.data.result;
        this.totalRecords = data.data.totalRecords;
      }
    });
  }
  downloadDocument(id, name): void {
    this.fileService.downloadFiles(id, name).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const fileName = name;
        saveAs(blob, fileName);
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        // 
      }
    );
  }

  getWorkerByName(name): void {
    this.workerNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.workerNameParams);
    this.filterLeftPanelService.getWorkerByNameForDueInvoicesForAdmin(this.queryParam).subscribe(data => {

      this.filterWorkers = data.data;

      this.filterWorkers = this.filterWorkers.sort();
    });
  }
  clear() {
    this.myForm.reset();
    this.setDefaultCriteria();
  }
  onStatusChange(event, data) {


    const invoiceDTO = new InvoiceDTO();
    invoiceDTO.id = data.id;
    invoiceDTO.status = event.value;

    this.invoiceService.updateStatus(invoiceDTO).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('status.changed.to.paid'), '');
        this.setDefaultCriteria();
      } else {
        this.notificationService.error(data.errorCode, '');
      }
    });
  }
  onFilterOpen() {
    this.isFilterOpened = !this.isFilterOpened
  }
  getFullName(data: User) {
    // 
    return data.firstName + ' ' + data.lastName;
  }

  menuAccess(): void {
    let accessPermission = this.jobAccess.filter(e => e.menuName == 'Jobs');
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
  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.offset = event.first / event.rows;
    this.sortField = event.sortField ? event.sortField.toUpperCase() : this.sortField;
    const filterMap = new Map();
    const selectedJobObject = this.localStorageService.getSelectedJob();
    filterMap.set('TYPE', 'JOB');
    filterMap.set('STATUS', 'DUE');
    filterMap.set('WITHOUT_CANCELLED_AND_COMPLETED_JOB', ['CANCELLED', 'COMPLETED'].toString());
    if (this.selectedJob) {
      if (this.selectedJob.id !== 'jobId') {
        filterMap.set('JOB_ID', this.selectedJob.id);
      }
    }
    if (selectedJobObject) {
      if (selectedJobObject.id !== 'jobId') {
        filterMap.set('JOB_ID', selectedJobObject.id);
      }
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getInvoiceList();
  }
}
