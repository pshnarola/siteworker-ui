import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { CustomHttpService } from './service/customHttp.service';
import { LocalStorageService } from './service/localstorage.service';
import { API_CONSTANTS } from './shared/ApiConstants';
import { CustomValidator } from './shared/CustomValidator';

@Injectable({
  providedIn: 'root'
})
export class PostJobServiceService {
    jobDetailsForm: FormGroup;
    jobDetailsFormForView: FormGroup;
    jobDetail: FormGroup;
    loginUserId;
    defaultSupervisor;
    form: BehaviorSubject<FormGroup>;
    jobSubject = new ReplaySubject<any>(1);
    jobSubjectForPay = new Subject<any>();
    constructor(private customHttpService: CustomHttpService, private http: HttpClient
        ,       private formBuilder: FormBuilder, private localStorageService: LocalStorageService) {
            this.loginUserId = localStorageService.getLoginUserId();
            this.form = new BehaviorSubject(this.jobDetailsForm);

        }
  postJobDetails: {jobDetails: any, payDetails: any, workerSelection: any } = {
    jobDetails : '',
    payDetails : '',
    workerSelection : ''
};
initializeJobDetailsForm(): void{
  // this.defaultSupervisor.id = 'jobId'
    const screeningQuestion = new FormArray([]);

    screeningQuestion.push(new FormGroup({
        question : new FormControl(),
        questionNo: new FormControl()
        }));

    const certificates = new FormArray([]);
    this.jobDetailsForm = this.formBuilder.group({

      certificates: [],
      screeningQuestions : screeningQuestion,
      jobInvitees: [],
      jobDetail: this.formBuilder.group({
      id: [],
      jobTitle:['', Validators.required],
      title : ['', Validators.required],
      description : ['', Validators.required],
      specialQualification : [''],
      noOfOpeningJob : ['', Validators.required],
      experience: [],
      estimatedStartDate : ['', Validators.required],

      city : ['', Validators.required],
      zipCode : ['', Validators.required],
      state : ['', Validators.required],
      region : ['', Validators.required],
      location : [],
      user: this.formBuilder.group({
        id: this.loginUserId}),

     latitude: '',
     longitude: '',
     is401KRetirement: ['', Validators.required],
    annualSalaryFrom: ['', Validators.required],
    annualSalaryTo: ['', Validators.required],
    isHealthBenifit: ['', Validators.required],
    jobType: 'OPEN_MARKET_REQUEST',
    milageRate: [],
    minimumMile: [],
    isPayForMilage: [],
    isPerDiem: [],
    perDiemRate: ['', CustomValidator.required],
    lastSavedStep: [],
    status: [],
    isYearlyBonus: [],
    employmentType: [],
    isRelocationBenifit: [],
    hourlyRateFrom: [],
    hourlyRateTo:  [],
    createdBy: this.loginUserId,


      })

    });

    this.jobDetailsFormForView = this.formBuilder.group({

      certificates: [],
      screeningQuestions : screeningQuestion,
      jobInvitees: [],
      jobDetail: this.formBuilder.group({
        id: [],
      title : ['', Validators.required],
      description : ['', Validators.required],
      specialQualification : [''],
      noOfOpeningJob : ['', Validators.required],
      experience: this.formBuilder.group({
             id: ['', [Validators.required]]}),
      estimatedStartDate : ['', Validators.required],

      city : ['', Validators.required],
      zipCode : ['', Validators.required],
      state : ['', Validators.required],
      region : ['', Validators.required],
      location : ['Ahmedabad'],
      user: this.formBuilder.group({
        id: this.loginUserId}),
      supervisor: this.formBuilder.group({
        id: null}),
     latitude: ['0'],
     longitude: ['0'],
     is401KRetirement: ['', Validators.required],
    annualSalaryFrom: ['', Validators.required],
    annualSalaryTo: ['', Validators.required],
    isHealthBenifit: ['', Validators.required],
    jobType: 'OPEN_MARKET_REQUEST',
    milageRate: [],
    minimumMile: [],
    isPayForMilage: [],
    isPerDiem: [],
    perDiemRate: ['', CustomValidator.required],
    lastSavedStep: [],
    status: [],
    isYearlyBonus: [],
    employmentType: [],
    isRelocationBenifit: [],
    hourlyRateFrom: [],
    hourlyRateTo:  [],
    createdBy: this.loginUserId,


      })

    });
    }

saveJobDetailsAsDraft(jobDetails: any): void{
  this.postJobDetails.jobDetails = jobDetails;
  console.log('Job saved as draft with details:');
  console.log(this.postJobDetails);
}

saveTillPayDetailsAsDraft(payDetails: any): void{
  this.postJobDetails.payDetails = payDetails;

  console.log('Job saved as draft with details:');
  console.log(this.postJobDetails);
}

saveTillWorkerSelectionAsDraft(workerSelection: any): void{
  this.postJobDetails.workerSelection = workerSelection;
  console.log('Job saved as draft with details:');
  console.log(this.postJobDetails);
}

saveJobAsDraft(reviewedPostJobDetails: {jobDetails: any, payDetails: any, workerSelection: any }): void{
  console.log('Job saved as draft with details:');
  console.log(reviewedPostJobDetails);
}

// tslint:disable-next-line: typedef
postJob(jobDetails){
  const url = API_CONSTANTS.ADD_JOB;
  return this.customHttpService.post(url, jobDetails);
}
// tslint:disable-next-line: typedef
updateJob(jobData){
  const url = API_CONSTANTS.UPDATE_JOB;
  return this.customHttpService.put(url, jobData);
}
// tslint:disable-next-line: typedef
addJobInvitee(inviteeData){
  const url = API_CONSTANTS.ADD_JOB_INVITEE;
  return this.customHttpService.post(url, inviteeData);
}
}
