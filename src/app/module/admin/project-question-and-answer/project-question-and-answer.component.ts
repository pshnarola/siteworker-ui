import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { QuestionAnswerService } from 'src/app/service/client-services/question-answer/question-answer.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobsiteDetail } from '../../client/Vos/jobsitemodel';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-project-question-and-answer',
  templateUrl: './project-question-and-answer.component.html',
  styleUrls: ['./project-question-and-answer.component.css']
})
export class ProjectQuestionAndAnswerComponent implements OnInit, OnDestroy {

  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords = 0;
  loading = false;
  data = [];
  datatableParam: DataTableParam;
  filterMap = new Map();
  queryParam;
  offset: Number = 0;
  selectedProject: ProjectDetail = null;
  selectedJobsite: JobsiteDetail = null;
  subscription = new Subscription();
  isSelectedProject = false;
  isSelectedJobsite = false;
  sortField = 'CREATED_DATE';
  sortOrder = 0;
  globalFilter;
  columns;

  constructor(
    private captionChangeService: HeaderManagementService,
    private questionAnswerService: QuestionAnswerService,
    private _localStorageService: LocalStorageService,
    private projectJobSelectionService: ProjectJobSelectionService
  ) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.setProject();
    this.setJobsite();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  setColumn() {
    this.columns = [
      { label: 'Subcontractor', value: 'SUB_CONTRACTOR_NAME', sortable: true, isHidden: false, field: 'SUB_CONTRACTOR_NAME' },
      { label: 'Jobsite Title', value: 'JOB_SITE_TITLE', sortable: true, isHidden: this.selectedJobsite ? true : false, field: 'JOB_SITE_TITLE' },
      { label: 'Posted Time', value: 'CREATED_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE' },
      { label: 'Question', value: 'QUESTION', sortable: true, isHidden: false, field: 'QUESTION' },
      { label: 'Answer', value: 'answer', sortable: true, isHidden: false, field: 'answer' }
    ];
  }

  private setProject() {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      let project = this._localStorageService.getSelectedProjectObject();
      if (project.id === 'pid') {
        this.selectedJobsite = null;
        this.isSelectedJobsite = false;
        this.isSelectedProject = false;
        this.selectedProject = null;
      }
      else {
        this.selectedJobsite = null;
        this.isSelectedJobsite = false;
        this.selectedProject = project;
        if (this.selectedProject !== null) {
          this.isSelectedProject = true;
          this.onProjectChange();
        }
      }
      this.setColumn();

    }));
  }

  private setJobsite() {
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(data => {
      let jobsite = this._localStorageService.getSelectedJobsiteObject();
      if (jobsite) {
        if (jobsite.id === 'jid') {
          this.selectedJobsite = null;
          this.isSelectedJobsite = false;
          this.onProjectChange();
        }
        else {
          this.selectedJobsite = jobsite;
          if (this.selectedJobsite !== null) {
            this.isSelectedJobsite = true;
            this.onProjectChange();
          }
        }
      }
      this.setColumn();
    }));
  }

  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.setFilterToGetByProjectId();
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadQuestionAnswerList();
  }

  onProjectChange() {
    this.datatableParam = {
      offset: 0,
      size: 10,
      sortField: this.sortField ? this.sortField.toUpperCase() : 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.setFilterToGetByProjectId()
    };
    this.loadQuestionAnswerList();
  }

  setFilterToGetByProjectId() {
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
    let globalFilter = JSON.stringify(jsonObject);
    return globalFilter;
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadQuestionAnswerList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.questionAnswerService.getQuestionAnswerList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            this.data = data.data.result;
            this.data.map(e => {

            });
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
}
