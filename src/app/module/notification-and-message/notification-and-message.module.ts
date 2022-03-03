import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BellNotificationComponent } from './bell-notification/bell-notification.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NotificationAndMessageRoutingModule } from './notificationandmessaging.routing';
import { NotificationComponent } from './notification/notification.component';



@NgModule({
  declarations: [BellNotificationComponent, NotificationComponent],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    NgxSpinnerModule,
    NotificationAndMessageRoutingModule
  ]
})
export class NotificationAndMessageModule { }
