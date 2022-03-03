import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkerComponent } from './worker.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WorkerProfileComponent } from './worker-profile/worker-profile.component';
import { WorkerRoutingModule } from './worker-routing.module';
import { BasicDetailsComponent } from './worker-profile/basic-details/basic-details.component';
import { PayDetailsComponent } from './worker-profile/pay-details/pay-details.component';
import { WorkExpAndEducationComponent } from './worker-profile/work-exp-and-education/work-exp-and-education.component';
import { CertificatesComponent } from './worker-profile/certificates/certificates.component';
import { ReferencesComponent } from './worker-profile/references/references.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { JobListComponent } from './job-list/job-list.component';
import { ViewMoreJobDetailsComponent } from './view-more-job-details/view-more-job-details.component';
import { ApplyJobComponent } from './view-more-job-details/apply-job/apply-job.component';
import { WorkerDashboardComponent } from './worker-dashboard/worker-dashboard.component';
import { AcceptJobComponent } from './accept-job/accept-job.component';
import { ViewReimbursementsComponent } from './view-reimbursements/view-reimbursements.component';
import { WorkerJobDetailsComponent } from './worker-job-details/worker-job-details.component';
import { WorkerRatingReviewComponent } from './worker-rating-review/worker-rating-review.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { TimesheetDetailComponent } from './timesheet-detail/timesheet-detail.component';
import { WorkerProfileDetailComponent } from './worker-profile-detail/worker-profile-detail.component';
import { JobListingConfigurationComponent } from './job-listing-configuration/job-listing-configuration.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';


@NgModule({
  declarations: [
    WorkerComponent,
    WorkerProfileComponent,
    BasicDetailsComponent,
    PayDetailsComponent,
    WorkExpAndEducationComponent,
    CertificatesComponent,
    ReferencesComponent,
    JobListComponent,
    ViewMoreJobDetailsComponent,
    ApplyJobComponent,
    WorkerDashboardComponent,
    AcceptJobComponent,
    ViewReimbursementsComponent,
    WorkerJobDetailsComponent,
    WorkerRatingReviewComponent,
    InvoicesComponent,
    TimesheetComponent,
    TimesheetDetailComponent,
    WorkerProfileDetailComponent,
    JobListingConfigurationComponent,
    LeaderboardComponent
  ],

  imports: [
    CommonModule,
    WorkerRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgxDropzoneModule,
  ],
})
export class WorkerModule { }
