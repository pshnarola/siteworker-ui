import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UserService } from 'src/app/service/User.service';
import { CaptionConstants } from '../CaptionConstants';
import { COMMON_CONSTANTS } from '../CommonConstants';
import { CustomValidator } from '../CustomValidator';
import { MustMatch } from '../must-match.validator';
import { UINotificationService } from '../notification/uinotification.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {
  submitted = false;
  passwordSuggestion = false;
  changePasswordForm: FormGroup;
  updatedPassword;
  oldPassword;
  loginUserId;

  constructor(
    private _userService: UserService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private _localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService
  ) {
    this.loginUserId = this._localStorageService.getLoginUserId();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CHANGE_PASSWORD);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    
  }

  ngOnInit(): void {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CHANGE_PASSWORD);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.initializeResetPasswordForm();
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);

  }

  onFocus():void {
    this.passwordSuggestion = true;
  }

  onFocusOut():void {
    this.passwordSuggestion = false;
  }

  private initializeResetPasswordForm(): void {
    this.changePasswordForm = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      password: ['', [Validators.required
        , Validators.pattern(COMMON_CONSTANTS.PASSWORD_REGX)]],
      confirmPassword: ['', [Validators.required,
      Validators.pattern(COMMON_CONSTANTS.PASSWORD_REGX)]]
    },
      {
        validator: MustMatch('password', 'confirmPassword')
      });
  }

  onChangePassword() {
    this.submitted = true;
    if (this.changePasswordForm.invalid) {
      CustomValidator.markFormGroupTouched(this.changePasswordForm);
      this.submitted = true;
      return false;
    }

    this.updatedPassword = this.changePasswordForm.value.password;

    this.oldPassword = this.changePasswordForm.value.oldPassword;

    this._userService.changePassword(this.loginUserId, this.updatedPassword, this.oldPassword).subscribe(
      data => {
        if (data.statusCode === '200') {
          this.notificationService.success(this.translator.instant('password.changed.successfully'), '');
          this.submitted = false;
          this.changePasswordForm.reset();
        }
        else {
          this.notificationService.error(data.message, '');
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );

  }

}
