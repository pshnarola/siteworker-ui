import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UserService } from 'src/app/service/User.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';

@Component({
  selector: 'app-client-jobsite-details',
  templateUrl: './client-jobsite-details.component.html',
  styleUrls: ['./client-jobsite-details.component.css']
})
export class ClientJobsiteDetailsComponent implements OnInit, OnDestroy {
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;
  jobSiteDetailForm: FormGroup;
  lineItem;
  showMore = false;
  filterMap = new Map();
  queryParam;
  queryParamToassign;
  supervisorList;
  supervisor;
  dataTableParam: DataTableParam;
  filteredStatus: any[];
  filteredSupervisor: any[];
  subscription = new Subscription();
  _selectedColumns: any[];

  columns = [
    { label: this.translator.instant('work.type'), value: 'workType', selected: true },
    { label: this.translator.instant('line.item.id'), value: 'lineItemId', selected: true },
    { label: this.translator.instant('line.item.name'), value: 'lineItemName', selected: true },
    { label: this.translator.instant('cost'), value: 'cost', selected: true },
    { label: this.translator.instant('description'), value: 'description', selected: true },
    { label: this.translator.instant('inclusion'), value: 'inclusions', selected: false },
    { label: this.translator.instant('exclusion'), value: 'exclusions', selected: false },
    { label: this.translator.instant('unit'), value: 'unit.name', selected: false },
    { label: this.translator.instant('quantity'), value: 'quantity', selected: false },
    { label: this.translator.instant('dynamic.label1'), value: 'dynamicLabel1', selected: false },
    { label: this.translator.instant('dynamic.label2'), value: 'dynamicLabel2', selected: false },
    { label: this.translator.instant('dynamic.label3'), value: 'dynamicLabel3', selected: false },
  ];

  columnsForDialog = [
    { label: this.translator.instant('work.type'), value: 'workType', selected: true },
    { label: this.translator.instant('line.item.id'), value: 'lineItemId', selected: true },
    { label: this.translator.instant('line.item.name'), value: 'lineItemName', selected: true },
    { label: this.translator.instant('cost'), value: 'cost', selected: true },
    { label: this.translator.instant('description'), value: 'description', selected: true },
    { label: this.translator.instant('inclusion'), value: 'inclusions', selected: false },
    { label: this.translator.instant('exclusion'), value: 'exclusions', selected: false },
    { label: this.translator.instant('unit'), value: 'unit.name', selected: false },
    { label: this.translator.instant('quantity'), value: 'quantity', selected: false },
    { label: this.translator.instant('dynamic.label1'), value: 'dynamicLabel1', selected: false },
    { label: this.translator.instant('dynamic.label2'), value: 'dynamicLabel2', selected: false },
    { label: this.translator.instant('dynamic.label3'), value: 'dynamicLabel3', selected: false },
  ];

  paymentColumns = [
    { label: this.translator.instant('milestone.name'), value: 'name' },
    { label: this.translator.instant('line.item.and.closeout.package'), value: 'lineItem' },
    { label: this.translator.instant('amount.release'), value: 'cost' },
    { label: this.translator.instant('percentage'), value: 'percentage' },
  ];

  statusList = [
    { label: 'Canceled', value: 'CANCELLED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
  ];

  globalFilter: string;
  offset: Number = 0;
  totalRecords: any;
  isSelectedJobSite: boolean = false;
  JobSiteDetail: any;

  selectedJobsiteId: any;
  isOpenLineItemdialog = false;
  sortOrder: number;
  sortField: any;
  loggedInUserId: any;
  disableStatusFlag1: boolean;
  disableStatusFlag: boolean;
  statusFlag: boolean;
  supervisorParam: { jobSiteDetailId: any; supervisorId: any; };
  status: any;
  changeStatusParam: any;
  jobsiteStatus: any;
  roleName;
  projectDetail: any;
  _selectedColumnsForDialog: any[];

  constructor(
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private userService: UserService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private _projectDetailService: ProjectDetailService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private confirmDialogService: ConfirmDialogueService,
    private router: Router
  ) {
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.dataTableParam = {
      offset: 0,
      size: 2,
      sortField: 'FIRST_NAME',
      sortOrder: 1,
      searchText: '{"ROLE_NAME": "SUPERVISOR"}'
    };
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.getSupervisorList();
    this.initializeForm();
    this.getSelectedJobSiteDetails();
    this.checkRoleOfUser();
    this._selectedColumns = this.columns.filter(x => x.selected == true);
    this._selectedColumnsForDialog = this.columns.filter(x => x.selected == true);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }


  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }

  @Input() get selectedColumnsForDialog(): any[] {
    return this._selectedColumnsForDialog;
  }

  set selectedColumnsForDialog(val: any[]) {
    this._selectedColumnsForDialog = this.columns.filter(col => val.includes(col));
  }


  checkRoleOfUser() {
    let loggedInUser = this.localStorageService.getLoginUserObject();
    this.roleName = loggedInUser.roles[0].roleName;
  }

  getSelectedJobSiteDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(
      data => {
        this.showMore = false;
        const jobSite = this.localStorageService.getSelectedJobsiteObject();
        const project = this.localStorageService.getSelectedProjectObject();
        if (jobSite) {
          if (jobSite.id === 'jid') {
            this.isSelectedJobSite = false;
            this.JobSiteDetail = null;
            this.projectDetail = null;
          }
          else {
            this.JobSiteDetail = jobSite;
            this.projectDetail = project;
            this.jobsiteStatus = jobSite.status;
            this.supervisor = this.JobSiteDetail.supervisor;
            if (this.JobSiteDetail !== null) {
              this.isSelectedJobSite = true;
              if (this.JobSiteDetail.status === 'COMPLETED' || this.JobSiteDetail.status === 'CANCELLED' || this.JobSiteDetail.status === 'DRAFT' || this.JobSiteDetail.status === 'AWARDED') {
                this.disableStatusFlag1 = true;
              } else {
                this.disableStatusFlag1 = false;
                this.disableStatusFlag = false;
              }
              if (this.JobSiteDetail.status === 'IN_PROGRESS') {
                this.statusList = [
                  { label: 'Canceled', value: 'CANCELLED' },
                  { label: 'Completed', value: 'COMPLETED' }
                ];
              }
              else {
                this.statusList = [
                  { label: 'Canceled', value: 'CANCELLED' },
                  { label: 'Completed', value: 'COMPLETED' },
                  { label: 'In Progress', value: 'IN_PROGRESS' },
                ];
              }
            }
          }
        } else {
          this.isSelectedJobSite = false;
          this.JobSiteDetail = null;
          this.projectDetail = null;
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }));
  }

  openLineItemDialog(entity) {
    this.lineItem = entity.lineItem;
    this.isOpenLineItemdialog = true;
  }

  onHideLineItem(event) {
    this.lineItem = null;
    this.isOpenLineItemdialog = false;
  }

  cancelLineItemListingDialog(event) {
    this.lineItem = null;
    this.isOpenLineItemdialog = false;
  }


  initializeForm(): void {
    this.jobSiteDetailForm = this.formBuilder.group({
      id: [],
      status: []
    });
  }

  filterStatus(event): void {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.statusList.length; i++) {
      const statusData = this.statusList[i];
      if (statusData.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(statusData);
      }
    }
    this.filteredStatus = filtered;
    this.filteredStatus = this.filteredStatus.sort();
  }

  filterSupervisor(event): void {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.supervisorList.length; i++) {
      const supervisor = this.supervisorList[i];
      if (supervisor.firstName.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(supervisor);
      }
    }
    this.filteredSupervisor = filtered;
    this.filteredSupervisor = this.filteredSupervisor.sort();
  }
  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getSupervisorList(): void {
    this.userService.getSupervisorByClientAndIsActive(this.loggedInUserId).subscribe(
      data => {
        this.supervisorList = data.data;
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }


  openDialog(event): void {
    let options = null;
    let message;
    message = this.translator.instant('are.you.sure.you.want.to.change.the.status');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.setStatus(event);
      }
      else {
        let currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }

  openSupervisorDialog(jobSiteId, event): void {
    let options = null;
    let message;
    message = this.translator.instant('are.you.sure.you.want.to.assign.the.supervisor.jobsite');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.assignSupervisor(jobSiteId, event);
      }
      else {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });

  }

  assignSupervisor(jobSiteId, event): void {
    this.statusFlag = false;
    this.supervisorParam = {
      jobSiteDetailId: jobSiteId,
      supervisorId: event.id
    }
    this.queryParamToassign = this.prepareQueryParam(this.supervisorParam);
    this._projectDetailService.assignSupervisorToJobsite(this.queryParamToassign).subscribe(
      data => {
        if (data.message === 'OK' && data.statusCode === '200') {
          this.notificationService.success(this.translator.instant('jobsite.assigned.to.supervisor'), '');
          this.projectJobSelectionService.addJobsiteSubject.next(data.data);
          this.projectJobSelectionService.addProjectSubject.next(data.data.project);
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  setStatus(status): void {
    this.statusFlag = true;
    this.status = status.value;
    if (this.status === 'IN_PROGRESS') {
      this.statusList = [
        { label: 'Canceled', value: 'CANCELLED' },
        { label: 'Completed', value: 'COMPLETED' }
      ];
    }
    if (this.status === 'CANCELLED' || this.status === 'COMPLETED') {
      this.disableStatusFlag = true;
    }
    else {
      this.disableStatusFlag = false;
    }
    this.changeStatusParam = {
      id: this.JobSiteDetail.id,
      status: this.status
    };
    this.queryParam = this.prepareQueryParam(this.changeStatusParam);
    this._projectDetailService.setStatusOfJobsite(this.queryParam).subscribe(
      data => {
        if (data.message === 'OK' && data.statusCode === '200') {
          this.localStorageService.setItem('selectedJobsite', data.data);
          this.localStorageService.setItem('selectedProject', data.data.project);
          this.projectJobSelectionService.updateJobsiteStatusSubject.next(data.data);
          this.projectJobSelectionService.addProjectSubject.next(data.data.project);
          this.notificationService.success(this.translator.instant('jobsite.status.updated'), '');
        }
        else {
          this.notificationService.error(data.message, '');
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }

}
