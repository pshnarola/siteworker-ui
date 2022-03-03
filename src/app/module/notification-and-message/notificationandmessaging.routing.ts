

import { Routes, RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { BellNotificationComponent } from './bell-notification/bell-notification.component';
import { NotificationComponent } from './notification/notification.component';


export const NOTIFICATION_AND_MESSAGE: Routes = [
  {
    path: '',
    component: NotificationComponent,
    children: [
      {
        path: 'bellNotification',
        component: BellNotificationComponent
      },
    ]
  }

  //   { path: 'forgotPassword', component: ForgotPasswordComponent, data: { title: 'forgotPassword' } },
  //   { path: 'resetPassword', component: ResetPasswordComponent, data: { title: 'resetPassword' } },
  //   { path: 'success', component: ResetPasswordSuccessComponent, data: { title: 'Success' } },
  //   { path: 'resetPassword/:Id', component: ResetPasswordComponent, data: { title: 'resetPassword' } }
];

@NgModule({
  imports: [RouterModule.forChild(NOTIFICATION_AND_MESSAGE)],
  exports: [RouterModule]
})

export class NotificationAndMessageRoutingModule {

}