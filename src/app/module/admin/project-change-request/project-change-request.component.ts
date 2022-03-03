import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { ChangeRequestService } from 'src/app/service/client-services/change-request/change-request.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { JobsiteDetail } from '../../client/Vos/jobsitemodel';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-project-change-request',
  templateUrl: './project-change-request.component.html',
  styleUrls: ['./project-change-request.component.css']
})
export class ProjectChangeRequestComponent implements OnInit {
  subscription = new Subscription();


  offset = 0;
  totalRecords = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  submitted = false;
  projectTypes: ProjectDetail[] = [];
  jobsiteTypes: JobsiteDetail[] = [];
  selectedProject: ProjectDetail = null;
  selectedJobsite: JobsiteDetail = null;
  isSelectedProject = false;
  isSelectedJobsite = false;

  loading = false;
  dialogHeader: string;
  dialogHeaderOfAttachment: string;
  isFilterOpened = false;
  datatableParam: DataTableParam;
  filterMap = new Map();
  sortField = 'CREATED_DATE';
  queryParam;
  sortOrder = 0;
  globalFilter;
  ChangeRequestList = [];

  dateErrorFlag: boolean;
  // filter field
  startDate;
  validateEndtartDate;
  endDate: Date;
  tempDate;
  ChangeReequestTitleList = [];
  FilterFormGroup: FormGroup;
  emptyArray = [];

  loginUser: any;
  assignedToObject;
  dateFlag = false;
  titleParmas: { userId: string; name: any; };
  keyword: any;
  title = [];
  subcontractors = [];
  listTemp = [];
  subcontractorNameParams: { name: any; };
  submittedReason = false;

  columns = [];

  fatchedAttachmentList = [];

  status = [
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
    { label: 'Pending', value: 'PENDING' },
  ];

  documentDialog: boolean;
  filteredStatus: any[];
  loggedInUserId: string;

  AttachmentDialog = false;
  changeRequestId: any;

  constructor(
    private translator: TranslateService,
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private changeRequestService: ChangeRequestService,
    private filterlLeftPanelService: FilterLeftPanelDataService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private dateHelperService: DateHelperService,
  ) {
    this.dialogHeader = 'Attachments';
    this.dialogHeaderOfAttachment = 'Attachments';
    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.addHideAllLabelSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.addHideAllLabelSubject.next(true);
    this.initializeForm();
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.loginUser = this.localStorageService.getLoginUserObject();
    this.dialogHeader = this.translator.instant('add.change.request');
    this.setProject();
    this.setJobsite();
    this.setColumnOfTable();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.projectJobSelectionService.addHideAllLabelSubject.next(false);
  }

  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 1 : 0;
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadChangeRequestList();
  }

  public redirectToSubcontractor(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_SUBCONTRACTOR_PROFILE + '?user=' + id);
  }

  public redirectToClient(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_CLIENT_PROFILE + '?user=' + id);
  }

  loadChangeRequestList(): void {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.changeRequestService.getChangeRequestList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            this.ChangeRequestList = data.data.result;
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
          }
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
      }
    );
  }

  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
    this.initializeForm();
  }

  public initializeForm(): void {
    this.FilterFormGroup = this.formBuilder.group({
      subcontractor: [''],
      status: [''],
      dateRange: [''],
      startDate: [''],
      endDate: [''],
    });
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

  filter() {
    this.dateErrorFlag = false;
    this.filterMap.clear();
    this.listTemp.length = 0;
    const datePipe = new DatePipe('en-US');

    if (this.selectedProject) {
      this.filterMap.set('PROJECT_ID', this.selectedProject.id);
    }
    if (this.selectedJobsite) {
      this.filterMap.set('JOBSITE_ID', this.selectedJobsite.id);
    }

    if (((this.FilterFormGroup.value.startDate && !this.FilterFormGroup.value.endDate) ||
      (!this.FilterFormGroup.value.startDate && this.FilterFormGroup.value.endDate))) {
      this.dateErrorFlag = true;
    }

    if (!this.FilterFormGroup.value.startDate && !this.FilterFormGroup.value.endDate) {
      this.dateErrorFlag = false;
    }

    if (this.FilterFormGroup.value.startDate > this.FilterFormGroup.value.endDate) {
      this.dateErrorFlag = true;
    }

    if (this.FilterFormGroup.value.subcontractor) {
      this.FilterFormGroup.value.subcontractor.forEach(element => {
        this.listTemp.push(element.id);
      });
      this.filterMap.set('SUBCONTRACTOR_ID', this.listTemp.toString());
    }

    if (this.FilterFormGroup.value.status) {
      let listOfStatus = [];
      this.FilterFormGroup.value.status.forEach(element => {
        listOfStatus.push(element.value);
      });
      this.filterMap.set('STATUS', listOfStatus.toString());
    }

    if (this.FilterFormGroup.value.startDate) {
      this.dateHelperService.setStartDate(this.FilterFormGroup.value.startDate);
      const value = datePipe.transform(this.FilterFormGroup.value.startDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('START_DATE', value);
    }
    if (this.FilterFormGroup.value.endDate) {
      this.dateHelperService.setEndDate(this.FilterFormGroup.value.endDate);
      const valueEnd = datePipe.transform(this.FilterFormGroup.value.endDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('END_DATE', valueEnd);
    }

    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
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
    if (!this.dateErrorFlag) {
      this.loadChangeRequestList();
    }
    else {
      this.notificationService.error('Enter appropriate Date Range', '');
    }
  }

  clear(): void {
    this.FilterFormGroup.reset();
    this.filterChangeRequestLoadAll();
  }

  private setProject(): void {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      const project = this.localStorageService.getSelectedProjectObject();
      if (project) {
        if (project.id === 'pid') {
          this.selectedProject = null;
          this.selectedJobsite = null;
          this.isSelectedProject = false;
          this.isSelectedJobsite = false;
          this.filterChangeRequestLoadAll();
        }
        else {
          this.selectedJobsite = null;
          this.isSelectedJobsite = false;
          this.jobsiteTypes = this.localStorageService.getAllJobsite();
          for (let i = 0; i < this.jobsiteTypes?.length; i++) {
            if (this.jobsiteTypes[i].id === 'jid') {
              this.jobsiteTypes.splice(i, 1);
            }
          }
          this.projectTypes.splice(0, this.projectTypes.length);
          this.projectTypes.push(project);
          this.selectedProject = project;
          if (this.selectedProject !== null) {
            this.isSelectedProject = true;
            this.filterChangeRequestLoadAll();
          }
        }
      }
      else {
        this.selectedProject = null;
        this.selectedJobsite = null;
        this.isSelectedProject = false;
        this.isSelectedJobsite = false;
        this.filterChangeRequestLoadAll();
      }
      this.setColumnOfTable();
    }));
  }

  private setColumnOfTable(): void {
    this.columns = [
      { label: this.translator.instant('client'), value: 'CLIENT_NAME', sortable: true, isHidden: false },
      { label: this.translator.instant('subcontractor'), value: 'SUBCONTRACTOR_NAME', sortable: true, isHidden: false },
      // tslint:disable-next-line: max-line-length
      { label: this.translator.instant('project.title'), value: 'PROJECT_TITLE', sortable: true, isHidden: this.isSelectedProject ? true : false },
      // tslint:disable-next-line: max-line-length
      { label: this.translator.instant('jobsite.title'), value: 'JOBSITE_TITLE', sortable: true, isHidden: this.isSelectedJobsite ? true : false },
      { label: this.translator.instant('change.request.title'), value: 'title', sortable: true, isHidden: false },
      { label: this.translator.instant('change.request.description'), value: 'description', sortable: true, isHidden: false },
      { label: this.translator.instant('created.date'), value: 'CREATED_DATE', sortable: true, isHidden: false },
      { label: this.translator.instant('created.by'), value: 'CREATED_BY_NAME', sortable: true, isHidden: false },
      { label: this.translator.instant('cost'), value: 'COST', sortable: true, isHidden: false },
      { label: this.translator.instant('document'), value: 'documents', sortable: false, isHidden: false },
      { label: this.translator.instant('status'), value: 'status', sortable: false, isHidden: false },
    ];
  }


  private setJobsite(): void {
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(data => {
      const jobsite = this.localStorageService.getSelectedJobsiteObject();
      if (jobsite) {
        if (jobsite.id === 'jid') {
          this.selectedJobsite = null;
          this.isSelectedJobsite = false;
          this.filterChangeRequestLoadAll();
        }
        else {
          this.selectedJobsite = jobsite;
          this.isSelectedJobsite = true;
          if (this.selectedJobsite !== null) {
            this.isSelectedJobsite = true;
            this.filterChangeRequestLoadAll();
          }
        }
      } else {
        this.selectedJobsite = null;
        this.isSelectedJobsite = false;
        this.filterChangeRequestLoadAll();
      }
      this.setColumnOfTable();
    }));
  }

  filterChangeRequestLoadAll(): void {
    this.filterMap.clear();

    if (this.selectedProject) {
      this.filterMap.set('PROJECT_ID', this.selectedProject.id);
    }
    if (this.selectedJobsite) {
      this.filterMap.set('JOBSITE_ID', this.selectedJobsite.id);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
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
    this.loadChangeRequestList();
  }

  getAttachments(id): void {
    this.changeRequestId = id;
    const datatableParam = {
      offset: this.offset,
      size: 7,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: `{"CHANGE_REQUEST_ID":"${id}"}`
    };
    const queryParam = this.prepareQueryParam(datatableParam);
    this.changeRequestService.getChangeRequestAttachmentList(queryParam).subscribe(data => {
      this.fatchedAttachmentList = data.data.result;
      this.AttachmentDialog = true;
      this.dialogHeaderOfAttachment = 'Attachments';
    });
  }

  downloadAttachments(): void {
    if (this.changeRequestId) {
      this.changeRequestService.downloadChangRequestAttachments(this.changeRequestId).subscribe(
        data => {
          const blob = new Blob([data], { type: 'application/zip' });
          const fileName = 'ChangRequest-attachments.zip';
          saveAs(blob, fileName);
        },
        (error) => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          console.log(error);
        });
    } else {
      this.notificationService.error(this.translator.instant('common.error'), '');
    }
  }

  hideDialog(): void {
    this.AttachmentDialog = false;
    this.changeRequestId = null;
  }

  prepareQueryParam(paramObject): URLSearchParams {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }

}
