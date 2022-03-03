import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ProjectBidService } from 'src/app/service/subcontractor-services/project-bid/project-bid.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-closeout-package',
  templateUrl: './closeout-package.component.html',
  styleUrls: ['./closeout-package.component.css']
})
export class CloseoutPackageComponent implements OnInit {
  columns;
  isFilterOpened = false;
  status = [
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Not Submitted', value: 'NOT_SUBMITTED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Requested', value: 'REQUESTED' },
  ];
  _selectedColumns: any[];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords = 0;
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
  subcontractors = [];
  showButtons: boolean = true;
  masterAccess: any;
  btnDisabled: boolean = false;
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
    private filterlLeftPanelService: FilterLeftPanelDataService) {
    this.captionChangeService.hideHeaderSubject.next(true);

  }

  ngOnInit(): void {
    this.masterAccess = this.localStorageService.getItem("userAccess");

    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.addHideAllLabelSubject.next(false);
    this.initializeForm();
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(e => {

      let project = this.localStorageService.getSelectedProjectObject();
      if (project) {
        if (project.id !== 'pid') {
          this.isSelectedProject = true;
          this.selectedProject = project;
          this.projectTitle = project.title;
          this.setDefaultCriteria();
          this.setColumnOfTable();

        }
        else {
          this.isSelectedProject = false;
          this.selectedProject = null;
          this.projectTitle = null;
          this.setDefaultCriteria();
          this.setColumnOfTable();

        }
      }
      else {
        this.isSelectedProject = false;
        this.selectedProject = null;
        this.projectTitle = null;
        this.setDefaultCriteria();
        this.setColumnOfTable();

      }
      this.initializeForm();
    }));
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(jobsite1 => {
      this.isSelectedJobsite = false;
      let jobsite = this.localStorageService.getSelectedJobsiteObject();
      if (jobsite) {
        if (jobsite.id !== 'jid') {
          this.isSelectedJobsite = true;
          this.selectedJobsite = jobsite;
          this.jobsiteTitle = jobsite.title;
          this.setDefaultCriteria();
          this.setColumnOfTable();

        } else {
          this.isSelectedJobsite = false;
          this.selectedJobsite = null;
          this.jobsiteTitle = null;
          this.setDefaultCriteria();
          this.setColumnOfTable();
        }
      }
      else {
        this.isSelectedJobsite = false;
        this.selectedJobsite = null;
        this.jobsiteTitle = null;
        this.setDefaultCriteria();
        this.setColumnOfTable();
      }

      this.initializeForm();
    }));

    this.setColumnOfTable();
    this._selectedColumns = this.columns.filter(a => a.selected == true);
    if (this.masterAccess) {
      this.menuAccess();
    }

  }
  onFilterOpen(): void {
    this.initializeForm();
    this.isFilterOpened = !this.isFilterOpened;
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.projectJobSelectionService.addHideAllLabelSubject.next(true);
  }
  setColumnOfTable(): void {
    if (this.isSelectedProject && !this.isSelectedJobsite) {
      this.columns = [
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: true },
        { label: 'Subcontractor', value: 'SUBCONTACTOR_NAME', sortable: true, isHidden: false, field: 'subcontractor', selected: true },
        { label: 'Jobsite Title', value: 'JOBSITE_TITLE', sortable: true, isHidden: false, field: 'jobsiteTitle', selected: true },
        { label: 'Requested On', value: 'REQUESTED_DATE', sortable: true, isHidden: false, field: 'requestedOn', selected: false },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: false },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: true },
      ];
    }
    else if (this.isSelectedJobsite && this.isSelectedProject) {
      this.columns = [
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: true },
        { label: 'Subcontractor', value: 'SUBCONTACTOR_NAME', sortable: true, isHidden: false, field: 'subcontractor', selected: true },
        { label: 'Requested On', value: 'REQUESTED_DATE', sortable: true, isHidden: false, field: 'requestedOn', selected: false },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: false },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: true },
      ];
    }
    else if (this.isSelectedJobsite) {
      this.columns = [
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: true },
        { label: 'Subcontractor', value: 'SUBCONTACTOR_NAME', sortable: true, isHidden: false, field: 'subcontractor', selected: true },
        { label: 'Project Title', value: 'PROJECT_TITLE', sortable: true, isHidden: false, field: 'projectTitle', selected: true },
        { label: 'Requested On', value: 'REQUESTED_DATE', sortable: true, isHidden: false, field: 'requestedOn', selected: false },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: false },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: true },
      ];
    }
    else {
      this.columns = [
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: false },
        { label: 'Subcontractor', value: 'SUBCONTACTOR_NAME', sortable: true, isHidden: false, field: 'subcontractor', selected: true },
        { label: 'Project Title', value: 'PROJECT_TITLE', sortable: true, isHidden: false, field: 'projectTitle', selected: true },
        { label: 'Jobsite Title', value: 'JOBSITE_TITLE', sortable: true, isHidden: false, field: 'jobsiteTitle', selected: true },
        { label: 'Requested On', value: 'REQUESTED_DATE', sortable: true, isHidden: false, field: 'requestedOn', selected: false },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: false },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: true },
      ];
    }
  }
  initializeForm() {
    this.myForm = this.formBuilder.group({
      assignedTo: [],
      status: []
    });
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
    this.dateErrorFlage = false;
    this.filterFlag = true;
    const filterMap = new Map();

    if (((this.myForm.value.createdFrom && !this.myForm.value.createdTo) ||
      (!this.myForm.value.createdFrom && this.myForm.value.createdTo))) {
      this.dateErrorFlage = true;
    }

    if (!this.myForm.value.createdFrom && !this.myForm.value.createdTo) {
      this.dateErrorFlage = false;
    }
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
    if (this.myForm.value.status) {
      filterMap.set('STATUS', this.myForm.value.status.value);
    }
    if (this.myForm.value.assignedTo) {
      filterMap.set('SUBCONTRACTOR_ID', this.myForm.value.assignedTo.id);
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
        sortField: this.sortField,
        sortOrder: this.sortOrder,
        searchText: this.globalFilter
      };
      this.getCloseOutList();
    }
    else {
      this.notificationService.error('Please select appropriate date range', '');
    }
  }
  onFilterClear(): void {
    this.myForm.reset();
    this.filter();
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
      if (data.data?.result) {
        this.closeoutList = data.data.result;
        this.totalRecords = data.data.totalRecords;
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
  getSubcontractorByName(name): void {
    this.subcontractorNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.subcontractorNameParams);
    this.filterlLeftPanelService.getSubcontractorByNameForAdminCloseout(this.queryParam).subscribe(data => {
      this.subcontractors = data.data;
      this.subcontractors = this.subcontractors.sort();
    });
  }
  menuAccess(): void {
    let accessPermission = this.masterAccess.filter(e => e.menuName == 'Masters');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
  getFullName(data) {
    return data.first + ' ' + data.last;
  }
  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.offset = event.first / event.rows;
    this.sortField = event.sortField ? event.sortField.toUpperCase() : this.sortField;
    const filterMap = new Map();
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
