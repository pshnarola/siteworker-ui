
import { UserService } from './../../../service/User.service';
import { UserRoutingModule } from './user.routing';

import { CommonModule } from '@angular/common';
import { UserComponent } from './user.component';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    UserRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule
  ],
  declarations: [UserComponent],
  providers: [UserService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class UserModule { }
