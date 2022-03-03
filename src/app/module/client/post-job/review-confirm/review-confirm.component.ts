import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Certificate } from 'src/app/module/admin/certificate/certificate';
import { PostJobServiceService } from 'src/app/post-job-service.service';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { JobCertificate } from '../../Vos/JobCertificateModel';
import { JobDTO } from '../../Vos/JobDTO';



@Component({
  selector: 'app-review-and-confirm',
  templateUrl: './review-confirm.component.html',
  styleUrls: ['./review-confirm.component.css'],
})
export class ReviewConfirmComponent implements OnInit {

  jobDetailsForm: FormGroup;
  payDetailsForm: FormGroup;
  title;
  description;
  perDiem;
  jobType;
  selected: Certificate[];
  certificate1: Certificate;
  jobCertificate: JobCertificate;
  jobDTO: JobDTO;
  jobCertificateList = [];
  screeningQuestions: any[];
  subscription = new Subscription();
  @Output() submittedReviewFormDetails = new EventEmitter<any>();
  @Output() previousClick = new EventEmitter<any>();
  postJobDetails: { jobDetails: any, payDetails: any, workerSelection: any } = {
    jobDetails: '',
    payDetails: '',
    workerSelection: ''
  };
  id: any;
  editJobId: any;
  submitted: boolean = false;
  employeTypeDropDown = [];
  employeTypeValue = [];
  editJob: any;
  editEmployeType: any;
  editCertificates = [];
  jobId: any;
  hourlyRateFrom: any;
  hourlyRateTo: any;
  annualSalaryFrom: any;
  annualSalaryTo: any;
  edit = false;
  perDiemZero = false;
  minimumMilesZero = false;
  mileageRateZero = false;
  perDiemRate: any;
  minimumMile: any;
  mileageRate: any;
  relocation = true;
  health = true;
  yearly = true;
  diem = true;
  mileage = true;
  retirement = true;
  editableEmploymentType = false;
  editableHourlyRangeFrom = false;
  editableHourlyRangeTo = false;
  editablePerDiem = false;
  editablePerDiemRate = false;
  editableMinimumMiles = false;
  editableMileageRate = false;
  editableMiles = false;
  editableAnnualRangeFrom = false;
  editableAnnualRangeTo = false;
  editableRelocationBenefit = false;
  editableYearlyBonus = false;
  editableRetirement = false;
  editableHealthBenefit = false;
  employmentType: string;
  feedback;
  errorFlag = false;
  errorFlagHour = false;
  @Input() reviewForm: any;
  hourlyFrom;
  hourlyTo;
  annualFrom;
  annualTo;
  employeType = [
    { label: 'Temporary Worker - 1099', value: 'WORKER_1099' },
    { label: 'Temporary Worker - W2', value: 'WORKER_W2' },
    { label: 'Full-time Employee', value: 'FULL_TIME' },
  ];
  selectedCertificates: Certificate[];
  constructor(
    private postJobService: PostJobServiceService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private jobDetailService: JobDetailService,
    private router: Router,
    private formBuilder: FormBuilder) {
    this.postJobService.jobSubject.subscribe(
      data => {
        this.patchEditForm(data.id);
      }
    );
    let jobId = localStorageService.getItem('jobId');
    if (this.localStorageService.getItem('editJobId')) {
      this.jobDetailService.editJobSubject.subscribe(e => {
        this.editJobId = this.localStorageService.getItem('editJobId');
        this.patchEditForm(this.editJobId);
      });
    }
    else {
      this.editJobId = null;

      this.postJobService.jobSubject.subscribe(
        data => {
          this.patchEditForm(data.id);
        }
      );

    }

  }


  ngOnInit(): void {
    this.postJobService.initializeJobDetailsForm();
    this.postJobDetails = this.postJobService.postJobDetails;
    this.employmentType = 'WORKER_1099';
    this.initializePayDetailsForm();
    this.addOrRemoveFormControl(this.employmentType);
  }


  changedJobDetails(jobDetails: FormGroup): void {
    this.jobDetailsForm = jobDetails;
    this.postJobDetails.jobDetails = jobDetails.value;
  }

  changedPayDetails(payDetails: FormGroup): void {
    this.payDetailsForm = payDetails;
    this.postJobDetails.payDetails = payDetails.value;
  }

  saveDraft(): boolean {

    this.submitted = true;
    if (this.payDetailsForm) {
      if (!this.payDetailsForm.valid) {
        let controlName: string;
        // tslint:disable-next-line: forin
        for (controlName in this.payDetailsForm.controls) {
          this.payDetailsForm.controls[controlName].markAsDirty();
          this.payDetailsForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
        }
        this.submitted = true;
        return false;
      }
    }
    if (this.jobDetailsForm) {
      if (!this.jobDetailsForm.valid) {
        let controlName: string;
        // tslint:disable-next-line: forin
        for (controlName in this.payDetailsForm.controls) {
          this.jobDetailsForm.controls[controlName].markAsDirty();
          this.jobDetailsForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
        }
        this.submitted = true;
        return false;
      }
    }
    this.jobId = this.localStorageService.getItem('jobId');
    if (this.payDetailsForm.value.hourlyRateTo < this.payDetailsForm.value.hourlyRateFrom) {
      this.errorFlag = true;
    }


    if (this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').value || this.editJobId || this.jobId) {
      if (this.editJobId) {
        this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.editJobId);
      } else if (this.jobId) {
        this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.jobId);
      }
      else {
        this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.postJobService.postJobDetails.jobDetails.id);
      }
      this.postJobService.jobDetailsForm.get('jobDetail.jobTitle').setValue(this.postJobService.postJobDetails.jobDetails.jobTitle);
      this.postJobService.jobDetailsForm.get('jobDetail.title').setValue(this.postJobService.postJobDetails.jobDetails.title);
      this.postJobService.jobDetailsForm.get('jobDetail.description').setValue(this.postJobService.postJobDetails.jobDetails.description);
      this.postJobService.jobDetailsForm.get('jobDetail.specialQualification')
        .setValue(this.postJobService.postJobDetails.jobDetails.specialQualification);
      this.postJobService.jobDetailsForm.get('jobDetail.noOfOpeningJob')
        .setValue(this.postJobService.postJobDetails.jobDetails.noOfOpeningJob);
      this.postJobService.jobDetailsForm.get('jobDetail.experience').setValue(this.postJobService.postJobDetails.jobDetails.experience);
      this.postJobService.jobDetailsForm.get('jobDetail.estimatedStartDate')
        .setValue(this.postJobService.postJobDetails.jobDetails.estimatedStartDate);
      this.postJobService.jobDetailsForm.get('jobDetail.city').setValue(this.postJobService.postJobDetails.jobDetails.city);
      this.postJobService.jobDetailsForm.get('jobDetail.zipCode').setValue(this.postJobService.postJobDetails.jobDetails.zipCode);
      this.postJobService.jobDetailsForm.get('jobDetail.state').setValue(this.postJobService.postJobDetails.jobDetails.state);
      this.postJobService.jobDetailsForm.get('jobDetail.region').setValue(this.postJobService.postJobDetails.jobDetails.region);
      this.screeningQuestions = this.postJobService.postJobDetails.jobDetails.screeningQuestions;
      for (let i = 0; i < this.screeningQuestions.length; i++) {
        this.screeningQuestions[i].questionNo = i + 1;
        this.postJobService.jobDetailsForm.value.screeningQuestions[i] = this.screeningQuestions[i];
      }
      this.postJobService.jobDetailsForm.get('jobDetail.latitude').setValue(this.postJobService.postJobDetails.jobDetails.latitude);
      this.postJobService.jobDetailsForm.get('jobDetail.longitude').setValue(this.postJobService.postJobDetails.jobDetails.longitude);
      this.postJobService.jobDetailsForm.get('jobDetail.location').setValue(this.postJobService.postJobDetails.jobDetails.location);
      if (this.editJobId && this.editCertificates.length !== 0) {
        this.jobCertificateList.length = 0;
        this.editCertificates.forEach(data => {
          this.jobCertificateList.push(new JobCertificate(data));
        });
      }
      else {
        this.jobCertificateList.length = 0;
        this.jobCertificate = this.postJobService.postJobDetails.jobDetails.certificates;
        this.selectedCertificates = this.postJobService.postJobDetails.jobDetails.certificates;
        this.jobCertificateList.length = 0;
        this.selectedCertificates.forEach(data => {
          this.jobCertificateList.push(new JobCertificate(data));
        });
      }
      this.postJobService.jobDetailsForm.get('certificates').setValue(this.jobCertificateList);
      this.postJobService.jobDetailsForm.get('jobDetail.status').setValue('DRAFT');
      this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue(2);
      this.postJobService.jobDetailsForm.get('jobDetail.employmentType').setValue(this.payDetailsForm.value.employmentType);
      this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryFrom').setValue(this.payDetailsForm.value.annualSalaryFrom);
      this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryTo').setValue(this.payDetailsForm.value.annualSalaryTo);
      this.postJobService.jobDetailsForm.get('jobDetail.isYearlyBonus').setValue(this.payDetailsForm.value.isYearlyBonus);
      this.postJobService.jobDetailsForm.get('jobDetail.isHealthBenifit').setValue(this.payDetailsForm.value.isHealthBenifit);
      this.postJobService.jobDetailsForm.get('jobDetail.is401KRetirement').setValue(this.payDetailsForm.value.is401KRetirement);
      this.postJobService.jobDetailsForm.get('jobDetail.isRelocationBenifit').setValue(this.payDetailsForm.value.isRelocationBenifit);
      if (this.payDetailsForm.value.jobType === true) {
        this.jobType = 'OPEN_MARKET_REQUEST';
      }
      else {
        this.jobType = 'PRIVATE_REQUEST';
      }
      this.postJobService.jobDetailsForm.get('jobDetail.jobType').setValue(this.jobType);
      this.postJobService.jobDetailsForm.get('jobDetail.isPerDiem').setValue(this.payDetailsForm.value.isPerDiem);
      this.postJobService.jobDetailsForm.get('jobDetail.perDiemRate').setValue(this.payDetailsForm.value.perDiemRate);
      this.postJobService.jobDetailsForm.get('jobDetail.isPayForMilage').setValue(this.payDetailsForm.value.isPayForMilage);
      this.postJobService.jobDetailsForm.get('jobDetail.minimumMile').setValue(this.payDetailsForm.value.minimumMile);
      this.postJobService.jobDetailsForm.get('jobDetail.milageRate').setValue(this.payDetailsForm.value.milageRate);
      this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateFrom').setValue(this.payDetailsForm.value.hourlyRateFrom);
      this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateTo').setValue(this.payDetailsForm.value.hourlyRateTo);
      if (!this.errorFlagHour || !this.errorFlag) {

        this.postJobService.updateJob(this.postJobService.jobDetailsForm.value).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.localStorageService.setItem('job', data.data.jobDetail);
            this.localStorageService.setItem('jobId', data.data.jobDetail.id);
            this.notificationService.success(this.translator.instant('jobdetail.saved.as.draft'), '');
            this.projectJobSelectionService.addJobSubject.next(data.data.jobDetail);
            if (this.editJobId) {
              this.jobDetailService.editJobSubject.next(data.data.jobDetail);
              // this.patchEditForm(data.data.jobDetail.id);
            }
            else {
              this.postJobService.jobSubject.next(data.data.jobDetail);
              this.postJobService.jobSubjectForPay.next(data.data.jobDetail);
            }
            this.submitted = false;
            this.errorFlagHour = false;
            this.errorFlag = false;
          }
          else {
            this.notificationService.error(data.message, '');
          }
        },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          }
        );
        // this.postJobService.saveTillPayDetailsAsDraft(this.payDetailsForm.value);
      }

    }
    else {
      this.postJobService.jobDetailsForm.get('jobDetail.jobTitle').setValue(this.postJobService.postJobDetails.jobDetails.jobTitle);
      this.postJobService.jobDetailsForm.get('jobDetail.title').setValue(this.postJobService.postJobDetails.jobDetails.title);
      this.postJobService.jobDetailsForm.get('jobDetail.description').setValue(this.postJobService.postJobDetails.jobDetails.description);
      this.postJobService.jobDetailsForm.get('jobDetail.specialQualification')
        .setValue(this.postJobService.postJobDetails.jobDetails.specialQualification);
      this.postJobService.jobDetailsForm.get('jobDetail.noOfOpeningJob')
        .setValue(this.postJobService.postJobDetails.jobDetails.noOfOpeningJob);
      this.postJobService.jobDetailsForm.get('jobDetail.experience').setValue(this.postJobService.postJobDetails.jobDetails.experience);
      this.postJobService.jobDetailsForm.get('jobDetail.estimatedStartDate')
        .setValue(this.postJobService.postJobDetails.jobDetails.estimatedStartDate);
      this.postJobService.jobDetailsForm.get('jobDetail.city').setValue(this.postJobService.postJobDetails.jobDetails.city);
      this.postJobService.jobDetailsForm.get('jobDetail.zipCode').setValue(this.postJobService.postJobDetails.jobDetails.zipCode);
      this.postJobService.jobDetailsForm.get('jobDetail.state').setValue(this.postJobService.postJobDetails.jobDetails.state);
      this.postJobService.jobDetailsForm.get('jobDetail.region').setValue(this.postJobService.postJobDetails.jobDetails.region);
      this.screeningQuestions = this.postJobService.postJobDetails.jobDetails.screeningQuestions;
      for (let i = 0; i < this.screeningQuestions.length; i++) {
        this.screeningQuestions[i].questionNo = i + 1;
        this.postJobService.jobDetailsForm.value.screeningQuestions[i] = this.screeningQuestions[i];
      }

      this.postJobService.jobDetailsForm.get('jobDetail.latitude').setValue(this.postJobService.postJobDetails.jobDetails.latitude);
      this.postJobService.jobDetailsForm.get('jobDetail.longitude').setValue(this.postJobService.postJobDetails.jobDetails.longitude);
      this.postJobService.jobDetailsForm.get('jobDetail.location').setValue(this.postJobService.postJobDetails.jobDetails.location);

      this.jobCertificate = this.postJobService.postJobDetails.jobDetails.certificates;
      this.selectedCertificates = this.postJobService.postJobDetails.jobDetails.certificates;
      this.jobCertificateList.length = 0;
      this.selectedCertificates.forEach(data => {
        this.jobCertificateList.push(new JobCertificate(data));
      });
      this.postJobService.jobDetailsForm.get('certificates').setValue(this.jobCertificateList);


      this.postJobService.jobDetailsForm.get('jobDetail.status').setValue('DRAFT');
      this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue(3);
      this.postJobService.jobDetailsForm.get('jobDetail.employmentType').setValue(this.payDetailsForm.value.employmentType);
      this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryFrom').setValue(this.payDetailsForm.value.annualSalaryFrom);
      this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryTo').setValue(this.payDetailsForm.value.annualSalaryTo);
      this.postJobService.jobDetailsForm.get('jobDetail.isYearlyBonus').setValue(this.payDetailsForm.value.isYearlyBonus);
      this.postJobService.jobDetailsForm.get('jobDetail.isHealthBenifit').setValue(this.payDetailsForm.value.isHealthBenifit);
      this.postJobService.jobDetailsForm.get('jobDetail.is401KRetirement').setValue(this.payDetailsForm.value.is401KRetirement);
      this.postJobService.jobDetailsForm.get('jobDetail.isRelocationBenifit').setValue(this.payDetailsForm.value.isRelocationBenifit);
      if (this.payDetailsForm.value.jobType === true) {
        this.jobType = 'OPEN_MARKET_REQUEST';
      }
      else {
        this.jobType = 'PRIVATE_REQUEST';
      }
      this.postJobService.jobDetailsForm.get('jobDetail.jobType').setValue(this.jobType);
      this.postJobService.jobDetailsForm.get('jobDetail.isPerDiem').setValue(this.payDetailsForm.value.isPerDiem);
      this.postJobService.jobDetailsForm.get('jobDetail.perDiemRate').setValue(this.payDetailsForm.value.perDiemRate);
      this.postJobService.jobDetailsForm.get('jobDetail.isPayForMilage').setValue(this.payDetailsForm.value.isPayForMilage);
      this.postJobService.jobDetailsForm.get('jobDetail.minimumMile').setValue(this.payDetailsForm.value.minimumMile);
      this.postJobService.jobDetailsForm.get('jobDetail.milageRate').setValue(this.payDetailsForm.value.milageRate);
      this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateFrom').setValue(this.payDetailsForm.value.hourlyRateFrom);
      this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateTo').setValue(this.payDetailsForm.value.hourlyRateTo);
      this.hourlyTo = this.payDetailsForm.value.hourlyRateTo;
      this.hourlyFrom = this.payDetailsForm.value.hourlyRateFrom;
      this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue(3);
      if (!this.errorFlagHour || !this.errorFlag) {
        this.postJobService.postJob(this.postJobService.jobDetailsForm.value).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.id = data.data.jobDetail.id;
            this.localStorageService.setItem('job', data.data.jobDetail);
            this.localStorageService.setItem('jobId', data.data.jobDetail.id);
            this.notificationService.success(this.translator.instant('jobdetail.saved.as.draft'), '');
            this.projectJobSelectionService.addJobSubject.next(data.data.jobDetail);
            this.postJobService.jobSubject.next(data.data.jobDetail);
            // this.patchEditForm(data.data.jobDetail.id);
            this.submitted = false;
            this.errorFlagHour = false;
            this.errorFlag = false;

          }
          else {
            this.notificationService.error(data.message, '');
          }
        },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          });
      }
    }
    // this.postJobService.saveTillPayDetailsAsDraft(this.payDetailsForm.value);
  }

  postJob(): boolean {
    this.submitted = true;
    this.id = this.localStorageService.getItem('jobId');
    if (this.payDetailsForm) {
      if (!this.payDetailsForm.valid) {
        let controlName: string;
        // tslint:disable-next-line: forin
        for (controlName in this.payDetailsForm.controls) {
          this.payDetailsForm.controls[controlName].markAsDirty();
          this.payDetailsForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
        }
        this.submitted = true;
        this.jobDetailService.subject.next(this.submitted);
        return false;
      }
    }
    if (this.jobDetailsForm) {
      if (!this.jobDetailsForm.valid) {
        let controlName: string;
        // tslint:disable-next-line: forin
        for (controlName in this.jobDetailsForm.controls) {
          this.jobDetailsForm.controls[controlName].markAsDirty();
          this.jobDetailsForm.controls[controlName].updateValueAndValidity();
        }
        this.submitted = true;
        this.jobDetailService.subject.next(this.submitted);
        return false;
      }
    }
    this.title = this.postJobDetails.jobDetails.title;
    this.description = this.postJobDetails.jobDetails.description;
    this.perDiem = this.postJobDetails.jobDetails.dailyDiem;
    this.postJobService.jobDetailsForm.get('jobDetail.jobTitle').setValue(this.postJobDetails.jobDetails.jobTitle);
    this.postJobService.jobDetailsForm.get('jobDetail.title').setValue(this.title);
    this.postJobService.jobDetailsForm.get('jobDetail.description').setValue(this.description);
    this.postJobService.jobDetailsForm.get('jobDetail.specialQualification')
      .setValue(this.postJobDetails.jobDetails.specialQualification);
    this.postJobService.jobDetailsForm.get('jobDetail.state').setValue(this.postJobDetails.jobDetails.state);
    this.postJobService.jobDetailsForm.get('jobDetail.region').setValue(this.postJobDetails.jobDetails.region);
    this.postJobService.jobDetailsForm.get('jobDetail.zipCode').setValue(this.postJobDetails.jobDetails.zipCode);
    this.postJobService.jobDetailsForm.get('jobDetail.city').setValue(this.postJobDetails.jobDetails.city);
    this.postJobService.jobDetailsForm.get('jobDetail.noOfOpeningJob').setValue(this.postJobDetails.jobDetails.noOfOpeningJob);
    this.postJobService.jobDetailsForm.get('jobDetail.experience').setValue(this.postJobDetails.jobDetails.experience);
    this.postJobService.jobDetailsForm.get('jobDetail.estimatedStartDate').setValue(this.postJobDetails.jobDetails.estimatedStartDate);
    this.screeningQuestions = this.postJobService.postJobDetails.jobDetails.screeningQuestions;
    for (let i = 0; i < this.screeningQuestions.length; i++) {
      this.screeningQuestions[i].questionNo = i + 1;

      this.postJobService.jobDetailsForm.value.screeningQuestions[i] = this.screeningQuestions[i];
    }
    this.postJobService.jobDetailsForm.get('jobDetail.latitude').setValue(this.postJobDetails.jobDetails.latitude);
    this.postJobService.jobDetailsForm.get('jobDetail.longitude').setValue(this.postJobDetails.jobDetails.longitude);
    this.postJobService.jobDetailsForm.get('jobDetail.location').setValue(this.postJobDetails.jobDetails.location);
    this.selected = this.postJobService.postJobDetails.jobDetails.certificates;
    this.jobCertificateList.length = 0;
    this.selected.forEach(data => {
      this.jobCertificateList.push(new JobCertificate(data));
    });
    this.postJobService.jobDetailsForm.get('certificates').setValue(this.jobCertificateList);
    this.postJobService.jobDetailsForm.get('jobDetail.employmentType').setValue(this.payDetailsForm.value.employmentType);
    this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryFrom').setValue(this.payDetailsForm.value.annualSalaryFrom);
    this.postJobService.jobDetailsForm.get('jobDetail.annualSalaryTo').setValue(this.payDetailsForm.value.annualSalaryTo);
    this.postJobService.jobDetailsForm.get('jobDetail.isYearlyBonus').setValue(this.payDetailsForm.value.isYearlyBonus);
    this.postJobService.jobDetailsForm.get('jobDetail.isHealthBenifit').setValue(this.payDetailsForm.value.isHealthBenifit);
    this.postJobService.jobDetailsForm.get('jobDetail.is401KRetirement').setValue(this.payDetailsForm.value.is401KRetirement);
    this.postJobService.jobDetailsForm.get('jobDetail.isRelocationBenifit').setValue(this.payDetailsForm.value.isRelocationBenifit);
    if (this.payDetailsForm.value.jobType === true) {
      this.jobType = 'OPEN_MARKET_REQUEST';
    }
    else {
      this.jobType = 'PRIVATE_REQUEST';
    }
    this.postJobService.jobDetailsForm.get('jobDetail.jobType').setValue(this.jobType);
    this.postJobService.jobDetailsForm.get('jobDetail.isPerDiem').setValue(this.payDetailsForm.value.isPerDiem);
    this.postJobService.jobDetailsForm.get('jobDetail.perDiemRate').setValue(this.payDetailsForm.value.perDiemRate);
    this.postJobService.jobDetailsForm.get('jobDetail.isPayForMilage').setValue(this.payDetailsForm.value.isPayForMilage);
    this.postJobService.jobDetailsForm.get('jobDetail.minimumMile').setValue(this.payDetailsForm.value.minimumMile);
    this.postJobService.jobDetailsForm.get('jobDetail.milageRate').setValue(this.payDetailsForm.value.milageRate);
    this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateFrom').setValue(this.payDetailsForm.value.hourlyRateFrom);
    this.postJobService.jobDetailsForm.get('jobDetail.hourlyRateTo').setValue(this.payDetailsForm.value.hourlyRateTo);

    this.postJobService.jobDetailsForm.get('jobDetail.status').setValue('POSTED');
    if (!this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').value && !this.editJobId && !this.id) {
      this.postJobService.postJob(this.postJobService.jobDetailsForm.value).subscribe(data => {
        this.postJobService.jobDetailsForm.get('jobDetail.lastSavedStep').setValue('3');
        if (data.statusCode === '200' && data.message === 'OK') {
          this.localStorageService.setItem('jobDetail', data.data);
          this.projectJobSelectionService.addJobSubject.next(data.data.jobDetail);

          this.notificationService.success(this.translator.instant('job.posted'), '');

          this.submittedReviewFormDetails.emit(data.data);
        }
        else {
          this.notificationService.error(data.message, '');
        }
      }, error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
      );
    }
    else {
      if (this.id) {
        this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.id);
      }
      else if (this.editJobId) {
        this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.editJobId);
      }
      else {
        this.postJobService.jobDetailsForm.get('jobDetail.id').setValue(this.postJobService.postJobDetails.jobDetails.id);
      }
      this.postJobService.updateJob(this.postJobService.jobDetailsForm.value).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.projectJobSelectionService.addJobSubject.next(data.data.jobDetail);
          this.projectJobSelectionService.workerSelectionSubject.next('dummy');
          this.localStorageService.setItem('job', data.data.jobDetail);
          this.localStorageService.setItem('jobDetail', data.data);
          this.notificationService.success(this.translator.instant('job.posted'), '');
          this.submittedReviewFormDetails.emit(data.data);
          this.projectJobSelectionService.addJobSubject.next(data.data.jobDetail);
        }
        else {
          this.notificationService.error(data.message, '');
        }
      }, error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
      );
    }

  }
  previous(): void {
    this.previousClick.emit(this.postJobService.jobDetailsForm.value);
  }
  patchEditForm(id): void {
    const currenturl = this.router.url;

    this.jobDetailService.getJobId(id).subscribe(data => {
      if (data.data.certificates) {
        this.editCertificates.length = 0;
        data.data.certificates.forEach(element => {
          this.editCertificates.push(element.certificate);
        });
      }
      if (data.data.jobDetail.jobType === 'OPEN_MARKET_REQUEST') {
        this.jobType = true;
      }
      else {
        this.jobType = false;
      }

      if (data.data.jobDetail.employmentType) {
        this.editEmployeType = data.data.jobDetail.employmentType;
        this.employmentType = this.editEmployeType;
        this.edit = true;
      }
      else {
        this.editEmployeType = this.employmentType;
      }
      this.initializePayDetailsForm();
      this.addOrRemoveFormControl(this.employmentType);
      if (data.data.jobDetail.hourlyRateFrom) {
        this.hourlyRateFrom = data.data.jobDetail.hourlyRateFrom;
        this.hourlyRateTo = data.data.jobDetail.hourlyRateTo;
      }
      if (data.data.jobDetail.annualSalaryFrom) {
        this.annualSalaryFrom = data.data.jobDetail.annualSalaryFrom;
        this.annualSalaryTo = data.data.jobDetail.annualSalaryTo;
      }
      if (data.data.jobDetail.perDiemRate) {
        this.perDiemRate = data.data.jobDetail.perDiemRate;
      }
      if (data.data.jobDetail.minimumMile) {
        this.minimumMile = data.data.jobDetail.minimumMile;
      }
      if (data.data.jobDetail.milageRate) {
        this.mileageRate = data.data.jobDetail.milageRate;
      }
      if (data.data.jobDetail.isPerDiem) {
        this.payDetailsForm.addControl('perDiemRate', new FormControl('', [Validators.required]));
      }
      else {
        this.payDetailsForm.removeControl('perDiemRate');
      }
      if (data.data.jobDetail.isPayForMilage) {
        this.payDetailsForm.addControl('minimumMile', new FormControl('', [Validators.required]));
        this.payDetailsForm.addControl('milageRate', new FormControl('', [Validators.required]));
      }
      else {
        this.payDetailsForm.removeControl('minimumMile');
        this.payDetailsForm.removeControl('milageRate');
      }
      this.employmentType = this.editEmployeType;
      this.payDetailsForm.patchValue({
        employmentType: this.editEmployeType,
        isPerDiem: data.data.jobDetail.isPerDiem,
        perDiemRate: data.data.jobDetail.perDiemRate,
        isPayForMilage: data.data.jobDetail.isPayForMilage,
        minimumMile: data.data.jobDetail.minimumMile,
        milageRate: data.data.jobDetail.milageRate,
        hourlyRateFrom: this.hourlyRateFrom,
        hourlyRateTo: this.hourlyRateTo,
        jobType: this.jobType,
        annualSalaryFrom: this.annualSalaryFrom,
        annualSalaryTo: this.annualSalaryTo,
        is401KRetirement: data.data.jobDetail.is401KRetirement,
        isHealthBenifit: data.data.jobDetail.isHealthBenifit,
        isRelocationBenifit: data.data.jobDetail.isRelocationBenifit,
        isYearlyBonus: data.data.jobDetail.isYearlyBonus
      });

    });

  }
  onChangePerDiemRate(event) {
    if ((event.target.value) === "0.00" || (event.target.value) === "00.00" || (event.target.value) === "000.00" || (event.target.value) === "0000.00") {
      this.perDiemZero = true;
    }
    else {
      this.perDiemZero = false;
    }
  }
  onChangeMinimumMiles(event) {
    if ((event.target.value) === "0.00" || (event.target.value) === "00.00" || (event.target.value) === "000.00" || (event.target.value) === "0000.00") {
      this.minimumMilesZero = true;
    }
    else {
      this.minimumMilesZero = false;
    }
  }
  onChangeMileageRate(event) {
    if ((event.target.value) === "0.00" || (event.target.value) === "00.00" || (event.target.value) === "000.00" || (event.target.value) === "0000.00") {
      this.mileageRateZero = true;
    }
    else {
      this.mileageRateZero = false;
    }
  }
  onHourlyRateChange(): void {
    this.payDetailsForm.get('hourlyRateFrom').valueChanges.subscribe(val => {
      this.payDetailsForm.get('hourlyRateTo').setValidators(Validators.min(val));
    });
  }
  onEditEmploymentType(): void {
    this.editableEmploymentType = true;
  }
  onEditHourlyRangeFrom(): void {
    this.editableHourlyRangeFrom = true;
  }
  onEditHourlyRangeTo(): void {
    this.editableHourlyRangeTo = true;
  }
  onEditPerDiem(): void {
    this.editablePerDiem = true;
  }
  onEditPerDiemRate(): void {
    this.editablePerDiemRate = true;
  }
  onEditMiles(): void {
    this.editableMiles = true;
  }
  onEditMinimumMiles(): void {
    this.editableMinimumMiles = true;
  }
  onEditMileageRate(): void {
    this.editableMileageRate = true;
  }
  onEditAnnualRangeFrom(): void {
    this.editableAnnualRangeFrom = true;
  }
  onEditAnnualRangeTo(): void {
    this.editableAnnualRangeTo = true;
  }
  onEditRelocationBenefit(): void {
    this.editableRelocationBenefit = true;
  }
  onEditYearlyBonus(): void {
    this.editableYearlyBonus = true;
  }
  onEditRetirement(): void {
    this.editableRetirement = true;
  }
  onEditHealthBenefit(): void {
    this.editableHealthBenefit = true;
  }
  private initializePayDetailsForm(): void {
    if (this.employmentType === 'FULL_TIME') {
      this.payDetailsForm = this.formBuilder.group({
        employmentType: [this.employmentType, CustomValidator.required],
        annualSalaryFrom: ['', [CustomValidator.required, Validators.min(0.01)]],
        annualSalaryTo: ['', [CustomValidator.required, Validators.min(0.01)]],
        isYearlyBonus: [true],
        isHealthBenifit: [true],
        is401KRetirement: [true],
        isRelocationBenifit: [true],
        jobType: [true, CustomValidator.required],
      });
    }
    else {
      this.payDetailsForm = this.formBuilder.group({
        employmentType: [this.employmentType,],
        isPerDiem: [true,],
        perDiemRate: ['', CustomValidator.required],
        isPayForMilage: [true,],
        minimumMile: ['', CustomValidator.required],
        milageRate: ['', CustomValidator.required],
        jobType: [true, CustomValidator.required],
        hourlyRateFrom: ['', [CustomValidator.required, Validators.min(0.01)]],
        hourlyRateTo: ['', [CustomValidator.required, Validators.min(0.01)]],
      });
    }




  }

  private addOrRemoveFormControl(employmentType): void {
    if (employmentType === 'WORKER_1099' || employmentType === 'WORKER_W2') {
      this.payDetailsForm.get('isPerDiem').valueChanges.subscribe(response => {
        if (!response) {
          this.payDetailsForm.removeControl('perDiemRate');
        }
        if (response) {
          this.payDetailsForm.addControl('perDiemRate', new FormControl('', [Validators.required]));
          if (this.reviewForm) {
            this.editablePerDiemRate = true;
          }
        }
      });

      this.payDetailsForm.get('isPayForMilage').valueChanges.subscribe(response => {
        if (!response) {
          this.payDetailsForm.removeControl('minimumMile');
          this.payDetailsForm.removeControl('milageRate');
        }
        if (response) {
          this.payDetailsForm.addControl('minimumMile', new FormControl('', [Validators.required]));
          this.payDetailsForm.addControl('milageRate', new FormControl('', [Validators.required]));
          if (this.reviewForm) {
            this.editableMinimumMiles = true;
            this.editableMileageRate = true;
          }
        }
      });
    }
  }
  onChangeAnnualTo(event): void {
    this.errorFlag = false;
    this.annualTo = event.target.value;
    this.annualFrom = this.payDetailsForm.value.annualSalaryFrom;
    // tslint:disable-next-line: radix
    if (parseFloat(this.annualTo) !== 0) {
      // tslint:disable-next-line: radix
      if (parseFloat(this.annualTo) <= parseFloat(this.annualFrom)) {
        this.errorFlag = true;
        this.feedback = 'To cannot be smaller than from';
      }
      else {
        this.errorFlag = false;
      }
    }
  }
  onChangeAnnualFrom(event): void {
    this.errorFlag = false;
    this.annualFrom = event.target.value;
    this.annualTo = this.payDetailsForm.value.annualSalaryTo;
    // tslint:disable-next-line: radix
    if (parseFloat(this.annualTo) !== 0) {
      // tslint:disable-next-line: radix
      if (parseFloat(this.annualTo) <= parseFloat(this.annualFrom)) {
        this.errorFlag = true;
        this.feedback = 'To cannot be smaller than from';
      }
      else {
        this.errorFlag = false;
      }
    }
  }
  onemploymentTypeChange(event): void {
    if (this.editJobId) {
      this.employmentType = event;
    }
    this.employmentType = event.value;
    this.initializePayDetailsForm();
    this.submitted = false;
    this.addOrRemoveFormControl(this.employmentType);
    if (this.employmentType === 'WORKER_1099' || this.employmentType === 'WORKER_W2') {
      this.editableHourlyRangeFrom = true;
      this.editableHourlyRangeTo = true;
      this.editablePerDiem = true;
      this.editablePerDiemRate = true;
      this.editableMiles = true;
      this.editableMinimumMiles = true;
      this.editableMileageRate = true;
    }
    else {
      this.editableAnnualRangeFrom = true;
      this.editableAnnualRangeTo = true;
      this.editableRelocationBenefit = true;
      this.editableYearlyBonus = true;
      this.editableHealthBenefit = true;
      this.editableRetirement = true;
    }

  }
  onChangeHourlyToValue(event): void {
    this.errorFlagHour = false;
    this.hourlyFrom = this.payDetailsForm.value.hourlyRateFrom;
    this.hourlyTo = event.target.value;
    // tslint:disable-next-line: radix
    if (parseFloat(this.hourlyTo) !== 0) {
      // tslint:disable-next-line: radix
      if (parseFloat(this.hourlyTo) <= parseFloat(this.hourlyFrom)) {
        this.errorFlagHour = true;
        this.feedback = 'To cannot be smaller than from';
      }
      else {
        this.errorFlagHour = false;
      }
    }
  }
  onChangeHourlyFromValue(event): void {
    this.errorFlagHour = false;
    this.hourlyTo = this.payDetailsForm.value.hourlyRateTo;
    this.hourlyFrom = event.target.value;

    // tslint:disable-next-line: radix
    if (parseFloat(this.hourlyTo) !== 0) {
      // tslint:disable-next-line: radix
      if (parseFloat(this.hourlyTo) <= parseFloat(this.hourlyFrom)) {
        this.errorFlagHour = true;
        this.feedback = 'To cannot be smaller than from';
      }
      else {
        this.errorFlagHour = false;
      }
    }
  }
}
