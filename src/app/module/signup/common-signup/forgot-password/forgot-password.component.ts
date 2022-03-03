import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RequestParam } from 'src/app/request-param';
import { UserService } from 'src/app/service/User.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {

  /*
     @author Vinita Jagwani
   */

  email: any;
  datatableParam: RequestParam;
  queryParam;
  myForm: FormGroup;
  loading = true;
  submitted = false;
  constructor(
    private forgotPasswordService: UserService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService) {
    this.datatableParam = new RequestParam();
    this.datatableParam = {
      email: null,
    };
  }

  ngOnInit(): void {
    this.initializeForm();
    this.loading = false;
  }

  private initializeForm(): void {
    this.myForm = this.formBuilder.group({
      email: ['', [Validators.required, CustomValidator.emailValidator]]
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
  onSubmit(): boolean {
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
    this.datatableParam = {
      email: this.myForm.controls.email.value
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.forgotPasswordService.forgotPassword(this.queryParam).subscribe(data => {
      if (data.statusCode === '200') {
        this.notificationService.success(this.translator.instant('forgot.password.successMessage'), '');
        this.submitted = false;
        this.initializeForm();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }
  onLogin(): void {

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
