import { LoginComponent } from './login.component';

import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';


export const LOGIN_ROUTES: Routes = [
  { path: '', component: LoginComponent },
//   { path: 'forgotPassword', component: ForgotPasswordComponent, data: { title: 'forgotPassword' } },
//   { path: 'resetPassword', component: ResetPasswordComponent, data: { title: 'resetPassword' } },
//   { path: 'success', component: ResetPasswordSuccessComponent, data: { title: 'Success' } },
//   { path: 'resetPassword/:Id', component: ResetPasswordComponent, data: { title: 'resetPassword' } }
];

@NgModule({
  imports: [RouterModule.forChild(LOGIN_ROUTES)],
  exports: [RouterModule]
})

export class LoginRoutingModule { }