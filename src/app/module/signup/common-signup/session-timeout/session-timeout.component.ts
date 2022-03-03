import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';

@Component({
  selector: 'app-session-timeout',
  templateUrl: './session-timeout.component.html',
  styleUrls: ['./session-timeout.component.css']
})
export class SessionTimeoutComponent implements OnInit {

  message: string = this.translator.instant('user.loggedout');

  constructor(
    private translator: TranslateService,
    private router: Router,
  ) { }


  ngOnInit(): void {
  }

  login() {
    if (this.message !== '') {
      this.router.navigate(['login']);
    }
  }

  ngOnDestroy(): void {
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
