

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientSignupComponent } from '../client-signup/client-signup.component';
import { SubcontractorSignupComponent } from '../subcontractor-signup/subcontractor-signup.component';
import { WorkerSignupComponent } from '../worker-signup/worker-signup.component';
import { CommonSignupComponent } from './common-signup.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SessionTimeoutComponent } from './session-timeout/session-timeout.component';
import { VerifyUserComponent } from './verify-user/verify-user.component';



export const SIGNUP_ROUTES: Routes = [
  { path: '', component: CommonSignupComponent },
  { path: 'client', component: ClientSignupComponent },
  { path: 'subcontractor', component: SubcontractorSignupComponent },
  { path: 'worker', component: WorkerSignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verify', component: VerifyUserComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'session-timeout', component: SessionTimeoutComponent },
];

@NgModule({
  imports: [RouterModule.forChild(SIGNUP_ROUTES)],
  exports: [RouterModule]
})

export class SignupRoutingModule { }