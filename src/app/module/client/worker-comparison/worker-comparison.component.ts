import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ExperienceLevelService } from 'src/app/service/admin-services/experience/experience.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { ChatMessageServiceService } from 'src/app/service/chat-message-service.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { JobBidService } from 'src/app/service/worker-services/job-bid.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { ChatMessageAttachmentDTO } from 'src/app/shared/chat-message-attachment-dto';
import { ChatMessageDTO } from 'src/app/shared/chat-message-dto';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { WorkerComparsion } from '../Vos/worker-comparsion';

@Component({
  selector: 'app-worker-comparison',
  templateUrl: './worker-comparison.component.html',
  styleUrls: ['./worker-comparison.component.css']
})
export class WorkerComparisonComponent implements OnInit, OnDestroy {
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
  dialogHeader = this.translator.instant('send.message');
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
  constructor(
    private translator: TranslateService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private jobBidService: JobBidService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private formBuilder: FormBuilder,
    private fileService: FileDownloadService,
    private notificationService: UINotificationService,
    private confirmDialogService: ConfirmDialogueService,
    private chatMessageService: ChatMessageServiceService,
    private dateHelperService: DateHelperService,
    private experienceService: ExperienceLevelService) {
    this.dataTableParam = new DataTableParam();
    this.captionChangeService.hideHeaderSubject.next(true);
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.setColumnOfTable();
    this.getExceprienceList();
    this._selectedColumns = this.columns.filter(x => x.selected == true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_WORKER_COMPARISON);
    this.getSelectedJob();
    this.initializeForm();
    this.initializeChatMessageForm();

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
      let job = this.localStorageService.getSelectedJob();
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
      this.filterMap.set('AVG_RATING', this.myForm.value.avgRating.value);
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
      this.certificates.forEach(element => {
        this.workersDTO.certificates.push(element.certificate.name);
        this.certificatesList.push(element);
      });
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
  onLazyLoad(event?): void {
    if (this.filterFlag) {
      this.getJobBidDetail();
    }
    else {
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
      if (event) {
        this.sortOrder = event.sortOrder === -1 ? 0 : 1;
        this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
        this.offset = event.first / event.rows;
        this.dataTableParam = {
          offset: this.offset,
          size: event.rows ? event.rows : 10,
          sortField: this.sortField,
          sortOrder: 1,
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
  initializeChatMessageForm(): void {
    this.myChatForm = this.formBuilder.group({
      message: [, CustomValidator.required],
      document: []
    });
  }
  sendMessage(): boolean {
    this.submitted = true;
    if (!this.myChatForm.valid) {
      CustomValidator.markFormGroupTouched(this.myChatForm);
      this.submitted = true;
      return false;
    }
    this.chatMessageDTO.message = this.myChatForm.value.message;
    if (this.attachmentList[0]) {
      this.chatMessageDTO.documentName1 = this.attachmentList[0].fileName;
      this.chatMessageDTO.documentPath1 = this.attachmentList[0].path;
    }
    if (this.attachmentList[1]) {
      this.chatMessageDTO.documentName2 = this.attachmentList[1].fileName;
      this.chatMessageDTO.documentPath2 = this.attachmentList[1].path;
    }
    if (this.attachmentList[2]) {
      this.chatMessageDTO.documentName3 = this.attachmentList[2].fileName;
      this.chatMessageDTO.documentPath3 = this.attachmentList[2].path;
    }
    let loggedInUser = this.localStorageService.getLoginUserObject();
    this.chatMessageDTO.postedTo = this.worker;
    this.chatMessageDTO.postedBy = loggedInUser;
    this.chatMessageDTO.type = 'JOB';
    this.chatMessageDTO.job = this.selectedJob;
    if (this.attachmentList[3]) {
      this.notificationService.error(this.translator.instant('you.can.attach.maximum.three.files'), '');
      this.attachmentList.length = 0;
    } else {
      this.chatMessageService.create(this.chatMessageDTO).subscribe(data => {
        if (data.message === 'OK' && data.statusCode === '200') {
          this.notificationService.success(this.translator.instant('message.sent'), '');
          this.hideDialog();
        }
        else {
          this.notificationService.error(data.message, '');
        }
      });
    }
  }
  uploadFile(): void {
    if (this.files.length !== 0) {
      if (this.files.length <= 3) {
        const uploadFileData = new FormData();
        this.files.forEach(element => {
          uploadFileData.append('file', element);
        });
        this.fileService.uploadMultipleFile(uploadFileData).subscribe(
          event => {
            if (event instanceof HttpResponse) {
              this.logoBody = event.body;
              this.logoData = this.logoBody.data;
              if (this.logoData.length === this.files.length) {
                this.files.forEach((element, i) => {
                  this.attachment = new ChatMessageAttachmentDTO(element.name, this.logoData[i]);
                  this.attachmentList.push(this.attachment);
                });
              }
              this.sendMessage();

            }

          },
          (error) => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          });
      }
      else {
        this.notificationService.error(this.translator.instant('you.can.upload.maximum.three.attachments'), '');

      }
    }
    else {
      this.sendMessage();
    }
  }
  showMessageDialog(worker): void {
    this.dialog = true;
    this.worker = worker;
    this.initializeChatMessageForm();
  }
  hideDialog(): void {
    this.dialog = false;
    this.files.length = 0;
    this.attachmentList.length = 0;
    this.submitted = false;
  }
  openDeleteDialogForTemp(index, title): void {
    let options = null;
    const message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message}?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.onRemoveFromList(index);
      }
    });
  }
  onRemoveFromList(id): void {
    const fileTemp: File[] = [];
    this.files.forEach((e, index) => {
      if (index !== id) {
        fileTemp.push(e);
      }
    });
    this.files.length = 0;
    this.files = fileTemp;
    this.notificationService.success(this.translator.instant('document.deleted'), '');

  }
  onSelect(event): void {
    this.files.splice(2, 0, ...event.addedFiles);
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.pdf.upload'), '');
      }

      event.rejectedFiles = [];
    }
  }
  clear(): void {
    this.filterFlag = false;
    this.myForm.reset();
    this.filterMap.clear();
    let emptyArray = []
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
  hideCertificateDialog() {
    this.displayCertificate = false;
  }
  hideScreeningDialog() {
    this.displayScreeningQuestions = false;
  }
  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }
}
