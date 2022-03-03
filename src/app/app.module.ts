import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { MenubarModule } from 'primeng/menubar';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProjectJobSelectionService } from './service/client-services/project-job-selection.service';
import { CustomHttpService } from './service/customHttp.service';
import { LocalStorageService } from './service/localstorage.service';
import { NavigationService } from './service/navigation.service';
import { AuthGuard } from './shared/auth.guard';
import { AuthGuardAdmin } from './shared/auth.guardAdmin';
import { ErrorComponent } from './shared/error/error.component';
import { NotificationService } from './shared/error/error.service';
import { httpInterceptor } from './shared/interceptor/httpInterceptor';
import { LangTranslateModule } from './translate/lang-translate.module';
import { TwoDigitDecimaNumberDirective } from './two-digit-decima-number.directive';




@NgModule({
  declarations: [
    AppComponent,
    ErrorComponent,
    TwoDigitDecimaNumberDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    PerfectScrollbarModule,
    NgbModule,
    FontAwesomeModule,
    MenubarModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MenubarModule,
    CommonModule,
    LangTranslateModule,
    ToastrModule.forRoot(),
    NgxSpinnerModule,
  ],
  providers: [
    CustomHttpService,
    NotificationService,
    LocalStorageService,

    AuthGuard,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    AuthGuardAdmin,
    NavigationService,
    ProjectJobSelectionService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: httpInterceptor,
      multi: true,
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
