import { MapsAPILoader } from '@agm/core';
import { DatePipe } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { Certificate } from 'src/app/module/admin/certificate/certificate';
import { PostJobServiceService } from 'src/app/post-job-service.service';
import { CertificateService } from 'src/app/service/admin-services/certificate/certificate.service';
import { CityService } from 'src/app/service/admin-services/city/city.service';
import { ExperienceLevelService } from 'src/app/service/admin-services/experience/experience.service';
import { JobTitleService } from 'src/app/service/admin-services/job-title/job-title.service';
import { RegionService } from 'src/app/service/admin-services/region/region.service';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { City } from 'src/app/shared/vo/city/city';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { Region } from 'src/app/shared/vo/region/region';
import { State } from 'src/app/shared/vo/state/state';
import { JobCertificate } from '../../Vos/JobCertificateModel';
import { JobDTO } from '../../Vos/JobDTO';
import { JobScreeningQuestionDTO } from '../../Vos/JobScreeningQuestionsModel';
import { JobDetails } from '../job-details';

@Component({
  selector: 'app-job-details',
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css'],
  providers: [DatePipe]

})
export class JobDetailsComponent implements OnInit {
  /*
  @author Vinita Jagwani
  */
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  blockSomeSpecial: RegExp = COMMON_CONSTANTS.blockSomeSpecial;
  jobDetailsForm: FormGroup;
  dateTime = new Date();
  datatableParam: DataTableParam;
  filterCertificateLength;
  queryParam;
  arrayControl;
  certificates;
  certificateArray;
  certificateData;
  tempData = [];
  filteredCertificates: any[];
  filteredCity: any[];
  filteredState: any[];
  filteredRegion: any[];
  filteredExperience: any[];
  filteredJobTitle: any[];
  addedCertificate: any[] = [];
  form;
  id;
  date = new Date();
  editDate;
  submitted = false;
  editable = false;
  screeningQuestions: any[] = [{ questionNo: 1, question: '' }];
  experienceData;
  selectedCertificates: Certificate[];
  selectedCerti = [];
  selectedExperience: any[];
  certi;
  editableTitle = false;
  editableName = false;
  editableDescription = false;
  editableSpecialQualification = false;
  editableJobOpening = false;
  editableExperience = false;
  editableEstimatedStartDate = false;
  editableCity = false;
  editableRegion = false;
  editableState = false;
  editableZipCode = false;
  editableCertificates = false;
  editableAddress = false;
  editablJobTitle = false;
  questions;
  myForm: FormGroup;
  addedQuestion = [];
  certificate1: Certificate;
  jobCertificate: JobCertificate;
  jobDTO: JobDTO;
  jobCertificateList = [];
  city: City[];
  state: State[];
  region: Region[];
  zoom: number;
  cityModel;
  regionModel;
  stateModel;
  cityList = [];
  stateList = [];
  regionList = [];
  experienceList = [];
  isCityPresentInAdmin = false;
  isRegionPresentInAdmin = false;
  isStatePresentInAdmin = false;
  geoCoder;
  selecteJobTitle: any[];
  jobTitleData;
  jobTitleList = [];

  filterMap = new Map();
  @ViewChild('search')
  public searchElementRef: ElementRef;
  @Input() reviewForm: any;
  @Output() submittedJobDetails = new EventEmitter<any>();
  @Output() submitChangedReviewForm = new EventEmitter<any>();
  jobScreeningQuestion: JobScreeningQuestionDTO;
  certificateDialog = false;
  submittedCertificate = false;
  loginUserId;
  certificate: any;
  temp: boolean;
  jobDetail: JobDetails;
  editJobId: any;
  editCertificates = [];
  editScreeningQuestions = [];
  editJob: any;
  length: number;
  flagCerti: boolean;
  filteredData = [];
  noOfOpenings: any;
  questionFlag = false;
  dataScreening = [];
  dataScreeningFlag = false;
  screeningFieldEmpty = false;
  jobId: any;
  jobType: string;
  datatableParamExperience = new DataTableParam();
  datatableParamCity = new DataTableParam();
  datatableParamRegion = new DataTableParam();
  datatableParamState = new DataTableParam();
  datatableParamCertificate = new DataTableParam();
  datatableParamJobTitle = new DataTableParam();
  submittedJobTitle: boolean;
  myJobTitleForm: FormGroup;
  jobTitleDialog;
  noSaveButton: boolean;
  cityParams: { name: any; };
  stateParams: { name: any; };
  isCreateJob = false;

  constructor(
    private postJobService: PostJobServiceService,
    private experienceService: ExperienceLevelService,
    private certificateService: CertificateService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private cityService: CityService,
    private regionService: RegionService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private localStorageService: LocalStorageService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private jobService: JobDetailService,
    private router: Router,
    private JobTitleService: JobTitleService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private jobDetailService: JobDetailService,
    private confirmDialogService: ConfirmDialogueService) {
    this.dateTime.setDate(this.dateTime.getDate());
    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 20000,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };
    const currenturl = this.router.url;
    if (currenturl === '/client/edit-job') {
      this.jobService.editJobSubject.next(this.localStorageService.getItem('editSelectedJob'));
    }
    if (currenturl === '/client/edit-job') {
      this.jobService.editJobSubject.subscribe(e => {
        if (e.status === 'POSTED') {
          this.noSaveButton = true;
        }
        else {
          this.noSaveButton = false;
        }
        this.editJob = e;
        this.editJobId = e.id;
        this.localStorageService.setItem('editJobId', this.editJobId);
        this.patchEditForm(this.editJobId);
      });
    }
    else {
      this.editJobId = null;
    }
    if (!this.editJobId) {
      this.postJobService.jobSubjectForPay.subscribe(data => {
        this.patchEditForm(data.id);
      });
    }
    this.isCreateJob = this.router.url.includes('/client/post-job') ? true : false;

  }
  ngOnInit(): void {
    this.getRegionList();
    this.getCertificateList();
    this.getExperienceList();
    this.getJobTitleList();
    this.initializeJobTitleForm();
    this.initializeJobDetailsForm();
    this.initializeCertificateForm();
    this.getLocation();
    this.postJobService.initializeJobDetailsForm();
    this.checkScreeningQuestionEmpty();
    if (this.reviewForm) {
      this.jobDetailsForm.valueChanges.subscribe(value => {
        this.submitChangedReviewForm.emit(this.jobDetailsForm);
      });
    }
    this.loginUserId = this.localStorageService.getLoginUserId();
  }

  checkScreeningQuestionEmpty(): void {
    if (this.jobDetailsForm.value.screeningQuestions.length === 0) {
      this.screeningFieldEmpty = true;
    }

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
  addScreeningQuestion(): void {

    const lengthOfArray = (this.jobDetailsForm.get('screeningQuestions') as FormArray).length;
    const temp = lengthOfArray - 1;

    if (lengthOfArray < 10) {
      (this.jobDetailsForm.get('screeningQuestions') as FormArray).push(
        new FormGroup({
          question: new FormControl(null),
          questionNo: new FormControl()
        })
      );
    }
  }
  filterExperience(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.experienceData.length; i++) {
      const client = this.experienceData[i];
      if (client.level.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(client);
      }
    }
    this.filteredExperience = filtered;
  }
  filterRegion(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.regionList.length; i++) {
      const client = this.regionList[i];
      if (client.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(client);
      }
    }
    this.filteredRegion = filtered;
  }
  filterJobTitle(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.jobTitleData.length; i++) {
      const jobTitle = this.jobTitleData[i];
      if (jobTitle.title.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
        filtered.push(jobTitle);
      }
    }
    this.filteredJobTitle = filtered;
    let JobTitle = { 'id': 'buttonIdTitle' };
    this.filteredJobTitle.push(JobTitle);
  }
  removeScreeningQuestion(index: number): void {
    (this.jobDetailsForm.get('screeningQuestions') as FormArray).removeAt(index);
  }

  submitJobDetails(): boolean {
    this.submitted = true;
    if (!this.jobDetailsForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.jobDetailsForm.controls) {
        this.jobDetailsForm.controls[controlName].markAsDirty();
        this.jobDetailsForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = true;
      return false;
    }
    this.jobDetailsForm.get('certificates').patchValue(this.jobDetailsForm.value.certificates);
    const lengthOfArray = (this.jobDetailsForm.get('screeningQuestions') as FormArray).length;
    for (let i = 0; i < lengthOfArray; i++) {
      if (this.jobDetailsForm.value.screeningQuestions[i].question === '') {
        this.jobDetailsForm.value.screeningQuestions[i].question = null;
        this.jobDetailsForm.value.screeningQuestions[i].questionNo = null;

      } else {
      }
    }
    if (this.validateLengthForSingleWorkType(this.jobDetailsForm.get('description').value)) {
      if (this.jobDetailsForm.value.jobTitle) {
        this.postJobService.jobDetailsForm.get('jobDetail.jobTitle').setValue(this.jobDetailsForm.value.jobTitle);
      }
      else {
        this.postJobService.jobDetailsForm.get('jobDetail.jobTitle').setValue(null);
      }
      this.postJobService.jobDetailsForm.get('jobDetail.title').setValue(this.jobDetailsForm.value.title);
      this.postJobService.jobDetailsForm.get('jobDetail.description').setValue(this.jobDetailsForm.value.description);
      this.postJobService.jobDetailsForm.get('jobDetail.specialQualification').setValue(this.jobDetailsForm.value.specialQualification);
      this.postJobService.jobDetailsForm.get('jobDetail.noOfOpeningJob').setValue(this.jobDetailsForm.value.noOfOpeningJob);
      this.selectedExperience = this.jobDetailsForm.value.experience;
      this.postJobService.jobDetailsForm.get('jobDetail.experience').setValue(this.jobDetailsForm.value.experience);
      this.date = this.jobDetailsForm.value.estimatedStartDate;
      this.postJobService.jobDetailsForm.get('jobDetail.estimatedStartDate').setValue(this.date);
      this.postJobService.jobDetailsForm.get('jobDetail.zipCode').setValue(this.jobDetailsForm.value.zipCode);
      this.postJobService.jobDetailsForm.get('jobDetail.state').setValue(this.jobDetailsForm.value.state);
      this.postJobService.jobDetailsForm.get('jobDetail.region').setValue(this.jobDetailsForm.value.region);
      this.postJobService.jobDetailsForm.get('jobDetail.location').setValue(this.jobDetailsForm.value.location);
      this.postJobService.jobDetailsForm.get('jobDetail.latitude').setValue(this.jobDetailsForm.value.latitude);
      this.postJobService.jobDetailsForm.get('jobDetail.longitude').setValue(this.jobDetailsForm.value.longitude);
      if (this.editJobId) {
        this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateFrom').setValue(
          this.editJob.hourlyRateFrom);
        this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateTo').setValue(
          this.editJob.hourlyRateTo);
        this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryFrom').setValue(
          this.editJob.annualSalaryFrom);
        this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryTo').setValue(
          this.editJob.annualSalaryTo);
        this.screeningQuestions = this.jobDetailsForm.value.screeningQuestions;
        this.postJobService.jobDetailsForm.get('jobDetail.employmentType').setValue(
          this.editJob.employmentType);
        this.postJobService.jobDetailsForm.get('jobDetail.isPayForMilage').setValue(
          this.editJob.isPayForMilage);
        this.postJobService.jobDetailsForm.get('jobDetail.isPerDiem').setValue(
          this.editJob.isPerDiem);
        this.postJobService.jobDetailsForm.get('jobDetail.perDiemRate').setValue(
          this.editJob.perDiemRate);
        this.postJobService.jobDetailsForm.get('jobDetail.milageRate').setValue(
          this.editJob.milageRate);
        this.postJobService.jobDetailsForm.get('jobDetail.minimumMile').setValue(
          this.editJob.minimumMile);
        this.postJobService.jobDetailsForm.get('jobDetail.is401KRetirement').setValue(
          this.editJob.is401KRetirement);
        this.postJobService.jobDetailsForm.get('jobDetail.isHealthBenifit').setValue(
          this.editJob.isHealthBenifit);
        this.postJobService.jobDetailsForm.get('jobDetail.isRelocationBenifit').setValue(
          this.editJob.isRelocationBenifit);
        this.postJobService.jobDetailsForm.get('jobDetail.isYearlyBonus').setValue(
          this.editJob.isYearlyBonus);
      }
      this.screeningQuestions = this.jobDetailsForm.value.screeningQuestions;

      for (let i = 0; i < this.screeningQuestions.length; i++) {
        this.screeningQuestions[i].questionNo = i + 1;
        this.postJobService.jobDetailsForm.value.screeningQuestions[i] = this.screeningQuestions[i];
      }
      this.jobCertificateList.length = 0;
      this.selectedCertificates = this.jobDetailsForm.value.certificates;
      if (this.selectedCertificates) {
        this.selectedCertificates.forEach(data => {
          this.jobCertificateList.push(new JobCertificate(data));
        });
      }
      this.postJobService.jobDetailsForm.get('certificates').setValue(this.jobCertificateList);

      this.postJobService.jobDetailsForm.get('jobDetail.status').setValue('DRAFT');
      if (this.jobDetailsForm.value.city === null) {
      }
      else {
        this.postJobService.jobDetailsForm.get('jobDetail.city').setValue(this.jobDetailsForm.value.city);

      }
      if (this.localStorageService.getItem('jobId')) {
        this.jobId = this.localStorageService.getItem('jobId');
      }
      if (this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').value !== null || this.editJobId || this.jobId) {
        if (this.editJobId) {
          this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.editJobId);
        } else if (this.postJobService.postJobDetails.jobDetails.id) {
          this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.postJobService.postJobDetails.jobDetails.id);
        }
        else {
          this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.localStorageService.getItem('jobId'));

        }
        if (this.jobDetailsForm.value.jobTitle) {
          this.postJobService.jobDetailsForm.get('jobDetail.jobTitle').setValue(this.jobDetailsForm.value.jobTitle);
        }
        else {
          this.postJobService.jobDetailsForm.get('jobDetail.jobTitle').setValue(null);

        }
        this.postJobService.jobDetailsForm.get('jobDetail.title').setValue(this.jobDetailsForm.value.title);
        this.postJobService.jobDetailsForm.get('jobDetail.description').setValue(this.jobDetailsForm.value.description);
        this.postJobService.jobDetailsForm.get('jobDetail.specialQualification').setValue(this.jobDetailsForm.value.specialQualification);
        this.postJobService.jobDetailsForm.get('jobDetail.noOfOpeningJob').setValue(this.jobDetailsForm.value.noOfOpeningJob);
        this.selectedExperience = this.jobDetailsForm.value.experience;
        this.postJobService.jobDetailsForm.get('jobDetail.experience').setValue(this.jobDetailsForm.value.experience);
        this.date = this.jobDetailsForm.value.estimatedStartDate;
        this.postJobService.jobDetailsForm.get('jobDetail.estimatedStartDate').setValue(this.date);
        this.postJobService.jobDetailsForm.get('jobDetail.zipCode').setValue(this.jobDetailsForm.value.zipCode);
        this.postJobService.jobDetailsForm.get('jobDetail.state').setValue(this.jobDetailsForm.value.state);
        this.postJobService.jobDetailsForm.get('jobDetail.region').setValue(this.jobDetailsForm.value.region);
        this.postJobService.jobDetailsForm.get('jobDetail.location').setValue(this.jobDetailsForm.value.location);
        this.postJobService.jobDetailsForm.get('jobDetail.latitude').setValue(this.jobDetailsForm.value.latitude);
        this.postJobService.jobDetailsForm.get('jobDetail.longitude').setValue(this.jobDetailsForm.value.longitude);
        if (this.postJobService.postJobDetails.payDetails) {
          if (this.postJobService.postJobDetails.payDetails.jobType === 'OPEN_MARKET_REQUEST') {
            this.jobType = 'OPEN_MARKET_REQUEST';
          }
          else {
            this.jobType = 'PRIVATE_REQUEST';
          }
        }
        for (let i = 0; i < this.screeningQuestions.length; i++) {
          this.screeningQuestions[i].questionNo = i + 1;
          this.postJobService.jobDetailsForm.value.screeningQuestions[i] = this.screeningQuestions[i];
        }
        if (this.editJobId && this.editCertificates.length !== 0 &&
          (this.selectedCertificates.length === 0 || this.selectedCertificates === undefined)) {
          this.jobCertificateList.length = 0;
          this.editCertificates.forEach(data => {
            this.jobCertificateList.push(new JobCertificate(data.certificate));
          });
        }
        else {
          this.jobCertificateList.length = 0;
          this.selectedCertificates = this.jobDetailsForm.value.certificates;
          if (this.selectedCertificates) {
            this.selectedCertificates.forEach(data => {
              this.jobCertificateList.push(new JobCertificate(data));
            });
          }
        }
        this.postJobService.jobDetailsForm.get('certificates').setValue(this.jobCertificateList);

        this.postJobService.jobDetailsForm.get('jobDetail.status').setValue('DRAFT');
        this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue(1);
        if (this.jobDetailsForm.value.city === null) {
        }
        else {
          this.postJobService.jobDetailsForm.get('jobDetail.city').setValue(this.jobDetailsForm.value.city);

        }
        if (this.editJobId) {
          this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateFrom').setValue(
            this.editJob.hourlyRateFrom);
          this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateTo').setValue(
            this.editJob.hourlyRateTo);
          this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryFrom').setValue(
            this.editJob.annualSalaryFrom);
          this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryTo').setValue(
            this.editJob.annualSalaryTo);
          this.screeningQuestions = this.jobDetailsForm.value.screeningQuestions;
          this.postJobService.jobDetailsForm.get('jobDetail.employmentType').setValue(
            this.editJob.employmentType);
          this.postJobService.jobDetailsForm.get('jobDetail.isPayForMilage').setValue(
            this.editJob.isPayForMilage);
          this.postJobService.jobDetailsForm.get('jobDetail.isPerDiem').setValue(
            this.editJob.isPerDiem);
          this.postJobService.jobDetailsForm.get('jobDetail.perDiemRate').setValue(
            this.editJob.perDiemRate);
          this.postJobService.jobDetailsForm.get('jobDetail.milageRate').setValue(
            this.editJob.milageRate);
          this.postJobService.jobDetailsForm.get('jobDetail.minimumMile').setValue(
            this.editJob.minimumMile);
          this.postJobService.jobDetailsForm.get('jobDetail.is401KRetirement').setValue(
            this.editJob.is401KRetirement);
          this.postJobService.jobDetailsForm.get('jobDetail.isHealthBenifit').setValue(
            this.editJob.isHealthBenifit);
          this.postJobService.jobDetailsForm.get('jobDetail.isRelocationBenifit').setValue(
            this.editJob.isRelocationBenifit);
          this.postJobService.jobDetailsForm.get('jobDetail.isYearlyBonus').setValue(
            this.editJob.isYearlyBonus);
          if (this.editJob.jobType === 'OPEN_MARKET_REQUEST') {
            this.jobType = 'OPEN_MARKET_REQUEST';
          }
          else {
            this.jobType = 'PRIVATE_REQUEST';
          }
          this.postJobService.jobDetailsForm.get('jobDetail.jobType').setValue(this.jobType);
        }
        if (this.localStorageService.getItem('job') && !this.editJobId) {
          const jobDetail = this.localStorageService.getItem('job');
          this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateFrom').setValue(
            jobDetail.hourlyRateFrom);
          this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateTo').setValue(
            jobDetail.hourlyRateTo);
          this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryFrom').setValue(
            jobDetail.annualSalaryFrom);
          this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryTo').setValue(
            jobDetail.annualSalaryTo);
          this.screeningQuestions = this.jobDetailsForm.value.screeningQuestions;
          this.postJobService.jobDetailsForm.get('jobDetail.employmentType').setValue(
            jobDetail.employmentType);
          this.postJobService.jobDetailsForm.get('jobDetail.isPayForMilage').setValue(
            jobDetail.isPayForMilage);
          this.postJobService.jobDetailsForm.get('jobDetail.isPerDiem').setValue(
            jobDetail.isPerDiem);
          this.postJobService.jobDetailsForm.get('jobDetail.perDiemRate').setValue(
            jobDetail.perDiemRate);
          this.postJobService.jobDetailsForm.get('jobDetail.milageRate').setValue(
            jobDetail.milageRate);
          this.postJobService.jobDetailsForm.get('jobDetail.minimumMile').setValue(
            jobDetail.minimumMile);
          this.postJobService.jobDetailsForm.get('jobDetail.is401KRetirement').setValue(
            jobDetail.is401KRetirement);
          this.postJobService.jobDetailsForm.get('jobDetail.isHealthBenifit').setValue(
            jobDetail.isHealthBenifit);
          this.postJobService.jobDetailsForm.get('jobDetail.isRelocationBenifit').setValue(
            jobDetail.isRelocationBenifit);
          this.postJobService.jobDetailsForm.get('jobDetail.isYearlyBonus').setValue(
            jobDetail.isYearlyBonus);
          if (jobDetail.jobType === 'OPEN_MARKET_REQUEST') {
            this.jobType = 'OPEN_MARKET_REQUEST';
          }
          else {
            this.jobType = 'PRIVATE_REQUEST';
          }
          this.postJobService.jobDetailsForm.get('jobDetail.jobType').setValue(this.jobType);
        }
        this.postJobService.updateJob(JSON.stringify(this.postJobService.jobDetailsForm.value)).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue(1);
            this.localStorageService.setItem('job', data.data.jobDetail);
            this.localStorageService.setItem('jobId', data.data.jobDetail.id);
            this.submittedJobDetails.emit(this.jobDetailsForm.value);
            this.jobDetail = data.data.jobDetail;
            this.projectJobSelectionService.addJobSubject.next(this.jobDetail);
          }
          else {
            this.notificationService.error(data.message, '');
          }
        });
      }
      else {
        this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue(1);
        this.postJobService.postJob(JSON.stringify(this.postJobService.jobDetailsForm.value)).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.jobDetail = data.data.jobDetail;
            this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue(1);
            this.localStorageService.setItem('job', data.data.jobDetail);
            this.localStorageService.setItem('jobId', data.data.jobDetail.id);
            this.projectJobSelectionService.addJobSubject.next(this.jobDetail);
            this.submittedJobDetails.emit(this.jobDetailsForm.value);
            this.jobDetailsForm.value.id = data.data.jobDetail.id;
            this.projectJobSelectionService.addJobSubject.next(this.jobDetail);
            this.submitted = false;
          }
          else {
            this.notificationService.error(data.message, '');
          }
        },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          }
        );
        this.postJobService.saveJobDetailsAsDraft(this.jobDetailsForm.value);
        this.submitted = false;
      }
    }

    if (this.validateLengthForSingleWorkType(this.jobDetailsForm.get('description').value)) {
    }
  }
  reinitializeScreeningQuestions() {
    const screeningQuestions = new FormArray([]);
    if (!this.reviewForm) {
      screeningQuestions.push(new FormGroup({
        question: new FormControl(),
        questionNo: new FormControl()
      }));
    }
  }
  getAddressFromAutocompleteMapsApi(event): void {
    this.cityModel = event.get('LOCALITY');
    this.stateModel = event.get('STATE');
    this.regionModel = event.get('REGION');

    this.jobDetailsForm.get('city').setValue(event.get('LOCALITY'));
    this.jobDetailsForm.get('state').setValue(event.get('STATE'));
    this.jobDetailsForm.get('region').setValue(event.get('REGION'));
    this.jobDetailsForm.get('zipCode').setValue(event.get('ZIPCODE'));
    this.jobDetailsForm.get('location').setValue(event.get('ADDRESS'));
    this.jobDetailsForm.get('latitude').setValue(event.get('LATITUDE'));
    this.jobDetailsForm.get('longitude').setValue(event.get('LONGITUDE'));

  }
  saveDraft(): boolean {
    if (!this.jobDetailsForm.get('title').valid) {
      this.jobDetailsForm.get('title').markAsTouched();
      this.jobDetailsForm.get('title').markAsDirty();
      return false;
    }
    if (this.jobDetailsForm.get('zipCode').value && this.jobDetailsForm.get('zipCode').errors) {
      if (this.jobDetailsForm.get('zipCode').errors.maxlength) {
        this.notificationService.error(this.translator.instant('zip.code.should.be.less.than.6'), '');
        return false;
      }
    }
    if (this.validateLengthForSingleWorkType(this.jobDetailsForm.get('description').value)) {
      if (this.jobDetailsForm.value.jobTitle) {
        this.postJobService.jobDetailsForm.get('jobDetail.jobTitle').setValue(this.jobDetailsForm.value.jobTitle);
      }
      else {
        this.postJobService.jobDetailsForm.get('jobDetail.jobTitle').setValue(null);
      }
      this.postJobService.jobDetailsForm.get('jobDetail.title').setValue(this.jobDetailsForm.value.title);
      this.postJobService.jobDetailsForm.get('jobDetail.description').setValue(this.jobDetailsForm.value.description);
      this.postJobService.jobDetailsForm.get('jobDetail.specialQualification').setValue(this.jobDetailsForm.value.specialQualification);
      this.postJobService.jobDetailsForm.get('jobDetail.noOfOpeningJob').setValue(this.jobDetailsForm.value.noOfOpeningJob);
      this.selectedExperience = this.jobDetailsForm.value.experience;
      this.postJobService.jobDetailsForm.get('jobDetail.experience').setValue(this.jobDetailsForm.value.experience);
      this.date = this.jobDetailsForm.value.estimatedStartDate;
      this.postJobService.jobDetailsForm.get('jobDetail.estimatedStartDate').setValue(this.date);
      this.postJobService.jobDetailsForm.get('jobDetail.zipCode').setValue(this.jobDetailsForm.value.zipCode);
      this.postJobService.jobDetailsForm.get('jobDetail.state').setValue(this.jobDetailsForm.value.state);
      this.postJobService.jobDetailsForm.get('jobDetail.region').setValue(this.jobDetailsForm.value.region);
      this.postJobService.jobDetailsForm.get('jobDetail.location').setValue(this.jobDetailsForm.value.location);
      this.postJobService.jobDetailsForm.get('jobDetail.latitude').setValue(this.jobDetailsForm.value.latitude);
      this.postJobService.jobDetailsForm.get('jobDetail.longitude').setValue(this.jobDetailsForm.value.longitude);
      if (this.editJobId) {
        this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateFrom').setValue(
          this.editJob.hourlyRateFrom);
        this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateTo').setValue(
          this.editJob.hourlyRateTo);
        this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryFrom').setValue(
          this.editJob.annualSalaryFrom);
        this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryTo').setValue(
          this.editJob.annualSalaryTo);
        this.screeningQuestions = this.jobDetailsForm.value.screeningQuestions;
        this.postJobService.jobDetailsForm.get('jobDetail.employmentType').setValue(
          this.editJob.employmentType);
        this.postJobService.jobDetailsForm.get('jobDetail.isPayForMilage').setValue(
          this.editJob.isPayForMilage);
        this.postJobService.jobDetailsForm.get('jobDetail.isPerDiem').setValue(
          this.editJob.isPerDiem);
        this.postJobService.jobDetailsForm.get('jobDetail.perDiemRate').setValue(
          this.editJob.perDiemRate);
        this.postJobService.jobDetailsForm.get('jobDetail.milageRate').setValue(
          this.editJob.milageRate);
        this.postJobService.jobDetailsForm.get('jobDetail.minimumMile').setValue(
          this.editJob.minimumMile);
        this.postJobService.jobDetailsForm.get('jobDetail.is401KRetirement').setValue(
          this.editJob.is401KRetirement);
        this.postJobService.jobDetailsForm.get('jobDetail.isHealthBenifit').setValue(
          this.editJob.isHealthBenifit);
        this.postJobService.jobDetailsForm.get('jobDetail.isRelocationBenifit').setValue(
          this.editJob.isRelocationBenifit);
        this.postJobService.jobDetailsForm.get('jobDetail.isYearlyBonus').setValue(
          this.editJob.isYearlyBonus);
        if (this.editJob.jobType === 'OPEN_MARKET_REQUEST') {
          this.jobType = 'OPEN_MARKET_REQUEST';
        }
        else {
          this.jobType = 'PRIVATE_REQUEST';
        }
        this.postJobService.jobDetailsForm.get('jobDetail.jobType').setValue(this.jobType);
      }
      if (this.localStorageService.getItem('job') && !this.editJobId) {

        const jobDetail = this.localStorageService.getItem('job');
        this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateFrom').setValue(
          jobDetail.hourlyRateFrom);
        this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateTo').setValue(
          jobDetail.hourlyRateTo);
        this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryFrom').setValue(
          jobDetail.annualSalaryFrom);
        this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryTo').setValue(
          jobDetail.annualSalaryTo);
        this.screeningQuestions = this.jobDetailsForm.value.screeningQuestions;
        this.postJobService.jobDetailsForm.get('jobDetail.employmentType').setValue(
          jobDetail.employmentType);
        this.postJobService.jobDetailsForm.get('jobDetail.isPayForMilage').setValue(
          jobDetail.isPayForMilage);
        this.postJobService.jobDetailsForm.get('jobDetail.isPerDiem').setValue(
          jobDetail.isPerDiem);
        this.postJobService.jobDetailsForm.get('jobDetail.perDiemRate').setValue(
          jobDetail.perDiemRate);
        this.postJobService.jobDetailsForm.get('jobDetail.milageRate').setValue(
          jobDetail.milageRate);
        this.postJobService.jobDetailsForm.get('jobDetail.minimumMile').setValue(
          jobDetail.minimumMile);
        this.postJobService.jobDetailsForm.get('jobDetail.is401KRetirement').setValue(
          jobDetail.is401KRetirement);
        this.postJobService.jobDetailsForm.get('jobDetail.isHealthBenifit').setValue(
          jobDetail.isHealthBenifit);
        this.postJobService.jobDetailsForm.get('jobDetail.isRelocationBenifit').setValue(
          jobDetail.isRelocationBenifit);
        this.postJobService.jobDetailsForm.get('jobDetail.isYearlyBonus').setValue(
          jobDetail.isYearlyBonus);
        if (jobDetail.jobType === 'OPEN_MARKET_REQUEST') {
          this.jobType = 'OPEN_MARKET_REQUEST';
        }
        else {
          this.jobType = 'PRIVATE_REQUEST';
        }
        this.postJobService.jobDetailsForm.get('jobDetail.jobType').setValue(this.jobType);
      }
      this.screeningQuestions = this.jobDetailsForm.value.screeningQuestions;
      for (let i = 0; i < this.screeningQuestions.length; i++) {
        this.screeningQuestions[i].questionNo = i + 1;
        this.postJobService.jobDetailsForm.value.screeningQuestions[i] = this.screeningQuestions[i];
      }
      this.jobCertificateList.length = 0;
      this.selectedCertificates = this.jobDetailsForm.value.certificates;
      if (this.selectedCertificates) {
        this.selectedCertificates.forEach(data => {
          this.jobCertificateList.push(new JobCertificate(data));
        });
      }
      this.postJobService.jobDetailsForm.get('certificates').setValue(this.jobCertificateList);
      this.postJobService.jobDetailsForm.get('jobDetail.status').setValue('DRAFT');
      if (this.jobDetailsForm.value.city === null) {
      }
      else {
        this.postJobService.jobDetailsForm.get('jobDetail.city').setValue(this.jobDetailsForm.value.city);

      }
      if (this.localStorageService.getItem('jobId')) {
        this.jobId = this.localStorageService.getItem('jobId');
      }
      if (this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').value !== null || this.editJobId || this.jobId) {
        if (this.editJobId) {
          this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.editJobId);
        } else if (this.postJobService.postJobDetails.jobDetails.id) {
          this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.postJobService.postJobDetails.jobDetails.id);
        }
        else {
          this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.localStorageService.getItem('jobId'));

        }
        if (this.jobDetailsForm.value.jobTitle) {
          this.postJobService.jobDetailsForm.get('jobDetail.jobTitle').setValue(this.jobDetailsForm.value.jobTitle);
        }
        else {
          this.postJobService.jobDetailsForm.get('jobDetail.jobTitle').setValue(null);

        }
        this.postJobService.jobDetailsForm.get('jobDetail.title').setValue(this.jobDetailsForm.value.title);
        this.postJobService.jobDetailsForm.get('jobDetail.description').setValue(this.jobDetailsForm.value.description);
        this.postJobService.jobDetailsForm.get('jobDetail.specialQualification').setValue(this.jobDetailsForm.value.specialQualification);
        this.postJobService.jobDetailsForm.get('jobDetail.noOfOpeningJob').setValue(this.jobDetailsForm.value.noOfOpeningJob);
        this.selectedExperience = this.jobDetailsForm.value.experience;
        this.postJobService.jobDetailsForm.get('jobDetail.experience').setValue(this.jobDetailsForm.value.experience);
        this.date = this.jobDetailsForm.value.estimatedStartDate;
        this.postJobService.jobDetailsForm.get('jobDetail.estimatedStartDate').setValue(this.date);
        this.postJobService.jobDetailsForm.get('jobDetail.zipCode').setValue(this.jobDetailsForm.value.zipCode);
        this.postJobService.jobDetailsForm.get('jobDetail.state').setValue(this.jobDetailsForm.value.state);
        this.postJobService.jobDetailsForm.get('jobDetail.region').setValue(this.jobDetailsForm.value.region);
        this.postJobService.jobDetailsForm.get('jobDetail.location').setValue(this.jobDetailsForm.value.location);
        this.postJobService.jobDetailsForm.get('jobDetail.latitude').setValue(this.jobDetailsForm.value.latitude);
        this.postJobService.jobDetailsForm.get('jobDetail.longitude').setValue(this.jobDetailsForm.value.longitude);
        if (this.postJobService.postJobDetails.payDetails) {
          if (this.postJobService.postJobDetails.payDetails.jobType === true) {
            this.jobType = 'OPEN_MARKET_REQUEST';
          }
          else {
            this.jobType = 'PRIVATE_REQUEST';
          }
        }

        for (let i = 0; i < this.screeningQuestions.length; i++) {
          this.screeningQuestions[i].questionNo = i + 1;
          this.postJobService.jobDetailsForm.value.screeningQuestions[i] = this.screeningQuestions[i];
        }
        if (this.editJobId && this.editCertificates.length !== 0 &&
          (this.selectedCertificates.length === 0 || this.selectedCertificates === undefined)) {
          this.jobCertificateList.length = 0;
          this.editCertificates.forEach(data => {
            this.jobCertificateList.push(new JobCertificate(data.certificate));
          });
        }
        else {
          this.jobCertificateList.length = 0;
          this.selectedCertificates = this.jobDetailsForm.value.certificates;
          if (this.selectedCertificates) {
            this.selectedCertificates.forEach(data => {
              this.jobCertificateList.push(new JobCertificate(data));
            });
          }
        }
        this.postJobService.jobDetailsForm.get('certificates').setValue(this.jobCertificateList);
        this.postJobService.jobDetailsForm.get('jobDetail.status').setValue('DRAFT');

        this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue(1);
        if (this.jobDetailsForm.value.city === null) {
        }
        else {
          this.postJobService.jobDetailsForm.get('jobDetail.city').setValue(this.jobDetailsForm.value.city);

        }
        this.postJobService.updateJob(JSON.stringify(this.postJobService.jobDetailsForm.value)).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue(1);
            this.notificationService.success(this.translator.instant('jobdetail.saved.as.draft'), '');
            this.localStorageService.setItem('job', data.data.jobDetail);
            this.localStorageService.setItem('jobId', data.data.jobDetail.id);
            this.jobDetail = data.data.jobDetail;
            this.projectJobSelectionService.addJobSubject.next(this.jobDetail);
          }
          else {
            this.notificationService.error(data.message, '');
          }
        });
      }
      else {
        this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue(1);
        this.postJobService.postJob(JSON.stringify(this.postJobService.jobDetailsForm.value)).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.jobDetail = data.data.jobDetail;
            this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue(1);
            this.localStorageService.setItem('job', data.data.jobDetail);
            this.localStorageService.setItem('jobId', data.data.jobDetail.id);
            this.notificationService.success(this.translator.instant('jobdetail.saved.as.draft'), '');
            this.jobDetailsForm.value.id = data.data.jobDetail.id;
            this.projectJobSelectionService.addJobSubject.next(this.jobDetail);
            this.submitted = false;
          }
          else {
            this.notificationService.error(data.message, '');
          }
        },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          }
        );
        this.postJobService.saveJobDetailsAsDraft(this.jobDetailsForm.value);
        this.submitted = false;
      }
    }
  }

  validateLengthForSingleWorkType(description): boolean {
    if (this.returnLengthOfDescription(description) > 12500) {
      return false;
    }
    return true;
  }

  getExperienceList(): void {

    this.datatableParamExperience = {
      offset: 0,
      size: 20000,
      sortField: 'LEVEL',
      sortOrder: 1,
      searchText: '{"ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParamExperience);
    this.experienceService.getExperienceLevelList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.experienceData = data.data.result;
            // tslint:disable-next-line: no-shadowed-variable
            this.experienceData.forEach(data => {
              this.experienceList.push(data.level);
            });
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  getCityList(): void {

    this.datatableParamCity = {
      offset: 0,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: '{"ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParamCity);
    this.cityService.getCityList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.city = data.data.result;
            // tslint:disable-next-line: no-shadowed-variable
            this.city.forEach(data => {
              this.cityList.push(data.name);
            });
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  getRegionList(): void {

    this.datatableParamRegion = {
      offset: 0,
      size: 20000,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: '{"IS_ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParamRegion);
    this.regionService.getRegionList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.region = data.data.result;
            // tslint:disable-next-line: no-shadowed-variable
            this.region.forEach(data => {
              this.regionList.push(data.name);
            });
          }
        } else {
        }
      },
      error => {
      }
    );
  }
  private initializeJobDetailsForm(): void {

    const screeningQuestions = new FormArray([]);
    if (!this.reviewForm) {
      screeningQuestions.push(new FormGroup({
        question: new FormControl(),
        questionNo: new FormControl()
      }));
    }


    this.jobDetailsForm = this.formBuilder.group({
      id: [],
      jobTitle: ['', [CustomValidator.required, Validators.maxLength(50)]],
      title: ['', [CustomValidator.required, Validators.maxLength(50)]],
      description: ['', [CustomValidator.required, Validators.maxLength(12500)]],
      specialQualification: ['', [Validators.maxLength(12500)]],
      noOfOpeningJob: ['', [CustomValidator.required, Validators.maxLength(3)]],
      experience: [, CustomValidator.required],
      estimatedStartDate: new FormControl('', CustomValidator.required),
      location: new FormControl('', CustomValidator.required),
      latitude: [],
      longitude: [],
      city: new FormControl('', CustomValidator.required),
      zipCode: ['', [CustomValidator.required, Validators.maxLength(5)]],
      state: new FormControl('', CustomValidator.required),
      region: new FormControl('', CustomValidator.required),
      screeningQuestions,
      certificates: [null, Validators.required],


    });
    this.arrayControl = this.jobDetailsForm.get('screeningQuestions') as FormArray;

    if (this.reviewForm) {
      this.jobDetailsForm.get('title').setValue(this.reviewForm.title);
      this.jobDetailsForm.get('jobTitle').setValue(this.reviewForm.jobTitle);
      this.jobDetailsForm.get('description').setValue(this.reviewForm.description);
      this.jobDetailsForm.get('specialQualification').setValue(this.reviewForm.specialQualification);
      this.jobDetailsForm.get('estimatedStartDate').setValue(this.reviewForm.estimatedStartDate);
      this.jobDetailsForm.get('noOfOpeningJob').setValue(this.reviewForm.noOfOpeningJob);
      this.jobDetailsForm.get('experience').setValue(this.reviewForm.experience);
      this.jobDetailsForm.get('location').setValue(this.reviewForm.location);
      this.jobDetailsForm.get('city').setValue(this.reviewForm.city);
      this.jobDetailsForm.get('zipCode').setValue(this.reviewForm.zipCode);
      this.jobDetailsForm.get('state').setValue(this.reviewForm.state);
      this.jobDetailsForm.get('region').setValue(this.reviewForm.region);
      this.jobDetailsForm.get('certificates').setValue(this.reviewForm.certificates);
      this.jobDetailsForm.get('latitude').setValue(this.reviewForm.latitude);
      this.jobDetailsForm.get('longitude').setValue(this.reviewForm.longitude);
      for (const question of this.reviewForm.screeningQuestions) {
        if (question.question !== null) {
          (this.jobDetailsForm.get('screeningQuestions') as FormArray).push(
            new FormGroup({
              question: new FormControl(question.question),
              questionNo: new FormControl(question.questionNo)
            })
          );
        }
      }
    }
  }

  getCertificateList(): void {
    this.datatableParamCertificate = {
      offset: 0,
      size: 100000,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: '{"IS_ENABLE": true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParamCertificate);
    this.certificateData = this.certificateService.getCertificateList(this.queryParam).subscribe(data => {
      this.certificates = data.data?.result;
    });
  }
  filterCertificate(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.certificates.length; i++) {
      const certificate = this.certificates[i];
      if (certificate.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(certificate);
      }
    }

    this.temp = true;
    this.filteredCertificates = filtered;
    const certi = { id: 'buttonId' };
    this.filteredCertificates.push(certi);


  }
  onSelectCerti(event): void {
    const value = this.jobDetailsForm.get('certificates').value;
    for (let i = 0; i < value.length; i++) {
      if (value[i].id === 'buttonId') {
        value.splice(i, 1);
      }
    }
    if (event.id === 'buttonId') {
      this.certificateDialog = true;
    }
  }

  initializeCertificateForm(): void {
    this.myForm = this.formBuilder.group({
      name: [null, [CustomValidator.required, Validators.maxLength(50)]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isEnable: true
    });
  }
  openCertificateDialog(): void {
    this.submittedCertificate = false;
    this.certificateDialog = true;
    this.initializeCertificateForm();
  }
  hideDialog(): void {
    this.certificateDialog = false;
    this.submittedCertificate = false;
    this.initializeCertificateForm();
  }
  onEditName(): void {
    this.editableName = true;
  }
  onEditDescription(): void {
    this.editableDescription = true;
  }
  onEditJobOpenings(): void {
    this.editableJobOpening = true;
  }
  onEditSpecialQualification(): void {
    this.editableSpecialQualification = true;
  }
  onEditExperience(): void {
    this.editableExperience = true;
  }
  onEditEstimatedStartDate(): void {
    this.editableEstimatedStartDate = true;
  }
  onEditCity(): void {
    this.editableCity = true;
  }
  onEditZipCode(): void {
    this.editableZipCode = true;
  }
  onEditRegion(): void {
    this.editableRegion = true;
  }
  onEditState(): void {
    this.editableState = true;
  }
  onEditCertificates(): void {
    this.editableCertificates = true;
  }
  onEditAddress(): void {
    this.editableAddress = true;
  }
  onEditJobTitle(): void {
    this.editablJobTitle = true;
  }
  getLocation(): void {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();

      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.filterMap.clear();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          const info = place.address_components;
          info.forEach(e => {
            switch (e.types[0]) {
              case 'sublocality_level_1':
                this.filterMap.set('REGION', e.long_name);
                break;
              case 'administrative_area_level_1':
                this.filterMap.set('STATE', e.long_name);
                break;
              case 'country':
                this.filterMap.set('COUNTRY', e.long_name);
                break;
              case 'postal_code':
                this.filterMap.set('ZIPCODE', e.long_name);
                break;
              case 'locality':
                this.filterMap.set('LOCALITY', e.long_name);
                break;
              default:
                break;
            }
          });
          this.filterMap.set('LATITUDE', place.geometry.location.lat());
          this.filterMap.set('LONGITUDE', place.geometry.location.lng());
          this.filterMap.set('ADDRESS', place.formatted_address);
          this.zoom = 12;
          const jsonObject = {};
          this.getAddressFromAutocompleteMapsApi(this.filterMap);

          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
        });
      });
    });


  }
  onSubmit(): boolean {
    this.submittedCertificate = true;
    if (!this.myForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.myForm.controls) {
        this.myForm.controls[controlName].markAsDirty();
        this.myForm.controls[controlName].updateValueAndValidity();
      }
      this.submittedCertificate = true;
      return false;
    }
    if (this.myForm.valid) {
      this.certificateService.addCertificate(JSON.stringify(this.myForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            if (this.jobDetailsForm.get('certificates').value) {
              this.addedCertificate = this.jobDetailsForm.get('certificates').value;
            }
            this.addedCertificate.push(data.data);
            this.jobDetailsForm.get('certificates').patchValue(this.addedCertificate);
            this.notificationService.success(this.translator.instant('create.certificate.successMessage'), '');
            this.certificateDialog = false;
            this.submittedCertificate = false;
            this.getCertificateList();
          }
          else {
            this.notificationService.error(data.message, '');
            this.certificateDialog = false;
            this.submittedCertificate = false;
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.certificateDialog = false;
          this.submittedCertificate = false;
        }
      );
    }
  }
  patchEditForm(id): void {
    if (!this.reviewForm) {
      this.initializeJobDetailsForm();
    }
    this.jobService.getJobId(id).subscribe(data => {
      this.editCertificates.length = 0;
      if (data.data.certificates.length !== 0) {
        data.data.certificates.forEach(element => {
          this.editCertificates.push(element.certificate);
          this.flagCerti = true;
        });
      }

      this.noOfOpenings = '';
      if (data.data.jobDetail.noOfOpeningJob !== 0) {

        this.noOfOpenings = data.data.jobDetail.noOfOpeningJob;
      }
      if (!data.data.jobDetail.estimatedStartDate) {
        this.editDate = null;
      }
      else {
        this.editDate = new Date(data.data.jobDetail.estimatedStartDate);
      }
      if (!this.reviewForm) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 1; i < data.data.screeningQuestions.length; i++) {
          this.addScreeningQuestion();
        }
      }
      if (!this.reviewForm) {
        this.jobDetailsForm.patchValue({
          id: data.data.jobDetail.id,
          jobTitle: data.data.jobDetail.jobTitle,
          title: data.data.jobDetail.title,
          description: data.data.jobDetail.description,
          specialQualification: data.data.jobDetail.specialQualification,
          noOfOpeningJob: this.noOfOpenings,
          experience: data.data.jobDetail.experience,
          estimatedStartDate: this.editDate,
          location: data.data.jobDetail.location,
          city: data.data.jobDetail.city,
          state: data.data.jobDetail.state,
          region: data.data.jobDetail.region,
          zipCode: data.data.jobDetail.zipCode,
          certificates: this.editCertificates,
          screeningQuestions: data.data.screeningQuestions,
          latitude: data.data.jobDetail.latitude,
          longitude: data.data.jobDetail.longitude

        });
      }
    });
  }
  getJobTitleList(): void {

    this.datatableParamJobTitle = {
      offset: 0,
      size: 100000,
      sortField: 'TITLE',
      sortOrder: 1,
      searchText: '{"ENABLE": true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParamJobTitle);
    this.JobTitleService.getJobTitleList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.jobTitleData = data.data.result;
            // tslint:disable-next-line: no-shadowed-variable
            this.jobTitleData.forEach(data => {
              this.jobTitleList.push(data.title);
            });
          }
        } else {
        }
      },
      error => {
      }
    );
  }
  returnLengthOfDescription(description): any {
    if (description) {
      let plainText = description.replace(/<[^>]*>/g, '');
      return plainText.length;
    }
    else {
      return 0;
    }
  }
  initializeJobTitleForm(): void {
    this.myJobTitleForm = this.formBuilder.group({
      id: [],
      title: ['', [CustomValidator.required, Validators.maxLength(50)]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isEnable: 1
    });
  }
  onSelectJobTitle(event): void {
    if (event.id === 'buttonIdTitle') {
      this.jobDetailsForm.controls.jobTitle.patchValue(null);
      this.jobTitleDialog = true;
    }
  }
  onSubmitJobTitle(): boolean {
    this.submittedJobTitle = true;
    if (!this.myJobTitleForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.myJobTitleForm.controls) {
        this.myJobTitleForm.controls[controlName].markAsDirty();
        this.myJobTitleForm.controls[controlName].updateValueAndValidity();
      }
      this.submittedJobTitle = true;
      return false;
    }
    if (this.myJobTitleForm.valid) {
      this.JobTitleService.addJobTitle(JSON.stringify(this.myJobTitleForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('job.title.added.successfully'), '');
            this.jobTitleDialog = false;
            this.submittedJobTitle = false;
            this.getJobTitleList();
            this.jobDetailsForm.controls.jobTitle.patchValue(data.data);
          }
          else {
            this.notificationService.error(data.message, '');
            this.jobTitleDialog = false;
            this.submittedJobTitle = false;
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.jobTitleDialog = false;
          this.submittedJobTitle = false;
        }
      );
    }
  }
  openJobTitleDialog(): void {
    this.jobTitleDialog = true;
    this.submittedJobTitle = false;
    this.initializeJobTitleForm();
  }

  hideJobTitleDialog(): void {
    this.jobTitleDialog = false;
    this.submittedJobTitle = false;
    this.initializeJobTitleForm();
  }
  filterCity(event): void {
    this.cityParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.cityParams);
    this.filterLeftPanelService.getCity(this.queryParam).subscribe(data => {
      this.filteredCity = data.data;
    });
  }

  filterState(event): void {
    this.stateParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.stateParams);
    this.filterLeftPanelService.getStateForJob(this.queryParam).subscribe(data => {
      this.filteredState = data.data;
    });
  }

  deleteJob() {
    if(this.jobDetailsForm.value.id) {
      const jobId = this.jobDetailsForm.value.id;
      this.jobDetailService.deleteJob(jobId).subscribe(response => {
        if(response.data) {
          this.notificationService.success('Job deleted successfully.', '');
          this.router.navigate([PATH_CONSTANTS.CLIENT_DASHBOARD]);
        } else {
          this.notificationService.error(response.message ? response.message : 'Somthing went wrong!', '');
        }
      }, err => {
          this.notificationService.error(err.message ? err.message : ' Error while deleting job', '');
      });
    }
  }

  openWarningDialogForDeleteJob() {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Do you want to delete current Job?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteJob();
      }
    });
  }

}
