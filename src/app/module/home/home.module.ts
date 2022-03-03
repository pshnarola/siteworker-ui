import { HomeRoutingModule } from './home.routing';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home.component';
import { HeaderNavigationComponent } from 'src/app/shared/header-navigation/header-navigation.component';
import { NavigationComponent } from 'src/app/shared/navigation/navigation.component';
import { NavigationUserComponent } from 'src/app/shared/header-navigation/navigation-user/navigation-user.component';
import { NavigationGeneralComponent } from 'src/app/shared/header-navigation/navigation-general/navigation-general.component';
import { PerfectScrollbarModule } from "ngx-perfect-scrollbar";
import { MaterialModule } from 'src/app/shared/material/material.module';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  declarations: [HomeComponent, HeaderNavigationComponent, NavigationComponent, NavigationUserComponent, NavigationGeneralComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    PerfectScrollbarModule,
    MaterialModule,
    DropdownModule,
    DialogModule,
    SharedModule
  ]
})
export class HomeModule { }
