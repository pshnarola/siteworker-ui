import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ManageReferencesService } from 'src/app/service/admin-services/manage-references.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { ApproveRejectReferenceDTO } from '../vos/ApproveRejectReferenceDTO';

@Component({
  selector: 'app-manage-references-worker',
  templateUrl: './manage-references-worker.component.html',
  styleUrls: ['./manage-references-worker.component.css']
})
export class ManageReferencesWorkerComponent implements OnInit, OnDestroy {

  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  loading = false;

  datatableParam: DataTableParam;
  offset = 0;
  totalRecords = 0;
  sortField = 'NAME';
  sortOrder = 0;

  loginUserId: any;

  isFilterOpened = false;

  selectedreferences = [];
  emptyArray = [];
  list = [];
  _selectedColumns: any[];
  myForm: FormGroup;

  actionTypes = [
    { name: 'APPROVE', value: 'Approve' },
    { name: 'REJECT', value: 'Reject' }
  ];

  columns = [
    { label: this.translator.instant('name'), value: 'fullName', sortable: true, isHidden: false, selected: true },
    { label: this.translator.instant('designation'), value: 'jobTitle', sortable: true, isHidden: false, selected: true },
    { label: this.translator.instant('company.name'), value: 'companyName', sortable: true, isHidden: false, selected: true },
    { label: this.translator.instant('email.address'), value: 'email', sortable: true, isHidden: false, selected: true },
    { label: this.translator.instant('work.phone'), value: 'workPhone', sortable: true, isHidden: false, selected: false },
    { label: this.translator.instant('mobile.phone'), value: 'mobilePhone', sortable: true, isHidden: false, selected: false },
    { label: this.translator.instant('reference'), value: 'comment', sortable: true, isHidden: false, selected: false },
    { label: this.translator.instant('reference.posted.on'), value: 'createdDate', sortable: true, isHidden: false, selected: false },
    { label: this.translator.instant('status'), value: 'status', sortable: true, isHidden: false, selected: true },
  ];

  selectedList: any[];
  selectedAction: any;
  status: any;
  subscription = new Subscription();
  isSelectedProject: any;
  isSelectedJobsite: any;
  queryParam;
  referenceList = [];
  isAllReferencesSelected: boolean;
  selectedReferencesList = [];
  approveOrReject: any;
  totalStatusCount = 0;
  workerName: any;
  dateErrorFlag: boolean;
  globalFilter: string;
  postedStart;
  postedStartDate;
  constructor(
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private manageReferencesService: ManageReferencesService,
    private dateHelperService: DateHelperService
  ) {
    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: null
    };
    this.loginUserId = localStorageService.getLoginUserId();
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideSidebarSubject.next(true);
    this.getWorkerManageReferences(this.localStorageService.getItem('workerUserForManageReferences'));
    const worker = this.localStorageService.getItem('workerUserForManageReferences');
    this.workerName = worker.firstName + ' ' + worker.lastName;
    this.initializeFilterFormGroup();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.MANAGE_REFERENCES_WORKER);
    this._selectedColumns = this.columns.filter(a => a.selected == true);
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
  public initializeFilterFormGroup(): void {
    this.myForm = this.formBuilder.group({
      name: [''],
      email: [''],
      postedStart: [''],
      postedEnd: [''],
      genericSearch: []
    });
  }

  clear(): void {
    this.myForm.reset();
    this.getWorkerManageReferences(this.localStorageService.getItem('workerUserForManageReferences'));
  }


  filter(): void {
    this.dateErrorFlag = false;
    const filterMap = new Map();
    let worker = this.localStorageService.getItem('workerUserForManageReferences');
    const datePipe = new DatePipe('en-US');
    filterMap.set('USER_ID', worker.id);
    if (((this.myForm.value.postedStart && !this.myForm.value.postedEnd) ||
      (!this.myForm.value.postedStart && this.myForm.value.postedEnd))) {
      this.dateErrorFlag = true;
    }

    if (!this.myForm.value.postedStart && !this.myForm.value.postedEnd) {
      this.dateErrorFlag = false;
    }
    if (this.myForm.value.name) {
      filterMap.set('NAME', this.myForm.value.name);
    }
    if (this.myForm.value.email) {
      filterMap.set('EMAIL', this.myForm.value.email);
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
      this.manageReferencesService.getWorkerReferences(this.queryParam).subscribe(data => {
        this.referenceList = data.data.result;

        this.totalStatusCount = 0;
        this.referenceList.forEach(
          e => {
            if (e.status === 'APPROVED') {
              this.totalStatusCount++;
            }
          }
        );
      });
    }
    else {
      this.notificationService.error('Enter appropriate Date Range', '');
    }

  }

  getWorkerManageReferences(user): void {
    const filterMap = new Map();
    filterMap.set('USER_ID', user.id);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    const globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.manageReferencesService.getWorkerReferences(this.queryParam).subscribe(data => {
      this.referenceList = data.data.result;

      this.totalStatusCount = 0;
      this.referenceList.forEach(
        e => {
          if (e.status === 'PENDING') {
            this.totalStatusCount++;
          }
        }
      );
    });
  }
  ngOnDestroy(): void {
    this.localStorageService.removeItem('workerUserForManageReferences');
  }
  selectReference(e): void {
    if (e.checked && !this.isAllReferencesSelected) {
      this.selectedReferencesList.push(e.value);
    }
    else {
      const index = this.selectedReferencesList.findIndex(data => data.id === e.value.id);
      this.selectedReferencesList.splice(index, 1);
    }

  }
  selectAllReferences(e): void {

    const length = e.dt._value.length;
    if (e.checked) {
      this.isAllReferencesSelected = true;
      for (let i = 0; i < length; i++) {
        if (e.dt._value[i].status === 'PENDING') {
          this.selectedReferencesList.push(e.dt._value[i]);
        }
      }
    }
    else {
      this.isAllReferencesSelected = false;
      this.selectedReferencesList.splice(0, length);
    }

  }

  apply() {

    if (this.selectedReferencesList.length > 0) {
      this.rejectReferences();
      // if (this.approveOrReject) {
      //   if (this.approveOrReject.value === 'Reject') {
      //     this.rejectReferences();
      //   }
      //   else {
      //     this.approveReferences();
      //   }
      // }else{
      //   this.notificationService.error('Select action of Status', '');
      // }
    }
    else {
      this.notificationService.error(this.translator.instant('please.select.atleast.one.reference.to.reject.or.approve'), '');
    }
  }
  approveReferences(): void {
    const approveRejectDTO = new ApproveRejectReferenceDTO();
    approveRejectDTO.workerReferences = this.selectedReferencesList;
    this.manageReferencesService.approveReferences(approveRejectDTO).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.references.approved'), '');
        this.selectedReferencesList.length = 0;
        this.approveOrReject = null;
        this.getWorkerManageReferences(this.localStorageService.getItem('workerUserForManageReferences'));
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  rejectReferences(): void {
    const approveRejectDTO = new ApproveRejectReferenceDTO();
    approveRejectDTO.workerReferences = this.selectedReferencesList;
    this.manageReferencesService.rejectReferences(approveRejectDTO).subscribe(data => {

      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.references.rejected'), '');
        this.selectedReferencesList.length = 0;
        this.approveOrReject = null;
        this.getWorkerManageReferences(this.localStorageService.getItem('workerUserForManageReferences'));
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  onFilterOpen() {
    this.isFilterOpened = !this.isFilterOpened;
  }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
}
