import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { UserService } from 'src/app/service/User.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { ClientSignupComponent } from './client-signup/client-signup.component';
import { CommonSignupComponent } from './common-signup/common-signup.component';
import { SignupRoutingModule } from './common-signup/commonsignup.routing';
import { ForgotPasswordComponent } from './common-signup/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './common-signup/reset-password/reset-password.component';
import { SessionTimeoutComponent } from './common-signup/session-timeout/session-timeout.component';
import { VerifyUserComponent } from './common-signup/verify-user/verify-user.component';
import { SubcontractorSignupComponent } from './subcontractor-signup/subcontractor-signup.component';
import { WorkerSignupComponent } from './worker-signup/worker-signup.component';

const components = [CommonSignupComponent, ClientSignupComponent];

@NgModule({
  declarations: [components,
    SubcontractorSignupComponent,
    ForgotPasswordComponent,
    VerifyUserComponent,
    ResetPasswordComponent,
    WorkerSignupComponent,
    SessionTimeoutComponent
  ],

  imports: [
    CommonModule,
    SharedModule,
    SignupRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    NgxSpinnerModule
  ],
  providers: [UserService]
})
export class SignupModule { }
