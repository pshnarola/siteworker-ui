import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { ProjectBidService } from 'src/app/service/subcontractor-services/project-bid/project-bid.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { DatePipe } from '@angular/common';
import { ApproveRejectCloseOutPackageRequestDTO } from '../Vos/ApproveRejectCloseOutPackageRequestDTO';
import { TranslateService } from '@ngx-translate/core';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { User } from 'src/app/shared/vo/User';

@Component({
  selector: 'app-close-out-package-request',
  templateUrl: './close-out-package-request.component.html',
  styleUrls: ['./close-out-package-request.component.css']
})
export class CloseOutPackageRequestComponent implements OnInit {
  columns;
  isFilterOpened = false;
  status = [
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Requested', value: 'REQUESTED' },
  ];
  applyStatus = [
    { label: 'Approve', value: 'APPROVED' },
    { label: 'Reject', value: 'REJECTED' },
  ];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  myForm: FormGroup;
  filteredStatus: any[];
  projectTitle: any;
  jobsiteTitle: any;
  subscription = new Subscription();
  filteredApplyStatus: any[];
  communicationHistoryDialog = false;
  approveOrReject;
  rejectDialog = false;
  myRejectForm: FormGroup;
  lineItemPopup = false;
  selectedJobsite: any;
  selectedProject: any;
  filterFlag = false;
  dataTableParam = new DataTableParam();
  queryParam;
  globalFilter;
  closeoutList = [];
  viewLineItem: any;
  dateErrorFlage: boolean;
  selectedCloseOutList = [];
  isAllCloseOutSelected: boolean;
  isSelectedProject = false;
  isSelectedJobsite = false;
  subcontractorNameParams: { name: any; };
  subcontractors: any;
  count: any;
  _selectedColumns: any[];

  totalStatusCount = 0;
  createdFromDate;
  createdToDate;
  fetchedDBAttachmentList = [];
  dataTableParamForAttachment = new DataTableParam();
  sortField = 'CREATED_DATE';
  subcontractor: any;
  offset = 0;
  sortOrder = 0;
  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private projectJobSelectionService: ProjectJobSelectionService,
    private projectBidService: ProjectBidService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private dateHelperService: DateHelperService,
    private translator: TranslateService,
    private filterlLeftPanelService: FilterLeftPanelDataService) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(e => {

      let project = this.localStorageService.getSelectedProjectObject();
      if (project) {
        if (project.id !== 'pid') {
          this.isSelectedProject = true;
          this.selectedProject = project;
          this.projectTitle = project.title;
        }
        else {
          this.isSelectedProject = false;
          this.selectedProject = null;
          this.projectTitle = null;
        }
      }
      else {
        this.isSelectedProject = false;
        this.selectedProject = null;
        this.projectTitle = null;
      }
      this.setColumnOfTable();
      this.setDefaultCriteria();
      this._selectedColumns = this.columns.filter(x => x.selected == true);
    }));
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(jobsite1 => {
      let jobsite = this.localStorageService.getSelectedJobsiteObject();
      if (jobsite) {
        if (jobsite.id !== 'jid') {
          this.isSelectedJobsite = true;
          this.selectedJobsite = jobsite;
          this.jobsiteTitle = jobsite.title;
        } else {
          this.isSelectedJobsite = false;
          this.selectedJobsite = null;
          this.jobsiteTitle = null;
        }
      }
      else {
        this.isSelectedJobsite = false;
        this.selectedJobsite = null;
        this.jobsiteTitle = null;
      }
      this.setDefaultCriteria();
      this.setColumnOfTable();
      this._selectedColumns = this.columns.filter(x => x.selected == true);
    }));
    this.initializeForm();
    this.setColumnOfTable();
    this._selectedColumns = this.columns.filter(x => x.selected == true);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  setColumnOfTable(): void {
    if (this.isSelectedProject && !this.isSelectedJobsite) {
      this.columns = [
        { label: 'Jobsite Title', value: 'JOBSITE_TITLE', sortable: true, isHidden: false, field: 'jobsiteTitle', selected: true },
        { label: 'Subcontractor', value: 'SUBCONTACTOR_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: true },
        { label: 'Region', value: 'REGION', sortable: true, isHidden: false, field: 'region', selected: true },
        { label: 'Created Date', value: 'CREATED_DATE', sortable: true, isHidden: false, field: 'createdDate', selected: false },
        // tslint:disable-next-line: max-line-length
        { label: 'Milestone Name', value: 'paymentMileStone.name', sortable: true, isHidden: false, field: 'milestoneName', selected: false },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Percentage', value: 'SUBCONTRACTOR_PERCENTAGE', sortable: true, isHidden: false, field: 'percentage', selected: false },
        { label: 'Amount Release', value: 'COST', sortable: true, isHidden: false, field: 'amount', selected: false },
        { label: 'Status', value: 'STATUS', sortable: true, isHidden: false, field: 'status', selected: false },

      ];
    }
    else if (this.isSelectedJobsite && this.isSelectedProject) {
      this.columns = [
        { label: 'Subcontractor', value: 'SUBCONTACTOR_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: true },
        { label: 'Region', value: 'REGION', sortable: true, isHidden: false, field: 'region', selected: true },
        { label: 'Created Date', value: 'CREATED_DATE', sortable: true, isHidden: false, field: 'createdDate', selected: false },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: true },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Percentage', value: 'SUBCONTRACTOR_PERCENTAGE', sortable: true, isHidden: false, field: 'percentage', selected: false },
        { label: 'Amount Release', value: 'COST', sortable: true, isHidden: false, field: 'amount', selected: false },
        { label: 'Status', value: 'STATUS', sortable: true, isHidden: false, field: 'status', selected: false },
      ];
    }
    else if (this.isSelectedJobsite) {
      this.columns = [
        { label: 'Project Title', value: 'PROJECT_TITLE', sortable: true, isHidden: false, field: 'projectTitle', selected: true },
        { label: 'Subcontractor', value: 'SUBCONTACTOR_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: true },
        { label: 'Region', value: 'REGION', sortable: true, isHidden: false, field: 'region', selected: true },
        { label: 'Created Date', value: 'CREATED_DATE', sortable: true, isHidden: false, field: 'createdDate', selected: false },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: false },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Percentage', value: 'SUBCONTRACTOR_PERCENTAGE', sortable: true, isHidden: false, field: 'percentage', selected: false },
        { label: 'Amount Release', value: 'COST', sortable: true, isHidden: false, field: 'amount', selected: false },
        { label: 'Status', value: 'STATUS', sortable: true, isHidden: false, field: 'status', selected: false },

      ];
    }
    else {
      this.columns = [
        { label: 'Project Title', value: 'PROJECT_TITLE', sortable: true, isHidden: false, field: 'projectTitle', selected: true },
        { label: 'Jobsite Title', value: 'JOBSITE_TITLE', sortable: true, isHidden: false, field: 'jobsiteTitle', selected: true },
        { label: 'Subcontractor', value: 'SUBCONTACTOR_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: true },
        { label: 'Created Date', value: 'CREATED_DATE', sortable: true, isHidden: false, field: 'createdDate', selected: false },
        { label: 'Region', value: 'REGION', sortable: true, isHidden: false, field: 'region', selected: true },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: false },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Percentage', value: 'SUBCONTRACTOR_PERCENTAGE', sortable: true, isHidden: false, field: 'percentage', selected: false },
        { label: 'Amount Release', value: 'COST', sortable: true, isHidden: false, field: 'amount', selected: false },
        { label: 'Status', value: 'STATUS', sortable: true, isHidden: false, field: 'status', selected: false },

      ];
    }
  }


  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }

  initializeForm() {
    this.myForm = this.formBuilder.group({
      assignedTo: [],
      createdFrom: [],
      createdTo: [],
      status: []
    });
  }
  initializeRejectForm() {
    this.myRejectForm = this.formBuilder.group({
      rejectionReason: [],

    });
  }
  apply() {
    if (this.selectedCloseOutList.length > 0) {
      if (this.approveOrReject) {
        if (this.approveOrReject.label === 'Reject') {
          this.rejectDialog = true;
          this.initializeRejectForm();
        }
        else {
          this.approveCloseout();
        }
      } else {
        this.notificationService.error('Select action of Status', '');
      }
    }
    else {
      this.notificationService.error(this.translator.instant('please.select.atleast.one.closeout.to.reject.or.approve'), '');
    }
  }
  approveCloseout(): void {
    let approveRejectDTO = new ApproveRejectCloseOutPackageRequestDTO();
    approveRejectDTO.closeOutPackages = this.selectedCloseOutList;
    this.projectBidService.approveCloseOutRequest(approveRejectDTO).subscribe(data => {
      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.closeouts.approved'), '');
        this.selectedCloseOutList = [];
        this.approveOrReject = null;
        this.getCloseOutList();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  hideRejectDialog(): void {
    this.rejectDialog = false;
  }
  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
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
  filterApplyStatus(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.applyStatus.length; i++) {
      const status = this.applyStatus[i];
      if (status.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(status);
      }
    }
    this.filteredApplyStatus = filtered;
    this.filteredApplyStatus = this.filteredApplyStatus.sort();
  }
  filter(): void {
    this.filterFlag = true;
    this.dateErrorFlage = false;
    const filterMap = new Map();
    let loggedInUserId = this.localStorageService.getLoginUserId();
    const selectedProjectObject = this.localStorageService.getSelectedProjectObject();
    const selectedJobsiteObject = this.localStorageService.getSelectedJobsiteObject();
    if (this.selectedProject) {
      if (this.selectedProject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
      }
    }
    else if (selectedProjectObject) {
      if (selectedProjectObject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', selectedProjectObject.id);
      }
    }
    if (this.selectedJobsite) {
      if (this.selectedJobsite.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
      }
    }
    else if (selectedJobsiteObject) {
      if (selectedJobsiteObject.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', selectedJobsiteObject.id);
      }
    }
    filterMap.set('CLIENT_ID', loggedInUserId);
    filterMap.set('WITHOUT_CANCELLED_COMPLETED_PROJECT', ['COMPLETED', 'CANCELLED'].toString());
    if (((this.myForm.value.createdFrom && !this.myForm.value.createdTo) ||
      (!this.myForm.value.createdFrom && this.myForm.value.createdTo))) {
      this.dateErrorFlage = true;
    }

    if (!this.myForm.value.createdFrom && !this.myForm.value.createdTo) {
      this.dateErrorFlage = false;
    }
    filterMap.set('REQUESTED_STATUS', '');
    if (this.myForm.value.status) {
      filterMap.set('STATUS', this.myForm.value.status.value);
    }
    if (this.myForm.value.assignedTo) {
      filterMap.set('SUBCONTRACTOR_ID', this.myForm.value.assignedTo.id);
    }
    const datePipe = new DatePipe('en-US');
    if (this.myForm.value.createdFrom) {
      this.dateHelperService.setStartDate(this.myForm.value.createdFrom);
      const value = datePipe.transform(this.myForm.value.createdFrom, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('CREATED_DATE_FROM', value);
    }
    if (this.myForm.value.createdTo) {
      this.dateHelperService.setEndDate(this.myForm.value.createdTo);
      const valueEnd = datePipe.transform(this.myForm.value.createdTo, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('CREATED_DATE_TO', valueEnd);
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    if (!this.dateErrorFlage) {
      this.dataTableParam = {
        offset: this.offset,
        size: this.size,
        sortField: this.sortField.toUpperCase(),
        sortOrder: this.sortOrder,
        searchText: this.globalFilter
      };
      this.getCloseOutList();
    }
    else {
      this.notificationService.error(this.translator.instant('please.enter.appropriate.date.range'), '');
    }
  }
  onFilterClear(): void {
    this.myForm.reset();
    this.setDefaultCriteria();
  }
  hideDialog(): void {
    this.communicationHistoryDialog = false;
  }
  onSubmitRejection(): void {
    let approveRejectDTO = new ApproveRejectCloseOutPackageRequestDTO();
    approveRejectDTO.closeOutPackages = this.selectedCloseOutList;
    approveRejectDTO.reasonToReject = this.myRejectForm.value.rejectionReason;
    this.projectBidService.rejectCloseOutRequest(approveRejectDTO).subscribe(data => {
      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.closeouts.rejected'), '');
        this.rejectDialog = false;
        this.selectedCloseOutList = [];
        this.approveOrReject = null;
        this.getCloseOutList();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  lineItemDeliverablePopup(lineItem): void {
    this.lineItemPopup = true;
    this.viewLineItem = lineItem;
  }
  hideLineItemDialog(): void {
    this.lineItemPopup = false;
  }
  setDefaultCriteria(): void {
    const filterMap = new Map();
    let loggedInUserId = this.localStorageService.getLoginUserId();
    filterMap.set('CLIENT_ID', loggedInUserId);
    filterMap.set('WITHOUT_CANCELLED_COMPLETED_PROJECT', ['COMPLETED', 'CANCELLED'].toString());
    const selectedProjectObject = this.localStorageService.getSelectedProjectObject();
    const selectedJobsiteObject = this.localStorageService.getSelectedJobsiteObject();
    if (this.selectedProject) {
      if (this.selectedProject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
      }
    }
    else if (selectedProjectObject) {
      if (selectedProjectObject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', selectedProjectObject.id);
      }
    }
    if (this.selectedJobsite) {
      if (this.selectedJobsite.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
      }
    }
    else if (selectedJobsiteObject) {
      if (selectedJobsiteObject.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', selectedJobsiteObject.id);
      }
    }
    filterMap.set('REQUESTED_STATUS', '');
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getCloseOutList();
  }
  getCloseOutList(): void {
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.projectBidService.getCloseout(this.queryParam).subscribe(data => {
      this.totalStatusCount = 0;
      if (data.data?.result) {
        this.closeoutList = data.data.result;
        this.totalRecords = data.data.totalRecords;
        this.closeoutList.forEach(
          e => {
            if (e.status === 'REQUESTED') {
              this.totalStatusCount++;
            }
          }
        );
      }
    });
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
  getCloseoutAttachmentByCloseOutId(id): void {
    const filterMap = new Map();
    filterMap.set('CLOSE_OUT_PACKAGE_ID', id);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParamForAttachment = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParamForAttachment);
    this.projectBidService.getCloseOutDocuments(this.queryParam).subscribe(data => {
      this.fetchedDBAttachmentList = data.data.result;
      if (this.fetchedDBAttachmentList.length) {
        this.downloadDocuments(id);
      }
      else {
        this.notificationService.error('Documents are not uploaded yet', '');
      }
    });
  }
  downloadDocuments(id): void {

    this.projectBidService.downloadCloseOutDocuments(id).subscribe(data => {
      const blob = new Blob([data], { type: 'application/zip' });
      const fileName = 'CloseoutDocuments';
      saveAs(blob, fileName);
    });
  }
  openCommunicationHistory(data): void {
    this.projectJobSelectionService.addProjectSubject.next(data.projectDetail);
    this.localStorageService.setItem('selectedProject', data.projectDetail);
    this.router.navigate(['/client/chat-messages']);
  }
  selectCloseOut(e): void {
    if (e.checked && !this.isAllCloseOutSelected) {
      this.selectedCloseOutList.push(e.value);
    }
    else {
      const index = this.selectedCloseOutList.findIndex(data => data.id === e.value.id);
      this.selectedCloseOutList.splice(index, 1);
    }
  }
  selectAllCloseOut(e): void {
    const length = e.dt._value.length;
    if (e.checked) {
      this.isAllCloseOutSelected = true;
      for (let i = 0; i < length; i++) {
        if (e.dt._value[i].status === 'REQUESTED') {
          this.selectedCloseOutList.push(e.dt._value[i]);
        }
      }
    }
    else {
      this.isAllCloseOutSelected = false;
      this.selectedCloseOutList.splice(0, length);
    }
  }
  getSubcontractorByName(name): void {
    this.subcontractorNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.subcontractorNameParams);
    this.filterlLeftPanelService.getSubcontractorByName(this.queryParam).subscribe(data => {
      this.subcontractors = data.data;
      this.subcontractors = this.subcontractors.sort();
    });
  }
  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }
  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.offset = event.first / event.rows;
    this.sortField = event.sortField ? event.sortField.toUpperCase() : this.sortField;
    const filterMap = new Map();
    const loggedInUserId = this.localStorageService.getLoginUserId();
    const selectedProjectObject = this.localStorageService.getSelectedProjectObject();
    const selectedJobsiteObject = this.localStorageService.getSelectedJobsiteObject();
    filterMap.set('CLIENT_ID', loggedInUserId);
    filterMap.set('WITHOUT_CANCELLED_COMPLETED_PROJECT', ['COMPLETED', 'CANCELLED'].toString());
    if (this.selectedProject) {
      if (this.selectedProject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
      }
    }
    else if (selectedProjectObject) {
      if (selectedProjectObject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', selectedProjectObject.id);
      }
    }
    if (this.selectedJobsite) {
      if (this.selectedJobsite.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
      }
    }
    else if (selectedJobsiteObject) {
      if (selectedJobsiteObject.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', selectedJobsiteObject.id);
      }
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };

    this.getCloseOutList();
  }
}
