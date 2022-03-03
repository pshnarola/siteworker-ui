import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { VerifyUserService } from 'src/app/service/verify/verify-user.service';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';

@Component({
  selector: 'app-verify-user',
  templateUrl: './verify-user.component.html',
  styleUrls: ['./verify-user.component.css']
})
export class VerifyUserComponent implements OnInit, OnDestroy {
  token: String;
  verificationSubscription: Subscription;
  message: string = this.translator.instant('user.not.verified');

  constructor(
    private _verifyUsr: VerifyUserService,
    private translator: TranslateService,
    private _notificationService: UINotificationService,
    private router: Router,
    private route: ActivatedRoute,
  ) { }


  ngOnInit(): void {

    this.route.queryParams.subscribe(
      (param: Params) => {
        this.token = param.token;
        this.verifyUser(this.token);
      }
    );
  }

  login() {
    if (this.message !== '') {
      this.router.navigate(['login']);
    }
  }

  verifyUser(token) {
    return this._verifyUsr.verifyUserByToken(token).subscribe(
      data => {
        if (data.statusCode == 200) {
          this.message = this.translator.instant('user.verified');
          this._notificationService.success(this.translator.instant('user.verified'), '');
        } else {
          this._notificationService.error(data.message, '');
        }

      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
      }
    );

  }

  ngOnDestroy(): void {
    console.log(this.verificationSubscription);
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
