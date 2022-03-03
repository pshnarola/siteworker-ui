import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangePasswordComponent } from 'src/app/shared/change-password/change-password.component';
import { ChatScreenComponent } from 'src/app/shared/chat-screen/chat-screen.component';
import { LeaderboardComponent } from 'src/app/shared/shared-leaderboard/leaderboard/leaderboard.component';
import { AcceptJobComponent } from './accept-job/accept-job.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { JobListComponent } from './job-list/job-list.component';
import { JobListingConfigurationComponent } from './job-listing-configuration/job-listing-configuration.component';
import { TimesheetDetailComponent } from './timesheet-detail/timesheet-detail.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { ApplyJobComponent } from './view-more-job-details/apply-job/apply-job.component';
import { ViewMoreJobDetailsComponent } from './view-more-job-details/view-more-job-details.component';
import { ViewReimbursementsComponent } from './view-reimbursements/view-reimbursements.component';
import { WorkerDashboardComponent } from './worker-dashboard/worker-dashboard.component';
import { WorkerJobDetailsComponent } from './worker-job-details/worker-job-details.component';
import { WorkerProfileDetailComponent } from './worker-profile-detail/worker-profile-detail.component';
import { WorkerProfileComponent } from './worker-profile/worker-profile.component';
import { WorkerRatingReviewComponent } from './worker-rating-review/worker-rating-review.component';
import { WorkerComponent } from './worker.component';


export const WORKER_ROUTING: Routes = [
    {
        path: '',
        component: WorkerComponent,
        children: [
            {
                path: 'edit-worker-profile',
                component: WorkerProfileComponent
            },
            {
                path: 'job-list',
                component: JobListComponent
            },
            {
                path: 'view-more-job-details',
                component: ViewMoreJobDetailsComponent
            },
            {
                path: 'apply-for-job',
                component: ApplyJobComponent
            },
            {
                path: 'dashboard',
                component: WorkerDashboardComponent
            },
            {
                path: 'changePassword',
                component: ChangePasswordComponent
            },
            {
                path: 'accept-job',
                component: AcceptJobComponent
            },
            {
                path: 'view-reimbursements',
                component: ViewReimbursementsComponent
            },
            {
                path: 'worker-job-details',
                component: WorkerJobDetailsComponent
            },
            {
                path: 'rating-review',
                component: WorkerRatingReviewComponent
            },
            {
                path: 'invoices',
                component: InvoicesComponent
            },
            {
                path: 'chat-messages',
                component: ChatScreenComponent
            },
            {
                path: 'timesheet',
                component: TimesheetComponent
            },
            {
                path: 'timesheet-detail',
                component: TimesheetDetailComponent
            },
            {
                path: 'worker-profile-detail',
                component: WorkerProfileDetailComponent
            },
            {
                path: 'job-listing-configuration',
                component: JobListingConfigurationComponent
            },
            {
                path: 'leader-board',
                component: LeaderboardComponent
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(WORKER_ROUTING)],
    exports: [RouterModule]
})
export class WorkerRoutingModule { }
