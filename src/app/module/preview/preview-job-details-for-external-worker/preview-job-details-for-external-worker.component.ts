import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';

@Component({
  selector: 'app-preview-job-details-for-external-worker',
  templateUrl: './preview-job-details-for-external-worker.component.html',
  styleUrls: ['./preview-job-details-for-external-worker.component.css']
})
export class PreviewJobDetailsForExternalWorkerComponent implements OnInit {
  id: any;
  selectedJob: any;
  certificates = [];
  screeningQuestions;
  lat: void;
  lng: any;
  readMoreDialog = false;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private jobDetailService: JobDetailService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(
      (params: Params) => {
        console.log(params.id);
        this.id = params.id;
      });
    this.getJobDetailById(this.id);
  }
  getJobDetailById(id): void {
    this.jobDetailService.findDetailsByIdPublic(id).subscribe(data => {
      console.log(data);
      this.selectedJob = data.data.jobDetail;
      this.certificates = data.data.certificates;
      this.screeningQuestions = data.data.screeningQuestions;
      this.lat = this.selectedJob.latitude;
      this.lng = this.selectedJob.longitude;
    });
  }
  openDialogReadMore(description) {
    this.readMoreDialog = true;
  }
  closeReadMoreDialog() {
    this.readMoreDialog = false;
  }
  redirectToSignIn(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.LOGIN_PATH_FOR_EXTERNAL);
  }

  redirectToSignUp(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.SIGNUP_PATH_FOR_EXTERNAL);
  }
  onTermsOfUseClick(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_TERMS_OF_USE);
  }

  onPrivacyPolicyClick(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_PRIVACY_POLICY);
  }

  onCookiePolicyClick(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_COOKIE_POLICY);
  }
  redirectToDashboard() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.WORDPRESS_WEBSITE);
  }
}
