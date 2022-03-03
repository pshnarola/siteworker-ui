import { AgmCoreModule } from '@agm/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';
import { ChartsModule } from 'ng2-charts';
import { ClipboardModule } from 'ngx-clipboard';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { PerfectScrollbarConfigInterface, PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { AppSidebarComponent } from 'src/app/shared/app-sidebar/app-sidebar.component';
import { HeaderComponent } from 'src/app/shared/header/header.component';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { ConfirmDialogueService } from '../confirm-dialogue.service';
import { UserService } from '../service/User.service';
import { AdminSidebarComponent } from './admin-sidebar/admin-sidebar.component';
import { AutoCompleteMapPlacesComponent } from './auto-complete-map-places/auto-complete-map-places.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ChatScreenComponent } from './chat-screen/chat-screen.component';
import { ConfirmDialogueComponent } from './confirm-dialogue/confirm-dialogue.component';
import { FooterComponent } from './footer/footer.component';
import { JobsiteDetailFilterComponent } from './jobsite-detail-filter/jobsite-detail-filter.component';
import { ProjectJobSelectionComponent } from './project-job-selection/project-job-selection.component';
import { RatingAndReviewComponent } from './rating-and-review/rating-and-review.component';
import { ReadMoreComponent } from './read-more/read-more.component';
import { LeaderboardComponent } from './shared-leaderboard/leaderboard/leaderboard.component';
import { SharedLeaderboardComponent } from './shared-leaderboard/shared-leaderboard.component';
import { SignupLoginHeaderComponent } from './signup-login-header/signup-login-header.component'; // <-- #2 import module
import { SpinnerComponent } from './spinner/spinner.component';
import { SubcontractorProjectListFilterComponent } from './subcontractor-project-list-filter/subcontractor-project-list-filter.component';
import { SubcontractorProjectSelectionComponent } from './subcontractor-project-selection/subcontractor-project-selection.component';
import { WorkerJobListFilterComponent } from './worker-job-list-filter/worker-job-list-filter.component';
import { WorkerSidebarJobListComponent } from './worker-sidebar-job-list/worker-sidebar-job-list.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  wheelPropagation: true
};
// import { NgxDropzoneModule } from 'ngx-dropzone';

// AoT requires an exported function for factories
// tslint:disable-next-line: typedef
export function HttpLoaderFactory(http: HttpClient) {
  return new MultiTranslateHttpLoader(http, [
    { prefix: './assets/translate/', suffix: '.json' },
    { prefix: './assets/translate/menu/', suffix: '.json' }
  ]);
}

@NgModule({
  // tslint:disable-next-line: max-line-length
  declarations: [AppSidebarComponent,
    HeaderComponent,
    SignupLoginHeaderComponent,
    ConfirmDialogueComponent,
    ProjectJobSelectionComponent,
    ReadMoreComponent,
    AutoCompleteMapPlacesComponent,
    ChangePasswordComponent,
    RatingAndReviewComponent,
    WorkerJobListFilterComponent,
    SpinnerComponent,
    WorkerSidebarJobListComponent,
    SubcontractorProjectListFilterComponent,
    SubcontractorProjectSelectionComponent,
    JobsiteDetailFilterComponent,
    ChatScreenComponent,
    FooterComponent,
    SharedLeaderboardComponent,
    LeaderboardComponent,
    AdminSidebarComponent],

  imports: [
    CommonModule,
    MaterialModule,
    DropdownModule,
    DialogModule,
    RouterModule,
    FormsModule,
    ChartsModule,
    NgxDropzoneModule,
    PerfectScrollbarModule,
    AvatarModule,
    TagModule,
    ReactiveFormsModule,
    ClipboardModule,
    // Production API key => AIzaSyD4pzKSK0dX3a96dfkzGmeHCNT4OthHwa8
    // Development API key => AIzaSyDUJ67ffU1fqzpwPXKkbdHzD1SzlSxmnMc
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyD4pzKSK0dX3a96dfkzGmeHCNT4OthHwa8',
      libraries: ['places']
    }),
    RxReactiveFormsModule,
    TranslateModule.forChild({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [ConfirmDialogueService, UserService, {
    provide: PERFECT_SCROLLBAR_CONFIG,
    useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
  },],
  exports: [
    // tslint:disable-next-line: max-line-length
    AppSidebarComponent,
    HeaderComponent,
    AvatarModule,
    ChartsModule,
    TagModule,
    TranslateModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    SignupLoginHeaderComponent,
    RxReactiveFormsModule,
    ConfirmDialogueComponent,
    AgmCoreModule,
    AutoCompleteMapPlacesComponent,
    ReadMoreComponent,
    ChangePasswordComponent,
    WorkerJobListFilterComponent,
    WorkerSidebarJobListComponent,
    SubcontractorProjectListFilterComponent,
    SubcontractorProjectSelectionComponent,
    JobsiteDetailFilterComponent
  ],

})
export class SharedModule { }
