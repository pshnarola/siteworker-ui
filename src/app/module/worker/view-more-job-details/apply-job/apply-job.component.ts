import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { Certificate } from 'src/app/module/admin/certificate/certificate';
import { JobDetails } from 'src/app/module/client/post-job/job-details';
import { JobScreeningQuestionDTO } from 'src/app/module/client/Vos/JobScreeningQuestionsModel';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { JobBidService } from 'src/app/service/worker-services/job-bid.service';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobBidDetailDTO } from 'src/app/shared/vo/job-bid-detail-dto';
import { User } from 'src/app/shared/vo/User';
import { WorkerSidebarJobListService } from 'src/app/shared/worker-sidebar-job-list.service';
import { ApplyJobBidDTO } from '../../vo/apply-job-bid-dto';
import { JobBidCertificateDTO } from '../../vo/job-bid-certificate-dto';
import { JobBidScreeningQuestionDTO } from '../../vo/job-bid-screening-question-dto';
@Component({
  selector: 'app-apply-job',
  templateUrl: './apply-job.component.html',
  styleUrls: ['./apply-job.component.css']
})
export class ApplyJobComponent implements OnInit {
  /*
    @author Vinita Jagwani
  */
  columns = [];
  jobData: any;
  certificateList: any;
  filteredCertificates: any[];
  dataTableParam: DataTableParam;
  queryParam;
  screeningQuestionsList = [];
  loading = false;
  offset = 0;
  dateTime = new Date();
  totalRecords = 0;
  myForm: FormGroup;
  applyJobDto: ApplyJobBidDTO;
  jobBidDetail: JobBidDetailDTO;
  jobBidCertificate: JobBidCertificateDTO;
  selectedCertificates: Certificate[];
  jobCertificateList = [];
  jobBidScreeningList = [];
  answerList = [];
  jobScreeningQuestion: JobScreeningQuestionDTO;
  jobBidScreeningQuestions: JobBidScreeningQuestionDTO[] = [];
  user: User;
  jobDetail: JobDetails;
  submitted = false;
  filterMap = new Map();
  globalFilter: string;
  employementType: string;

  @ViewChild('dt') table: Table;
  checkParams: { jobDetailId: any; workerId: any; };
  workerSelectedJob: any;
  id: any;
  loginUserId: any;
  status: any;
  bidData: any;
  jobTitle: any;
  checkParams1: { jobDetailId: any; workerId: any; };
  screeningQuestionAnswers = [];
  appliedFlag = false;
  date = new Date();
  subscription = new Subscription();
  constructor(private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private jobBidService: JobBidService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private workerSideBarJobListService: WorkerSidebarJobListService,
    private router: Router) {
    this.dataTableParam = new DataTableParam();

    this.applyJobDto = new ApplyJobBidDTO();
    this.jobBidDetail = new JobBidDetailDTO();
    this.user = this.localStorageService.getLoginUserObject();
    this.dateTime.setDate(this.dateTime.getDate());
    this.loginUserId = this.localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.setColumnOfTable();
    this.initializeForm(this.screeningQuestionsList);
    this.submitted = false;
    this.subscription.add(this.workerSideBarJobListService.workerSidebarJobChanged.subscribe(e => {
      this.initializeForm(this.screeningQuestionsList);
      this.getSelectedJobDetails();
    }));
  }
  getSelectedJobDetails() {
    if (this.localStorageService.getItem('workerSelectedJob')) {
      this.workerSelectedJob = this.localStorageService.getItem('workerSelectedJob');
      this.id = this.workerSelectedJob.id;
      this.jobTitle = this.workerSelectedJob.title;
      this.checkParams = {
        jobDetailId: this.id,
        workerId: this.loginUserId,
      };
      this.queryParam = this.prepareQueryParam(this.checkParams);
      this.jobBidService.getJobBidDetailByJobAndWorker(this.queryParam).subscribe(bidData => {
        if (bidData.data) {
          this.bidData = bidData.data;
          this.status = bidData.data.jobBidDetail.status;
        }
        if (this.status !== 'APPLIED') {
          this.localStorageService.setItem('startedBidding', false);
          this.checkParams1 = {
            jobDetailId: this.id,
            workerId: this.loginUserId,
          };
          this.queryParam = this.prepareQueryParam(this.checkParams1);
          this.jobBidService.startBidding(this.queryParam).subscribe(data => {
            if (data.statusCode === '200') {
              this.submitted = false;
              this.jobData = data.data;
              this.appliedFlag = false;
              this.setColumnOfTable();
              this.getScreeningQuestions();
              this.employementType = this.jobData.jobDetail.employmentType;
              this.getCertificateById();
              this.initializeForm(this.screeningQuestionsList);
              this.addOrRemoveFormControl();
              this.localStorageService.setItem('startedBidding', false);
            }
          });
        }
        else {
          this.setColumnOfTable();
          this.employementType = this.bidData.jobBidDetail.jobDetail.employmentType;
          this.appliedFlag = true;
          this.getScreeningQuestions();
          this.getCertificateById();
          this.addOrRemoveFormControl();
        }
      });
    }
  }
  ngOnDestroy() {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.localStorageService.removeItem('jobData');
    this.localStorageService.removeItem('workerSelectedJob');
    this.subscription.unsubscribe();
  }
  onFormValueChange(): void {
    this.myForm.valueChanges.subscribe(value => {
      if (value.workerHourlyRate === '' && value.workerTentativeStartDate === '' &&
        value.workerSpecialNote === null && value.certificate === null && value.screeningQuestionAnswer.length === 0) {
        this.localStorageService.setItem('startedBidding', false);
        this.localStorageService.setItem('biddingForm', value);
      }
      else {
        this.localStorageService.setItem('startedBidding', true);
        this.localStorageService.setItem('biddingForm', value);
      }
    });
  }
  initializeForm(screeningQuestionsList): void {
    const screeningQuestionAnswer = new FormArray([]);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < screeningQuestionsList.length; i++) {
      screeningQuestionAnswer.push(this.formBuilder.group({
        id: screeningQuestionsList[i].id,
        questionNo: screeningQuestionsList[i].questionNo,
        question: screeningQuestionsList[i].question,
        answer: [, CustomValidator.required]
      }));
    }
    if (this.employementType === 'FULL_TIME') {
      this.myForm = this.formBuilder.group({
        workerAnnualSalary: [, [CustomValidator.required, Validators.min(0.01)]],
        workerTentativeStartDate: [, [CustomValidator.required]],
        workerSpecialNote: [],
        certificate: [],
        screeningQuestionAnswer
      });
    }
    else {
      this.myForm = this.formBuilder.group({
        workerHourlyRate: [, [CustomValidator.required, Validators.min(0.01)]],
        workerTentativeStartDate: [, [CustomValidator.required]],
        workerSpecialNote: [],
        certificate: [],
        screeningQuestionAnswer
      });
    }
    if (!this.localStorageService.getItem('jobData')) {
      this.onFormValueChange();
    }
  }
  private setColumnOfTable(): void {
    this.columns = [
      { label: this.translator.instant('question.no'), value: 'questionNo' },
      { label: this.translator.instant('questions'), value: 'question' },
      { label: this.translator.instant('submit.answer'), value: 'submit_answer' }
    ];
  }

  getCertificateById(): void {
    if (this.appliedFlag) {
      this.jobBidService.getCertificates(this.bidData.jobBidDetail.jobDetail.id).subscribe(data => {
        this.certificateList = data.data;
      });
    }
    else {
      this.jobBidService.getCertificates(this.jobData.jobDetail.id).subscribe(data => {
        this.certificateList = data.data;
      });
    }

  }
  filterCertificate(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.certificateList.length; i++) {
      const certificate = this.certificateList[i];
      if (certificate.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(certificate);
      }
    }
    this.filteredCertificates = filtered;
    this.filteredCertificates = this.filteredCertificates.sort();
  }
  getScreeningQuestions(): void {
    if (this.appliedFlag) {
      this.filterMap.set('JOB_DETAIL_ID', this.bidData.jobBidDetail.jobDetail.id);
    }
    else {
      this.filterMap.set('JOB_DETAIL_ID', this.jobData.jobDetail.id);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: 0,
      size: 10,
      sortField: 'QUESTION_NO',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobBidService.getScreeningQuestions(this.queryParam).subscribe(data => {
      this.screeningQuestionsList = data.data.result;
      this.initializeForm(this.screeningQuestionsList);
      if (this.appliedFlag) {
        this.patchForm(this.bidData);
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
  private addOrRemoveFormControl(): void {
    if (this.appliedFlag) {
      if (this.employementType === 'WORKER_1099' || this.employementType === 'WORKER_W2') {
        this.myForm.removeControl('workerAnnualSalary');
        this.myForm.addControl('workerHourlyRate', new FormControl('', [CustomValidator.required]));
      }
      else {
        this.myForm.removeControl('workerHourlyRate');
        this.myForm.addControl('workerAnnualSalary', new FormControl('', [CustomValidator.required]));
      }
    }
    else {
      if (this.jobData.jobDetail.employmentType === 'WORKER_1099' || this.jobData.jobDetail.employmentType === 'WORKER_W2') {
        this.myForm.removeControl('workerAnnualSalary');
        this.myForm.addControl('workerHourlyRate', new FormControl('', [CustomValidator.required]));
      }
      else {
        this.myForm.removeControl('workerHourlyRate');
        this.myForm.addControl('workerAnnualSalary', new FormControl('', [CustomValidator.required]));
      }
    }
  }
  applyJob(): boolean {
    this.submitted = true;
    if (!this.myForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.myForm.controls) {
        this.myForm.controls[controlName].markAsDirty();
        this.myForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = true;
      return false;
    }
    if (!this.appliedFlag) {
      if (this.jobData.jobDetail.employmentType === 'WORKER_1099' || this.jobData.jobDetail.employmentType === 'WORKER_W2') {
        this.jobBidDetail.workerHourlyRate = this.myForm.controls.workerHourlyRate.value;
      }
      if (this.jobData.jobDetail.employmentType === 'FULL_TIME') {
        this.jobBidDetail.workerAnnualSalary = this.myForm.controls.workerAnnualSalary.value;
      }
    }
    else {
      if (this.employementType === 'WORKER_1099' || this.employementType === 'WORKER_W2') {
        this.jobBidDetail.workerHourlyRate = this.myForm.controls.workerHourlyRate.value;
      }
      if (this.employementType === 'FULL_TIME') {
        this.jobBidDetail.workerAnnualSalary = this.myForm.controls.workerAnnualSalary.value;
      }
    }
    this.jobBidDetail.workerSpecialNote = this.myForm.controls.workerSpecialNote.value;
    this.jobBidDetail.workerTentativeStartDate = this.myForm.controls.workerTentativeStartDate.value;
    this.jobBidDetail.worker = this.user;
    if (!this.appliedFlag) {
      this.jobDetail = this.jobData.jobDetail;
    }
    else {
      this.jobDetail = this.workerSelectedJob;
    }
    this.jobBidDetail.jobDetail = this.jobDetail;
    this.applyJobDto.jobBidDetail = this.jobBidDetail;
    this.selectedCertificates = this.myForm.controls.certificate.value;
    this.jobCertificateList.length = 0;
    if (this.selectedCertificates) {
      this.selectedCertificates.forEach(data => {
        this.jobCertificateList.push(new JobBidCertificateDTO(data));
      });
      this.applyJobDto.jobBidCertificates = this.jobCertificateList;
    }
    this.jobBidScreeningList.length = 0;

    this.jobBidScreeningQuestions.length = 0;
    this.myForm.value.screeningQuestionAnswer.forEach(element => {
      this.jobBidScreeningList.push(element.questionNo);
      this.jobBidScreeningList.push(element.question);
      this.jobScreeningQuestion = new JobScreeningQuestionDTO(element.id, element.questionNo, element.question);
      this.jobBidScreeningQuestions.push(new JobBidScreeningQuestionDTO(this.jobScreeningQuestion, element.answer));

    });

    this.applyJobDto.jobBidScreeningQuestions = this.jobBidScreeningQuestions;
    this.jobBidService.applyJob(this.applyJobDto).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('applied.for.job'), '');
        this.submitted = false;
        this.router.navigate([PATH_CONSTANTS.WOKER_JOB_LISTING]);
      }
      else {
        if (data.errorCode.length > 6) {
          this.notificationService.error(data.errorCode, '');
        } else {
          this.notificationService.error(data.message, '');
        }

      }

    }, error => {
      this.notificationService.error(this.translator.instant('common.error'), '');
    });
  }
  patchForm(bidData): void {
    this.screeningQuestionAnswers.length = 0;
    if (bidData.jobBidDetail.workerTentativeStartDate) {
      this.date = bidData.jobBidDetail.workerTentativeStartDate;
    }
    else {
      this.date = null;
    }
    if (bidData.jobBidDetail.workerHourlyRate) {
      this.myForm.get('workerHourlyRate').patchValue(bidData.jobBidDetail.workerHourlyRate);
    }
    if (bidData.jobBidDetail.workerAnnualSalary) {
      this.myForm.get('workerAnnualSalary').patchValue(bidData.jobBidDetail.workerAnnualSalary);
    }
    this.myForm.controls.workerTentativeStartDate.patchValue(new Date(bidData.jobBidDetail.workerTentativeStartDate));
    this.myForm.controls.workerSpecialNote.patchValue(bidData.jobBidDetail.workerSpecialNote);
    this.myForm.controls.certificate.patchValue(bidData.jobBidCertificates);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < bidData.jobBidScreeningQuestion.length; i++) {
      this.screeningQuestionAnswers.push({
        id: bidData.jobBidScreeningQuestion[i].question.id,
        questionNo: bidData.jobBidScreeningQuestion[i].question.questionNo,
        question: bidData.jobBidScreeningQuestion[i].question.question,
        answer: bidData.jobBidScreeningQuestion[i].answer
      });
    }
    this.screeningQuestionAnswers.sort(function (a, b) { return a.questionNo - b.questionNo; });
    this.myForm.controls.screeningQuestionAnswer.patchValue(this.screeningQuestionAnswers);


  }
}
