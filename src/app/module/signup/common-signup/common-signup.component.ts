import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';

@Component({
  selector: 'app-common-signup',
  templateUrl: './common-signup.component.html',
  styleUrls: ['./common-signup.component.css']
})
export class CommonSignupComponent implements OnInit {

  constructor(private primengConfig: PrimeNGConfig, private router: Router) { }

  ngOnInit(): void {
    this.primengConfig.ripple = true;
  }

  clientSignup(): void {
    this.router.navigate([PATH_CONSTANTS.CLIENT_SIGNUP]);
  }

  subcontractorSignup(): void {
    this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_SIGNUP]);
  }

  workerSignup(): void{
    this.router.navigate([PATH_CONSTANTS.WORKER_SIGNUP]);
  }

  onTermsOfUseClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_TERMS_OF_USE);
  }

  onPrivacyPolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_PRIVACY_POLICY);
  }

  onCookiePolicyClick() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_COOKIE_POLICY);
  }

}
