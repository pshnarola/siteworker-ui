import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ExperienceLevelService } from 'src/app/service/admin-services/experience/experience.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { JobBidService } from 'src/app/service/worker-services/job-bid.service';
import { WorkerCertificateService } from 'src/app/service/worker-services/workerCertificate/worker-certificate.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { ChatMessageAttachmentDTO } from 'src/app/shared/chat-message-attachment-dto';
import { ChatMessageDTO } from 'src/app/shared/chat-message-dto';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { WorkerComparsion } from '../../client/Vos/worker-comparsion';

@Component({
  selector: 'app-worker-comparsion',
  templateUrl: './worker-comparsion.component.html',
  styleUrls: ['./worker-comparsion.component.css']
})
export class WorkerComparsionComponent implements OnInit {
  @ViewChild('dt') table: Table;
  isFilterOpened = false;
  columns = [];
  loading = false;
  offset = 0;
  totalRecords = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  filterMap = new Map();
  certificateFilterMap = new Map();
  screeningFilterMap = new Map();
  workers = [];
  filterWorkers = [];
  columns1 = [];
  selectedWorkers = [];
  flag: number;
  dataTableParam: DataTableParam;
  globalFilter;
  queryParam;
  selectedJob: any;
  employementType: any;
  _selectedColumns: any[];
  sortField = '';
  sortOrder;
  jobBidId: any;
  certificates = [];
  displayCertificate = false;
  displayScreeningQuestions = false;
  screeningQuestions = [];
  certificatesList = [];
  screeningQuestionsList = [];
  workersDTO: WorkerComparsion;
  workersDTOList: WorkerComparsion[] = [];
  subscription = new Subscription();
  isSelectedJob: boolean;
  workerNameParams;
  jobTitleParams: { title: any; };
  titles = [];
  myForm: FormGroup;
  bidSubmittedFromDate;
  filterWorkersFromList = [];
  jobTitlesFromList = [];
  averageRatingList = [
    { label: '5', value: '5' },
    { label: 'Above 4', value: '4' },
    { label: 'Above 3', value: '3' },
    { label: 'Above 2', value: '2' },
    { label: 'Above 1', value: '1' }];
  filteredAverageRating: any[];
  myChatForm: FormGroup;
  FileName: any;
  files: File[] = [];
  logoBody: any;
  logoData: any;
  dialog = false;
  attachment: ChatMessageAttachmentDTO;
  attachmentList: ChatMessageAttachmentDTO[] = [];
  submitted = false;
  chatMessageDTO = new ChatMessageDTO();
  workerId: any;
  worker: any;
  hourlyFrom;
  hourlyTo;
  errorFlagHour = false;
  feedback: string;
  annualTo: any;
  annualFrom: any;
  errorFlag: boolean;
  filterFlag = false;
  filteredExpirience = [];
  experience = [];
  dateErrorFlage: boolean;
  bidSubmittedToDate;
  constructor(private translator: TranslateService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private jobBidService: JobBidService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private workerCertificateService: WorkerCertificateService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private formBuilder: FormBuilder,
    private experienceService: ExperienceLevelService,
    private notificationService: UINotificationService,
    private confirmDialogService: ConfirmDialogueService,

    private dateHelperService: DateHelperService) {
    this.dataTableParam = new DataTableParam();
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.setColumnOfTable();
    this._selectedColumns = this.columns.filter(x => x.selected == true);
    if (this._selectedColumns.length == 0) {
      this._selectedColumns = this.columns;
    }

    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_WORKER_COMPARISON);
    this.getSelectedJob();
    this.initializeForm();
    this.getExceprienceList();

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  onFilterOpen(): void {

    this.isFilterOpened = !this.isFilterOpened;
  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      workerName: [],
      jobTitle: [],
      minHourlyRate: [],
      maxHourlyRate: [],
      minAnnualSalary: [],
      maxAnnualSalary: [],
      bidSubmittedFromDate: [],
      bidSubmittedToDate: [],
      avgRating: [],
      totalExperience: []
    });
  }
  private setColumnOfTable(): void {
    if (this.employementType === 'FULL_TIME') {
      this.columns = [
        { label: this.translator.instant('worker'), value: 'jobBidDetail.worker.firstName', field: 'worker', sortable: true, selected: true },
        { label: this.translator.instant('job.title'), value: 'jobBidDetail.jobDetail.jobTitle.title', field: 'jobDetail', sortable: true, selected: true },
        { label: this.translator.instant('yearly.rate'), value: 'jobBidDetail.workerAnnualSalary', field: 'workerAnnualSalary', sortable: true, selected: true },
        { label: this.translator.instant('city'), value: 'jobBidDetail.workerProfile.city', field: 'workerCity', sortable: true, selected: false },
        // { label: this.translator.instant('state'), value: 'WORKER_STATE', field: 'workerState', sortable: true, selected: false },
        { label: this.translator.instant('job.average.rating'), value: 'workerAvgRating', field: 'workerAvgRating', sortable: true, selected: false },
        { label: this.translator.instant('total.experience'), value: 'workerTotalExperience', field: 'workerTotalExperience', sortable: true, selected: false },
        { label: this.translator.instant('job.success.ratio'), value: 'workerSuccessRatio', field: 'workerSuccessRatio', sortable: true, selected: false },
        // tslint:disable-next-line: max-line-length
        { label: this.translator.instant('tentative.start.date'), value: 'jobBidDetail.workerTentativeStartDate', field: 'workerTentativeStartDate', sortable: true, selected: false },
        { label: this.translator.instant('certificates'), value: 'certificates', field: 'certificates', sortable: false, selected: false },
        { label: this.translator.instant('screening.questions'), value: 'screeningQuestions', field: 'screeningQuestions', sortable: false, selected: false },
      ];
    }
    else {
      this.columns = [
        { label: this.translator.instant('worker'), value: 'jobBidDetail.worker.firstName', field: 'worker', sortable: true, selected: true },
        { label: this.translator.instant('job.title'), value: 'jobBidDetail.jobDetail.jobTitle.title', field: 'jobDetail', sortable: true, selected: true },
        { label: this.translator.instant('hourly.rate'), value: 'jobBidDetail.workerHourlyRate', field: 'workerHourlyRate', sortable: true, selected: true },
        { label: this.translator.instant('city'), value: 'jobBidDetail.workerProfile.city', field: 'workerCity', sortable: true, selected: false },
        // { label: this.translator.instant('state'), value: 'WORKER_STATE', field: 'workerState', sortable: true, selected: false },
        { label: this.translator.instant('job.average.rating'), value: 'workerAvgRating', field: 'workerAvgRating', sortable: true, selected: false },
        { label: this.translator.instant('total.experience'), value: 'workerTotalExperience', field: 'workerTotalExperience', sortable: true, selected: false },
        { label: this.translator.instant('job.success.ratio'), value: 'workerSuccessRatio', field: 'workerSuccessRatio', sortable: true, selected: false },
        // tslint:disable-next-line: max-line-length
        { label: this.translator.instant('tentative.start.date'), value: 'jobBidDetail.workerTentativeStartDate', field: 'workerTentativeStartDate', sortable: true, selected: false },
        { label: this.translator.instant('certificates'), value: 'certificates', field: 'certificates', sortable: false, selected: false },
        { label: this.translator.instant('screening.questions'), value: 'screeningQuestions', field: 'screeningQuestions', sortable: false, selected: false },
      ];
    }
    this.columns1 = [
      { label: this.translator.instant('shortlisted.workers'), value: 'shortList' },
      { label: this.translator.instant('action'), value: 'action' },
    ];

  }
  prepareQueryParam(paramObject): Params {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }
  getWorkerByName(name): void {
    this.workerNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.workerNameParams);
    this.filterLeftPanelService.getWorkerByName(this.queryParam).subscribe(data => {

      this.filterWorkers = data.data;
      this.filterWorkers = this.filterWorkers.sort();
    });
  }
  getJobTitleOfWorker(name): void {
    this.jobTitleParams = {
      title: name.query,
    };
    this.queryParam = this.prepareQueryParam(this.jobTitleParams);
    this.filterLeftPanelService.getMasterJobTitleOfWorker(this.queryParam).subscribe(data => {

      this.titles = data.data;
      // this.titles = this.titles.sort();

    });
  }
  onSelectWorker(worker): void {

    if (this.selectedWorkers.length < 10) {
      this.selectedWorkers.push(worker);
      this.flag = 1;
    }

  }
  removeFromSelectedWorker(worker): void {
    const index = this.selectedWorkers.indexOf(worker);
    if (index !== -1) {
      this.selectedWorkers.splice(index, 1);
      this.flag = 0;
    }
  }
  isWorkerSelected(id): boolean {
    let count = 0;
    this.selectedWorkers.forEach(
      // tslint:disable-next-line: typedef
      function (worker) {
        if (worker.jobBidDetail.id === id) {
          count++;
        }
      }
    );
    if (count > 0) {
      return true;
    }
    else {
      return false;
    }
  }
  getSelectedJob(): void {
    this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(data => {
      this.selectedWorkers.length = 0;
      const job = this.localStorageService.getSelectedJob();
      if (job.id === 'jobId') {
        this.selectedJob = null;
      }
      else {
        this.selectedJob = job;
        this.employementType = this.selectedJob.employmentType;
        this.setColumnOfTable();
        this._selectedColumns = this.columns.filter(x => x.selected == true);
        this.setDefaultCriteria();
      }
    }));

  }
  hideCertificateDialog() {
    this.displayCertificate = false;
  }
  hideScreeningDialog() {
    this.displayScreeningQuestions = false;
  }
  filterAverageRating(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.averageRatingList.length; i++) {
      const averageRatingList = this.averageRatingList[i];
      if (averageRatingList.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(averageRatingList);
      }
    }

    this.filteredAverageRating = filtered;
    this.filteredAverageRating = this.filteredAverageRating.sort();


  }
  onChangeHourlyToValue(event): void {
    this.hourlyFrom = this.myForm.value.minHourlyRate;
    this.hourlyTo = event.target.value;

    // tslint:disable-next-line: radix
    if (parseInt(this.hourlyTo) !== 0) {
      // tslint:disable-next-line: radix
      if (parseInt(this.hourlyTo) <= parseInt(this.hourlyFrom)) {
        this.errorFlagHour = true;
        this.feedback = 'To cannot be smaller than from';
      }
      else {
        this.errorFlagHour = false;
      }
    }
  }
  onChangeHourlyFromValue(event): void {
    this.hourlyTo = this.myForm.value.maxHourlyRate;
    this.hourlyFrom = event.target.value;

    // tslint:disable-next-line: radix
    if (parseInt(this.hourlyTo) !== 0) {
      // tslint:disable-next-line: radix
      if (parseInt(this.hourlyTo) <= parseInt(this.hourlyFrom)) {
        this.errorFlagHour = true;
        this.feedback = 'To cannot be smaller than from';
      }
      else {
        this.errorFlagHour = false;
      }
    }
  }
  onChangeAnnualTo(event): void {
    this.annualTo = event.target.value;
    this.annualFrom = this.myForm.value.minAnnualSalary;
    // tslint:disable-next-line: radix
    if (parseInt(this.annualTo) !== 0) {
      // tslint:disable-next-line: radix
      if (parseInt(this.annualTo) <= parseInt(this.annualFrom)) {
        this.errorFlag = true;
        this.feedback = 'To cannot be smaller than from';
      }
      else {
        this.errorFlag = false;
      }
    }
  }
  onChangeAnnualFrom(event): void {
    this.annualFrom = event.target.value;
    this.annualTo = this.myForm.value.maxAnnualSalary;
    // tslint:disable-next-line: radix
    if (parseInt(this.annualTo) !== 0) {
      // tslint:disable-next-line: radix
      if (parseInt(this.annualTo) <= parseInt(this.annualFrom)) {
        this.errorFlag = true;
        this.feedback = 'To cannot be smaller than from';
      }
      else {
        this.errorFlag = false;
      }
    }
  }
  filterJobBidDetail(): void {
    this.filterMap.clear();
    this.filterFlag = true;
    this.filterMap.set('STATUS', 'APPLIED');
    this.filterMap.set('JOB_DETAIL_ID', this.selectedJob.id);
    this.dateErrorFlage = false;
    this.errorFlagHour = false;
    this.jobTitlesFromList = [];
    if ((this.myForm.value.minHourlyRate === null && this.myForm.value.maxHourlyRate !== null) ||
      (this.myForm.value.minHourlyRate !== null && this.myForm.value.maxHourlyRate === null)) {
      this.errorFlagHour = true;
    }

    if (!this.myForm.value.minHourlyRate && !this.myForm.value.maxHourlyRate) {
      this.errorFlagHour = false;
    }

    if ((this.myForm.value.minAnnualSalary === null && this.myForm.value.maxAnnualSalary !== null) ||
      (this.myForm.value.minAnnualSalary !== null && this.myForm.value.maxAnnualSalary === null)) {
      this.errorFlag = true;
    }

    if (!this.myForm.value.minAnnualSalary && !this.myForm.value.maxAnnualSalary) {
      this.errorFlag = false;
    }

    if (((this.myForm.value.bidSubmittedFromDate && !this.myForm.value.bidSubmittedToDate) ||
      (!this.myForm.value.bidSubmittedFromDate && this.myForm.value.bidSubmittedToDate))) {
      this.dateErrorFlage = true;
    }

    if (!this.myForm.value.bidSubmittedFromDate && !this.myForm.value.bidSubmittedToDate) {
      this.dateErrorFlage = false;
    }

    if (this.myForm.value.bidSubmittedFromDate > this.myForm.value.bidSubmittedToDate) {
      this.dateErrorFlage = true;
    }

    this.filterWorkersFromList.length = 0;
    this.jobTitlesFromList.length = 0;
    if (this.myForm.value.workerName) {
      this.myForm.value.workerName.forEach(element => {
        this.filterWorkersFromList.push(element.id);
        this.filterMap.set('WORKER_ID', this.filterWorkersFromList.toString());
      });
    }
    if (this.myForm.value.jobTitle) {
      this.jobTitlesFromList.push(this.myForm.value.jobTitle);
      this.filterMap.set('WORKER_JOB_TITLE', this.jobTitlesFromList.toString());
    }
    if (this.myForm.value.minHourlyRate && !this.errorFlagHour) {
      this.filterMap.set('MIN_HOURLY_RATE', this.myForm.value.minHourlyRate);
    }
    if (this.myForm.value.maxHourlyRate && !this.errorFlagHour) {
      this.filterMap.set('MAX_HOURLY_RATE', this.myForm.value.maxHourlyRate);
    }
    if (this.myForm.value.minAnnualSalary && !this.errorFlag) {
      this.filterMap.set('MIN_SALARY', this.myForm.value.minAnnualSalary);
    }
    if (this.myForm.value.maxAnnualSalary && !this.errorFlag) {
      this.filterMap.set('MAX_SALARY', this.myForm.value.maxAnnualSalary);
    }
    if (this.myForm.value.bidSubmittedFromDate) {
      this.dateHelperService.setStartDate(this.myForm.value.bidSubmittedFromDate);
      const datePipe = new DatePipe('en-US');
      const value = datePipe.transform(this.myForm.value.bidSubmittedFromDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('APPLIED_DATE_FROM', value);
    }
    if (this.myForm.value.bidSubmittedToDate) {
      this.dateHelperService.setEndDate(this.myForm.value.bidSubmittedToDate);
      const datePipe = new DatePipe('en-US');
      const valueEnd = datePipe.transform(this.myForm.value.bidSubmittedToDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('APPLIED_DATE_TO', valueEnd);
    }
    if (this.myForm.value.avgRating) {
      // this.myForm.value.avgRating.forEach(element => {
      this.filterMap.set('AVG_RATING', this.myForm.value.avgRating.value);
      // });
    }
    if (this.myForm.value.totalExperience) {
      this.filterMap.set('TOTAL_EXPERIENCE', this.myForm.value.totalExperience.id);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    if (!this.dateErrorFlage) {
      this.globalFilter = JSON.stringify(jsonObject);
      this.dataTableParam = {
        offset: this.offset,
        size: this.size,
        sortField: this.sortField,
        sortOrder: -1,
        searchText: this.globalFilter
      };

      this.getJobBidDetail();
    }
    else {
      this.notificationService.error(this.translator.instant('please.enter.appropriate.date.range'), '');
    }
  }
  getJobBidDetail(): void {
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobBidService.getJobBidDetail(this.queryParam).subscribe(data => {

      if (data.data) {
        this.workers = data.data.result;

        this.offset = data.data.first;
        this.totalRecords = data.data.totalRecords;
        this.workers.forEach(element => {
          this.jobBidId = element.jobBidDetail.id;

        });
      }
      else {
        this.workers.length = 0;
      }
    });
  }
  setDefaultCriteria() {
    this.filterMap.clear();
    this.filterMap.set('STATUS', 'APPLIED');
    if (this.selectedJob) {
      this.filterMap.set('JOB_DETAIL_ID', this.selectedJob.id);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField,
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.getJobBidDetail();
  }
  getJobBidCertificate(id): void {
    this.certificateFilterMap.set('JOB_BID_DETAIL_ID', id);
    const jsonObject = {};
    this.certificateFilterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField,
      sortOrder: -1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobBidService.getJobBidCertificate(this.queryParam).subscribe(data => {

      this.certificates = data.data.result;

    });
  }
  getJobBidScreeningQuestions(id): void {
    this.screeningFilterMap.set('JOB_BID_DETAIL_ID', id);
    const jsonObject = {};
    this.screeningFilterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'QUESTION_NO',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobBidService.getJobBidScreeningQuestions(this.queryParam).subscribe(data => {

      this.screeningQuestions = data.data.result;
      this.screeningQuestions.forEach(element => {
        this.screeningQuestionsList.push(element);
      });
    });
  }

  onLazyLoad(event?): void {
    if (this.filterFlag) {
      this.getJobBidDetail();
    }
    else {

      this.filterMap.clear();
      this.filterMap.set('STATUS', 'APPLIED');
      this.filterMap.set('JOB_DETAIL_ID', this.selectedJob.id);
      const jsonObject = {};
      this.filterMap.forEach((value, key) => {
        jsonObject[key] = value;
      });

      this.globalFilter = JSON.stringify(jsonObject);
      if (event) {
        this.sortOrder = event.sortOrder === -1 ? 0 : 1;
        // this.globalFilter = event.globalFilter ? event.globalFilter : null;
        this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
        this.offset = event.first / event.rows;
        this.dataTableParam = {
          offset: this.offset,
          size: event.rows ? event.rows : 10,
          sortField: this.sortField.toUpperCase(),
          sortOrder: this.sortOrder,
          searchText: this.globalFilter
        };
      }
      else {
        this.dataTableParam = {
          offset: this.offset,
          size: this.size,
          sortField: this.sortField.toUpperCase(),
          sortOrder: this.sortOrder,
          searchText: this.globalFilter
        };
      }

      this.getJobBidDetail();
    }
  }
  reviewAndOffer(): void {
    this.localStorageService.setItem('selectedWorkers', this.selectedWorkers);
    this.router.navigate(['/client/review-and-offer']);
  }

  showCertificateDialog(id): void {
    this.displayCertificate = true;
    this.getJobBidCertificate(id);
  }
  showScreeningQuestionsDialog(id): void {
    this.displayScreeningQuestions = true;
    this.getJobBidScreeningQuestions(id);
  }
  redirectToWorker(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_WORKER_PROFILE + '?user=' + id);
  }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
  clear(): void {
    this.filterFlag = false;
    this.myForm.reset();
    this.filterMap.clear();
    let emptyArray = [];
    if (this.myForm.get('workerName').value) {
      this.myForm.get('workerName').patchValue(emptyArray);
    }
    if (this.myForm.get('jobTitle').value) {
      this.myForm.get('jobTitle').patchValue(emptyArray);
    }
    this.setDefaultCriteria();
  }
  private getExceprienceList() {
    let dataTableParam = {
      offset: 0,
      size: 100000,
      sortField: 'LEVEL',
      sortOrder: 1,
      searchText: null
    };

    this.queryParam = this.prepareQueryParam(dataTableParam);
    this.experienceService.getExperienceLevelList(this.queryParam).subscribe(
      data => {

        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.experience = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  filterExperience(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.experience.length; i++) {
      let exceperience1 = this.experience[i];

      if (exceperience1.level.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(exceperience1);
      }
    }
    this.filteredExpirience = filtered;

    this.filteredExpirience = this.filteredExpirience.sort();
  }
  getFullName(data: User) {
    // 
    return data.firstName + ' ' + data.lastName;
  }
}
