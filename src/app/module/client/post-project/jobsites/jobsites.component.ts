import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { JobsiteService } from 'src/app/service/client-services/post-project/jobsite.service';
import { LineItemService } from 'src/app/service/client-services/post-project/line-item.service';
import { PostProjectService } from 'src/app/service/client-services/post-project/post-project.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobsiteDetail } from '../../Vos/jobsitemodel';
import { ProjectDetail } from '../../Vos/projectDetailmodel';

@Component({
  selector: 'app-jobsites',
  templateUrl: './jobsites.component.html',
  styleUrls: ['./jobsites.component.css']
})
export class JobsitesComponent implements OnInit, OnDestroy {

  loading = false;
  offset: Number = 0;
  totalRecords: Number = 0;
  data: JobsiteDetail[] = [];
  datatableParam: DataTableParam;
  filterMap = new Map();
  sortField;
  queryParam;
  sortOrder;
  globalFilter;
  currentScreen: string;
  jobsiteScreen: string;
  selectedProject: ProjectDetail = null;
  selectedJobsite: JobsiteDetail = null;
  editableLineItem: any = null;
  isOpenEditdialog = false;
  selectedJobsiteId: any;
  isOpenLineItemdialog = false;
  @Input() reviewJobsite;
  @Input() page;
  totalCost: number = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;


  @ViewChild('dt') table: Table;
  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'TITLE', sortable: true, selected: true },
    { label: this.translator.instant('description'), value: 'description', sortable: true, selected: false },
    { label: this.translator.instant('cost'), value: 'COST', sortable: true, selected: true },
    { label: this.translator.instant('location'), value: 'location', sortable: true, selected: true },
    { label: this.translator.instant('city'), value: 'CITY', sortable: true, selected: false },
    { label: this.translator.instant('state'), value: 'STATE', sortable: true, selected: false },
    { label: this.translator.instant('zipcode'), value: 'zipcode', sortable: true, selected: false },
    { label: this.translator.instant('line.item'), value: 'lineItem', sortable: false, selected: true }

  ];

  subscription: Subscription;
  subscription1: Subscription;

  _selectedColumns: any[];

  constructor(private translator: TranslateService,
    private postProjectService: PostProjectService,
    private localStorageService: LocalStorageService,
    private jobsiteService: JobsiteService,
    private lineItemService: LineItemService,
    private notificationService: UINotificationService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private confirmDialogService: ConfirmDialogueService) {

  }

  ngOnInit(): void {

    console.log(this.reviewJobsite);


    this.postProjectService.jobsiteScreenChange.subscribe(data => {
      if (this.localStorageService.getItem('jobsiteScreen')) {
        if (this.localStorageService.getItem('milestoneScreen')) {
          this.jobsiteScreen = this.localStorageService.getItem('milestoneScreen');
        }

        if (this.localStorageService.getItem('addJobsiteScreen')) {
          this.jobsiteScreen = this.localStorageService.getItem('addJobsiteScreen');
        }

        if (this.localStorageService.getItem('addLineItemScreen')) {
          this.jobsiteScreen = this.localStorageService.getItem('addLineItemScreen');
        }

        if ((!this.localStorageService.getItem('milestoneScreen')) &&
          (!this.localStorageService.getItem('addJobsiteScreen')) &&
          (!this.localStorageService.getItem('addLineItemScreen'))) {

          //logic added during UT..
          if (this.selectedProject) {
            let project = this.localStorageService.getItem('addProjectDetail');
            if (project.id === this.selectedProject.id) {
              this.sortOrder = 0;
              this.globalFilter = this.setFilter();
              this.sortField = 'CREATED_DATE';
              this.offset = 0;
              this.datatableParam = {
                offset: this.offset,
                size: 10,
                sortField: this.sortField.toUpperCase(),
                sortOrder: this.sortOrder,
                searchText: this.globalFilter
              };
              this.loadJobsiteList();
            }
          }

          this.jobsiteScreen = 'jobsiteListing';
        }
      }
      else {
        this.localStorageService.setItem('jobsiteScreen', 'jobsiteListing', false);
        this.jobsiteScreen = this.localStorageService.getItem('jobsiteScreen');
      }
    });

    this.subscription = this.projectJobSelectionService.addJobsiteSubject.subscribe(data => {
      let project = this.localStorageService.getItem('addProjectDetail');
      if (project) {
        if (project.id === 'pid') {
          this.selectedProject = null;
        }
        else {
          this.selectedProject = project;
          console.log(this.selectedProject.id);
          if (this.localStorageService.getItem('editMode')) {
            setTimeout(() => {
              this.sortOrder = 0;
              this.globalFilter = this.setFilter();
              this.sortField = 'CREATED_DATE';
              this.offset = 0;
              this.datatableParam = {
                offset: this.offset,
                size: 10,
                sortField: this.sortField.toUpperCase(),
                sortOrder: this.sortOrder,
                searchText: this.globalFilter
              };
              this.loadJobsiteList();
            }, 1000);
          }

        }
      }
      else {
        this.selectedProject = null;
      }
    });

    this._selectedColumns = this.columns.filter(a => a.selected == true);
    this.subscribeEditProject();
  }

  subscribeEditProject() {
    this.subscription1 = this.postProjectService.editProject.subscribe(
      data => {
        if (data !== null) {
          this.sortOrder = 0;
          this.globalFilter = this.setFilter();
          this.sortField = 'CREATED_DATE';
          this.offset = 0;
          this.datatableParam = {
            offset: this.offset,
            size: 10,
            sortField: this.sortField.toUpperCase(),
            sortOrder: this.sortOrder,
            searchText: this.globalFilter
          };
          this.loadJobsiteList();
        }
      }
    );
  }

  ngOnChanges() {
    console.log('in change jobsite');
    this.sortOrder = 0;
    this.globalFilter = this.setFilter();
    this.sortField = 'CREATED_DATE';
    this.offset = 0;
    this.datatableParam = {
      offset: this.offset,
      size: 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadJobsiteList();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.subscription1.unsubscribe();
  }

  openEditDialog(jobsite: JobsiteDetail) {
    this.selectedJobsite = jobsite;
    this.isOpenEditdialog = true;
  }

  onHideEdit(event) {
    this.isOpenEditdialog = false;
    this.loadJobsiteList();
  }

  onCancelDialog(event) {
    this.isOpenEditdialog = event;
  }

  openLineItemDialog(id) {
    this.selectedJobsiteId = id;
    this.isOpenLineItemdialog = true;
  }

  cancelScreen(event) {
    this.jobsiteScreen = event;
    console.log('cancel');
  }

  cancelScreenLineItem(event) {
    this.jobsiteScreen = event;
    this.loadJobsiteList();
  }

  onHideLineItem(event) {
    this.isOpenLineItemdialog = false;
    this.sortOrder = 0;
    this.globalFilter = this.setFilter();
    this.sortField = 'CREATED_DATE';
    this.offset = 0;
    this.datatableParam = {
      offset: this.offset,
      size: 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadJobsiteList();
    this.selectedJobsiteId = '';
  }

  cancelLineItemListingDialog(event) {
    this.isOpenLineItemdialog = false;
  }

  onPrevious() {
    this.localStorageService.setItem('currentProjectStep', 1, false);
    this.postProjectService.currentPostProjectStep.next(1);
    let project = this.localStorageService.getItem('addProjectDetail');
    this.postProjectService.addNewProject.next(project);
  }

  onSaveAndAddJobsite() {
    this.localStorageService.setItem('jobsiteScreen', 'addJobsite', false);
    this.postProjectService.jobsiteScreenChange.next('addNewJobsite');
  }

  onReviewAndConfirm() {
    if (this.data.length !== 0) {
      this.localStorageService.setItem('currentProjectStep', 3, false);
      this.postProjectService.currentPostProjectStep.next(3);
      let project = this.localStorageService.getItem('addProjectDetail');
      this.postProjectService.addNewProject.next(project);
    }
    else {
      this.notificationService.error('Please add atleast one jobsite', '');
    }
  }

  onDeleteJobsite(jobsiteId) {
    let jobsite = this.localStorageService.getItem('selectedJobsiteOfDropdown');

    this.jobsiteService.deleteJobsiteByJobsiteId(jobsiteId,
      this.translator.instant('jobsite.deleted.successfully')).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('jobsite.deleted.successfully'), '');
            if (jobsite) {
              if (jobsite.id === jobsiteId) {
                this.localStorageService.removeItem('selectedJobsiteOfDropdown');
                this.projectJobSelectionService.selectedJobsiteOfDropdown.next(null);
              }
            }
          } else {
            this.notificationService.error(data.message, '');
          }

        }
      );
  }

  openDialog(id, title) {
    let options = null;
    options = {
      title: "Warning",
      message: "Are you sure you want to delete?",
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.onDeleteJobsite(id);
        setTimeout(() => {
          this.loadJobsiteList();
          this.projectJobSelectionService.addJobsiteSubject.next(null);
        }, 500);
      }
    });
  }

  setFilter() {
    this.filterMap.clear();
    let project = this.localStorageService.getItem('addProjectDetail');
    if (project) {
      this.filterMap.set('PROJECT_ID', project.id);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    let globalFilter = JSON.stringify(jsonObject);
    return globalFilter;
  }

  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.setFilter();
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadJobsiteList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadJobsiteList() {
    console.log(this.datatableParam);
    let project = this.localStorageService.getItem('addProjectDetail');
    if (this.datatableParam && project) {
      this.loading = true;
      this.queryParam = this.prepareQueryParam(this.datatableParam);
      this.jobsiteService.getAllJobsite(this.queryParam).subscribe(
        data => {
          this.data = data.data.result;
          console.log(data);
          this.loading = false;
          this.offset = data.data.first;
          this.totalRecords = data.data.totalRecords;
          this.localStorageService.setItem('jobsiteDetail', this.data);
          if (data.data.result) {
            let total = 0;
            data.data.result.forEach(element => {
              total += element.cost;
            });
            this.totalCost = total;
          }
        }
      );
    }
  }


  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
}
