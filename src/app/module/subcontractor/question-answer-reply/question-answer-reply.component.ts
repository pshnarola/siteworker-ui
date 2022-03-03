import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { QuestionAnswerService } from 'src/app/service/client-services/question-answer/question-answer.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobsiteDetail } from '../../client/Vos/jobsitemodel';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-question-answer-reply',
  templateUrl: './question-answer-reply.component.html',
  styleUrls: ['./question-answer-reply.component.css']
})
export class QuestionAnswerReplyComponent implements OnInit {

  isAllAnswerShow = true;
  datatableParam: DataTableParam;
  filterMap = new Map();
  queryParam;
  offset: Number = 0;
  totalRecords: Number = 0;
  subscription = new Subscription();
  isSelectedProject = false;
  selectedProject: ProjectDetail = null;
  selectedJobsite: JobsiteDetail = null;
  isSelectedJobsite = false;

  questionAnswer = [];

  constructor(
    private headerManagementService: HeaderManagementService,
    private router: Router,
    private questionAnswerService: QuestionAnswerService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private _localStorageService: LocalStorageService
  ) {
    this.headerManagementService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.headerManagementService.hideHeaderSubject.next(true);
    this.setProject();
    this.setJobsite();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  previous() {
    this.router.navigate(['/subcontractor/question-answer']);
  }

  private setProject() {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      let project = this._localStorageService.getSelectedProjectObject();
      if (project.id === 'pid') {
        this.isSelectedProject = false;
        this.selectedProject = null;
        this.selectedJobsite = null;
        this.isSelectedJobsite = false;
      }
      else {
        this.selectedJobsite = null;
        this.isSelectedJobsite = false;
        this.selectedProject = project;
        if (this.selectedProject !== null) {
          this.isSelectedProject = true;
        }
        this.onProjectChange();
      }
    }));
  }

  private setJobsite() {
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(data => {
      let jobsite = this._localStorageService.getSelectedJobsiteObject();
      if (jobsite) {
        if (jobsite.id === 'jid') {
          this.selectedJobsite = null;
          this.isSelectedJobsite = false;
        }
        else {
          this.selectedJobsite = jobsite;
          if (this.selectedJobsite !== null) {
            this.isSelectedJobsite = true;
          }
        }
        if (jobsite.id !== 'jid') {
          this.onProjectChange();
        }
        else {
          this.selectedJobsite = null;
          this.onProjectChange();
        }
      }
    }));
  }

  downloadExcel() {
    let datatableParam = {
      offset: 0,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.setFilterToGetByClient()
    }
    let queryParam = this.prepareQueryParam(datatableParam)
    this.questionAnswerService.exportToExcel(queryParam).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
        const fileName = 'question-answer';
        saveAs(blob, fileName);
      },
      error => {
        console.log(error);
      }
    );
  }

  handleChange(event) {
    this.onProjectChange();
  }

  setFilterToGetByClient() {
    this.filterMap.clear();
    this.filterMap.set('PROJECT_ID', this.selectedProject.id);
    let jobsite = this._localStorageService.getSelectedJobsiteObject();
    if (jobsite && jobsite.id !== 'jid') {
      this.filterMap.set('JOBSITE_ID', jobsite.id);
    }
    if (!this.isAllAnswerShow) {
      let id = this._localStorageService.getLoginUserId();
      this.filterMap.set('SUB_CONTRACTOR_ID', id);
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

  onProjectChange() {
    this.datatableParam = {
      offset: 0,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.setFilterToGetByClient()
    };
    this.loadQuestionAnswerList();
  }

  loadQuestionAnswerList() {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.questionAnswerService.getQuestionAnswerList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.questionAnswer = data.data.result;
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  downloadDocument() {
    this.questionAnswerService.downloadDocument(this.selectedProject.id).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/zip' });
        const fileName = 'document.zip';
        saveAs(blob, fileName);
      },
      error => {
        console.log(error);
      }
    );
  }
}
