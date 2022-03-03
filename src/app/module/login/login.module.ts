import { LocalStorageService } from './../../service/localstorage.service';
import { LoginService } from './../../service/login.service';
import { LoginRoutingModule } from './login.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from 'src/app/shared/shared.module';
import { AutofocusDirective } from './autofocus.directive';


@NgModule({
  declarations: [LoginComponent, AutofocusDirective],
  imports: [
    CommonModule,
    LoginRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    SharedModule

  ],
  providers: [LoginService, LocalStorageService]
})
export class LoginModule { }
