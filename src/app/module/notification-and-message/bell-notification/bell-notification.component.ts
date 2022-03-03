import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Paginator } from 'primeng/paginator';
import { interval, Subscription } from 'rxjs';
import { BellNotificationService } from 'src/app/service/bell-notification.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { BellNotification } from 'src/app/shared/vo/bellNotification';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { WorkerSidebarJobListService } from 'src/app/shared/worker-sidebar-job-list.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bell-notification',
  templateUrl: './bell-notification.component.html',
  styleUrls: ['./bell-notification.component.css']
})
export class BellNotificationComponent implements OnInit, OnDestroy {

  @ViewChild('ppaginator', { static: true }) ppaginator: Paginator;

  notificationTypes: any[];

  selectedType: any;

  selectedPostType: any;

  filterMap = new Map();

  globalFilter;

  loggedInUserId;

  user: User;

  rolename;

  datatableParam: DataTableParam;

  selectedProject;

  selectedJob;

  offset = 0;
  sortOrder;
  sortField: 'CREATED_DATE';
  subscription = new Subscription();
  totalRecords = 0;
  source = interval(environment.bellNotificationInterval);
  queryParam;
  data: BellNotification[];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  workerSelectedJob: any;

  constructor(
    private localStorageService: LocalStorageService,
    private bellNotificationService: BellNotificationService,
    private notificationService: UINotificationService,
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private workerSidebarService: WorkerSidebarJobListService) {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.user = this.localStorageService.getLoginUserObject();
    this.loggedInUserId = this.user.id;

  }

  public setSelectedType(): void {
    if (this.localStorageService.getItem('notificationType')) {
      this.selectedType = this.localStorageService.getItem('notificationType');
    } else {
      this.selectedType = 'All';
    }
  }

  public setSelectedPostType(): void {
    if (this.localStorageService.getItem('Post_Type')) {
      this.selectedPostType = this.localStorageService.getItem('Post_Type');
    } else {
      this.selectedPostType = 'PROJECT';
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.localStorageService.removeItem('workerSelectedJob');
  }

  ngOnInit(): void {

    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(e => {
      this.setSelectedType();
      this.setSelectedPostType();
      if (e) {
        this.selectedProject = e;
        this.selectedJob = null;
        this.getFiltersAndLoadData(this.selectedType);
        this.loadData(this.selectedPostType);
      } else {
        this.selectedProject = this.localStorageService.getSelectedProjectObject();
        this.selectedJob = null;
        this.getFiltersAndLoadData(this.selectedType);
        this.loadData(this.selectedPostType);
      }
    }));

    this.subscription.add(this.projectJobSelectionService.jobSwitchSubject.subscribe(e => {
      this.setSelectedType();
      this.setSelectedPostType();
      this.selectedJob = this.localStorageService.getSelectedJob();
      this.selectedProject = null;
      this.getFiltersAndLoadData(this.selectedType);
      this.loadData(this.selectedPostType);
    }));

    this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(e => {
      this.setSelectedType();
      this.setSelectedPostType();
      if (e) {
        this.selectedJob = e;
        this.selectedProject = null;
        this.getFiltersAndLoadData(this.selectedType);
        this.loadData(this.selectedPostType);
      } else {
        this.selectedJob = this.localStorageService.getSelectedJob();
        this.selectedProject = null;
        this.getFiltersAndLoadData(this.selectedType);
        this.loadData(this.selectedPostType);
      }
    }));

    this.subscription.add(this.workerSidebarService.workerSidebarJobChanged.subscribe(data => {
      this.setSelectedType();
      if (this.localStorageService.getItem('workerSelectedJob')) {
        this.workerSelectedJob = this.localStorageService.getItem('workerSelectedJob');
        this.selectedProject = null;
        this.getFiltersAndLoadData(this.selectedType);
        this.loadData();
      }
      else if (data) {

        this.workerSelectedJob = data;
        this.selectedProject = null;

        this.getFiltersAndLoadData(this.selectedType);
        this.loadData();
      }
    }));

    this.captionChangeService.hideHeaderSubject.next(true);
    this.rolename = this.user.roles[0].roleName;
    switch (this.user.roles[0].roleName) {
      case 'CLIENT':
        this.notificationTypes = [
          { label: 'All', value: 'All' },
          { label: 'Change Request', value: 'Change Request' },
          { label: 'Question And Answer', value: 'Question And Answer' },
          { label: 'Job', value: 'Job' },
          { label: 'Project', value: 'Project' },
          { label: 'Invoice', value: 'Invoice' },
          { label: 'Close Out Package Request', value: 'CloseOutPackageRequest' },
          { label: 'Approve Client', value: 'ApproveClient' },
          { label: 'MSA Client', value: 'MSAClient' },
        ];
        break;
      case 'SUBCONTRACTOR':
        this.notificationTypes = [
          { label: 'All', value: 'All' },
          { label: 'Change Request', value: 'Change Request' },
          { label: 'Question And Answer', value: 'Question And Answer' },
          { label: 'Project', value: 'Project' },
          { label: 'Invoice', value: 'Invoice' },
          { label: 'Close Out Package Request', value: 'CloseOutPackageRequest' },
          { label: 'Certificate', value: 'Certificate' },
        ];
        break;
      case 'WORKER':
        this.notificationTypes = [
          { label: 'All', value: 'All' },
          { label: 'Change Request', value: 'Change Request' },
          { label: 'Question And Answer', value: 'Question And Answer' },
          { label: 'Job', value: 'Job' },
          { label: 'Invoice', value: 'Invoice' },
        ];
        break;
    }
    const notificationType = this.localStorageService.getItem('notificationType');
    if (notificationType) {
      this.selectedType = notificationType;
    } else {
      this.selectedType = this.notificationTypes[3];
    }

    this.localStorageService.setItem('bellNotificationDataTableParam', null);

    this.getFiltersAndLoadData(this.selectedType);
    this.loadData();
    this.subscription.add(this.source.subscribe(val => this.getFiltersAndLoadData(localStorage.getItem('notificationType'))));
  }

  public notificationTypeChanged(event): void {
    this.offset = 0;
    this.getFiltersAndLoadData(event.value);
    this.loadData();
    this.ppaginator.changePage(0);
  }

  public markAsRead(): void {
    this.bellNotificationService.markNotificationAsSeenByUserId(this.loggedInUserId).subscribe(e => {
      if (e.statusCode === '200' && e.message === 'OK') {
        this.loadData();
      } else {
        this.notificationService.error(e.message, '');
      }
    },
      error => {
      });
  }

  loadData(selectedPostType?): void {

    // tslint:disable-next-line: no-conditional-assignment
    if (this.selectedPostType = this.localStorageService.getItem('Post_Type') === 'PROJECT') {
      if (this.selectedProject) {
        if (this.selectedProject.id !== 'pid') {
          this.filterMap.set('PROJECT_ID', this.selectedProject.id);
        }
      }
    }

    // tslint:disable-next-line: no-conditional-assignment
    if (this.selectedPostType = this.localStorageService.getItem('Post_Type') === 'JOB') {
      if (this.selectedJob) {
        if (this.selectedJob.id !== 'jobId') {
          this.filterMap.set('JOB_ID', this.selectedJob.id);
        }
      }
    }

    if (this.workerSelectedJob) {
      if (this.workerSelectedJob.id !== 'jobId') {
        this.filterMap.set('JOB_ID', this.workerSelectedJob.id);
      }
    }

    const jsonObject = {};
    // tslint:disable-next-line: no-shadowed-variable
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.globalFilter
    };

    this.datatableParam.searchText = this.globalFilter;
    this.datatableParam.offset = this.offset;

    this.localStorageService.setItem('datatableParam', this.datatableParam);
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.bellNotificationService.getBellNotification(this.queryParam).subscribe(notification => {
      if (notification.statusCode === '200' && notification.message === 'OK') {
        this.data = notification.data.result;
        this.totalRecords = notification.data.totalRecords;

        this.bellNotificationService.msgNumber.next(this.data.length);
      } else {
        this.notificationService.error(notification.message, '');
      }
    });
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  public getFiltersAndLoadData(value: string): void {

    this.filterMap.clear();
    this.localStorageService.setItem('notificationType', value);
    switch (value) {
      case 'Change Request':
        this.filterMap.set('TYPE', 'CHANGE_REQUEST');
        break;
      case 'Question And Answer':
        this.filterMap.set('TYPE', 'QUESTION_AND_ANSWER');
        break;
      case 'Job':
        this.filterMap.set('TYPE', 'JOB');
        break;
      case 'Project':
        this.filterMap.set('TYPE', 'PROJECT');
        break;
      case 'Invoice':
        this.filterMap.set('TYPE', 'INVOICE');
        break;
      case 'CloseOutPackageRequest':
        this.filterMap.set('TYPE', 'CLOSE_OUT_PACKAGE_REQUEST');
        break;
      case 'ApproveClient':
        this.filterMap.set('TYPE', 'APPROVAL');
        break;
      case 'MSAClient':
        this.filterMap.set('TYPE', 'CLIENT_MSA');
        break;
      case 'Certificate':
        this.filterMap.set('TYPE', 'CERTIFICATE');
        break;
      case 'All':
        switch (this.user.roles[0].roleName) {
          case 'CLIENT':
            // tslint:disable-next-line: max-line-length
            this.filterMap.set('TYPE_IN', ['CHANGE_REQUEST', 'QUESTION_AND_ANSWER', 'JOB', 'PROJECT', 'CLOSE_OUT_PACKAGE_REQUEST', 'INVOICE', 'APPROVAL', 'CLIENT_MSA'].toString);
            break;
          case 'SUBCONTRACTOR':
            // tslint:disable-next-line: max-line-length
            this.filterMap.set('TYPE_IN', ['CHANGE_REQUEST', 'QUESTION_AND_ANSWER', 'PROJECT', 'CLOSE_OUT_PACKAGE_REQUEST', 'INVOICE', 'CERTIFICATE'].toString);
            break;
          case 'WORKER':
            this.filterMap.set('TYPE_IN', ['CHANGE_REQUEST', 'CHANGE_REQUEST', 'JOB', 'INVOICE'].toString);
            break;
        }
        break;
      default: {
        break;
      }
    }

    this.filterMap.set('POSTED_TO_ID', this.loggedInUserId);
  }

  public paginate(event: any): void {
    this.getFiltersAndLoadData(this.selectedType);

    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: this.size = event.rows ? event.rows : this.size,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.globalFilter
    };

    this.localStorageService.setItem('bellNotificationDataTableParam', this.datatableParam);

    this.queryParam = this.prepareQueryParam(this.datatableParam);

    this.bellNotificationService.getBellNotification(this.queryParam).subscribe(notification => {
      if (notification.statusCode === '200' && notification.message === 'OK') {

        this.data = notification.data.result;

        this.totalRecords = notification.data.totalRecords;

        this.bellNotificationService.msgNumber.next(this.data.length);

      } else {
        this.notificationService.error(notification.message, '');
      }
    });
  }
}
