import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { JobDetails } from '../../client/post-job/job-details';

@Component({
  selector: 'app-job-set-margin',
  templateUrl: './job-set-margin.component.html',
  styleUrls: ['./job-set-margin.component.css']
})
export class JobSetMarginComponent implements OnInit {
  myForm: FormGroup;
  submitted: boolean;
  selectedJob: any;
  isSelectedJob: boolean;
  subscription = new Subscription();
  marginData: any;

  //subadmin 
  userAccess: any;
  showButtons = true;
  btnDisabled = false;

  constructor(
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private jobDetailService: JobDetailService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private notificationService: UINotificationService) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.adminJobMarginSidebar.next(true);
    this.initializeForm();
    this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(data => {
      this.initializeForm();
      const job = this.localStorageService.getSelectedJob();
      if (job) {
        if (job.id === 'jobId') {
          this.isSelectedJob = false;
          this.selectedJob = null;
        }
        else {
          this.selectedJob = job;
          this.getMarginForJob(this.selectedJob.id);
        }
      }
      else {
        this.isSelectedJob = false;
        this.selectedJob = null;
      }
    }));

    this.userAccess = this.localStorageService.getItem('userAccess');
    if (this.userAccess) {
      this.menuAccess();
    }

  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      percentValue: [, [CustomValidator.required, Validators.min(0.01)]],
      platformFee: [, [Validators.min(0.01)]],
      hourlyRatePlusPlatformFee: []
    });
  }
  save(): boolean {

    this.submitted = true;
    if (!this.myForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.myForm.controls) {
        this.myForm.controls[controlName].markAsDirty();
        this.myForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
      }
      this.submitted = true;
      return false;
    }
    else {
      let jobDetail = new JobDetails();
      let loggedInUserId = this.localStorageService.getLoginUserId();
      jobDetail.id = this.selectedJob.id;
      jobDetail.workerMargin = this.myForm.value.percentValue;
      jobDetail.updatedBy = loggedInUserId;
      this.jobDetailService.updatePayRate(jobDetail).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.submitted = false;
          this.notificationService.success('Margin updated successfully', '');
          this.getMarginForJob(this.selectedJob.id);
          this.initializeForm();
        }
      });
    }
  }
  getMarginForJob(jobId): void {
    this.jobDetailService.getDataForJobMargin(jobId).subscribe(data => {
      if (data.data) {
        this.marginData = data.data;
      } else {
        this.marginData = null;
      }
    });
  }
  onEnterNewPercent(event) {
    if (event.value <= 99.99) {
      if (event.value !== null && event.value > 0) {
        let newPercent = 0.00;
        let jobPayRate = 0.00;
        let newPlatformFee = 0.00;
        let newJobPlatFormFee = 0.00;
        newPercent = (+parseFloat(event.value).toFixed(2));
        const payRate = this.marginData.payRate;
        jobPayRate = (+parseFloat(payRate).toFixed(2));
        // double rate = (currentMarginPercentage * payRate) / 100;
        // platformFee = payRate - rate;
        newPlatformFee = ((jobPayRate * newPercent) / 100);
        newJobPlatFormFee = (jobPayRate - newPlatformFee);
        this.myForm.get('platformFee').setValue(newPlatformFee);
        this.myForm.get('hourlyRatePlusPlatformFee').setValue(payRate + newJobPlatFormFee);
      }
      else {
        this.myForm.get('platformFee').setValue(0.00);
        this.myForm.get('hourlyRatePlusPlatformFee').setValue(0.00);
      }
    }

  }
  onBlur(event) {
    if (this.myForm.get('platformFee').value !== null && this.myForm.get('platformFee').value > 0) {
      let newPercent = 0.00;
      let jobPayRate = 0.00;
      let newPlatformFee = 0.00;
      newPlatformFee = (+parseFloat(this.myForm.get('platformFee').value).toFixed(2));
      const payRate = this.marginData.payRate;
      jobPayRate = (+parseFloat(payRate).toFixed(2));
      if (jobPayRate >= newPlatformFee) {
        newPercent = (100 - ((jobPayRate - newPlatformFee) / jobPayRate) * 100);
      }
      else if (newPlatformFee > jobPayRate) {
        newPercent = (100 - ((newPlatformFee - jobPayRate) / jobPayRate) * 100);
      }
      // if (newPercent > 0) {
      this.myForm.get('percentValue').setValue(newPercent);
      this.myForm.get('hourlyRatePlusPlatformFee').setValue(payRate + newPlatformFee);
      // }

    }
    else {
      this.myForm.get('percentValue').setValue(0.00);
      this.myForm.get('hourlyRatePlusPlatformFee').setValue(0.00);
    }
  }
  onEnterNewPlateformFee(event) {
    if (event.value !== null && event.value > 0) {
      let newPercent = 0.00;
      let jobPayRate = 0.00;
      let newPlatformFee = 0.00;
      newPlatformFee = (+parseFloat(event.value).toFixed(2));
      const payRate = this.marginData.payRate;
      jobPayRate = (+parseFloat(payRate).toFixed(2));
      if (jobPayRate >= newPlatformFee) {
        newPercent = (100 - ((jobPayRate - newPlatformFee) / jobPayRate) * 100);
      }
      else if (newPlatformFee > jobPayRate) {
        newPercent = (100 - ((newPlatformFee - jobPayRate) / jobPayRate) * 100);
      }
      // if (newPercent > 0) {
      this.myForm.get('percentValue').setValue(newPercent);
      this.myForm.get('hourlyRatePlusPlatformFee').setValue(payRate + newPlatformFee);
      // }

    }
    else {
      this.myForm.get('percentValue').setValue(0.00);
      this.myForm.get('hourlyRatePlusPlatformFee').setValue(0.00);
    }
  }
  ngOnDestroy(): void {
    this.projectJobSelectionService.adminJobMarginSidebar.next(false);
    this.subscription.unsubscribe();
  }

  menuAccess(): void {
    const accessPermission = this.userAccess.filter(e => e.menuName == 'Jobs');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }

}
