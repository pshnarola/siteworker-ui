import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'src/app/service/User.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { MustMatch } from 'src/app/shared/must-match.validator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { ResetPassword } from 'src/app/shared/vo/ResetPassword';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  resetPasswordForm: FormGroup;
  token: string;
  resetPasswordDetails: ResetPassword;
  queryParam;
  submitted = false;
  passwordSuggestion = false;

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute,
                private _userService: UserService,
                private router : Router,
                private notificationService: UINotificationService,
                private translator: TranslateService) {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'];
    });
    this.resetPasswordDetails = {
      token: this.token,
      password: null
    };
    
   }

  ngOnInit(): void {
    this.initializeResetPasswordForm();
  }

  onFocus(){
    this.passwordSuggestion = true;
  }

  onFocusOut(){
    this.passwordSuggestion = false;
  }

  private initializeResetPasswordForm(): void{
  this.resetPasswordForm = this.formBuilder.group({
    password: ['', [Validators.required
      , Validators.pattern(COMMON_CONSTANTS.PASSWORD_REGX)]],
    confirmPassword: ['', [Validators.required,
      Validators.pattern(COMMON_CONSTANTS.PASSWORD_REGX)]]
  },
  {
    validator: MustMatch('password', 'confirmPassword')
  });
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  onResetPassword(){
    this.submitted = true;
    if(this.resetPasswordForm.invalid){
      CustomValidator.markFormGroupTouched(this.resetPasswordForm);
      this.submitted = true;
    }

    this.resetPasswordDetails = {
      token: this.token,
      password: this.resetPasswordForm.controls.password.value
    };
    this.queryParam = this.prepareQueryParam(this.resetPasswordDetails);
    
    if(this.resetPasswordForm.valid){
      this._userService.resetPassword(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200'){
            console.log(data);
            this.notificationService.success(this.translator.instant('password.reset.successfully'), '');
            this.resetPasswordForm.reset();
            this.router.navigate(['/login']);
            }
            else{
              this.notificationService.error(data.message, '');
            }
        },
        (error) => {
          this.notificationService.error(this.translator.instant('common.error'), '');
        }
    );
    }
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

