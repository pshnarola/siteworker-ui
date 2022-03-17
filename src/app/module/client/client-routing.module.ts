import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClientProfileComponent } from './client-profile/client-profile.component';
import { ChangeRequestComponent } from './change-request/change-request.component';
import { EditClientProfileMsaComponent } from './client-profile/edit-client-profile-msa/edit-client-profile-msa.component';
import { EditClientProfileComponent } from './client-profile/edit-client-profile/edit-client-profile.component';
import { ClientComponent } from './client.component';
import { PostJobComponent } from './post-job/post-job.component';
import { SupervisorComponent } from './supervisor/supervisor.component';
import { WorkerProfileComponent } from './worker-profile/worker-profile.component';
import { ViewJobDetailsComponent } from './view-job-details/view-job-details.component';
import { QuestionAnswerComponent } from './question-answer/question-answer.component';
import { ClientDashboardComponent } from './client-dashboard/client-dashboard.component';
import { PostProjectComponent } from './post-project/post-project.component';
import { BidComparisionComponent } from './bid-comparision/bid-comparision.component';
import { CloseOutPackageRequestComponent } from './close-out-package-request/close-out-package-request.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { ClientProjectDetailsComponent } from './client-project-details/client-project-details.component';
import { ClientJobsiteDetailsComponent } from './client-jobsite-details/client-jobsite-details.component';
import { RatingAndReviewComponent } from './rating-and-review/rating-and-review.component';
import { WorkerComparisonComponent } from './worker-comparison/worker-comparison.component';
import { JobInvoiceComponent } from './job-invoice/job-invoice.component';
import { ChangePasswordComponent } from 'src/app/shared/change-password/change-password.component';
import { JobRatingAndReviewComponent } from './job-rating-and-review/job-rating-and-review.component';
import { ReviewAndOfferComponent } from './worker-comparison/review-and-offer/review-and-offer.component';
import { ClientJobTimeSheetComponent } from './client-job-time-sheet/client-job-time-sheet.component';
import { LineItemTemplateComponent } from './line-item-template/line-item-template.component';
import { AwardProjectComponent } from './award-project/award-project.component';
import { AwardJobsiteComponent } from './award-jobsite/award-jobsite.component';
import { ChatScreenComponent } from 'src/app/shared/chat-screen/chat-screen.component';
import { ClientJobTimeSheetDetailsComponent } from './client-job-time-sheet-details/client-job-time-sheet-details.component';
import { AuthGaurdClientGuard } from 'src/app/shared/auth-gaurd-client.guard';
import { ProjectRatingReviewComponent } from './project-rating-review/project-rating-review.component';
import { InviteeConfigurationComponent } from './invitee-configuration/invitee-configuration.component';
import { LeaderboardComponent } from 'src/app/shared/shared-leaderboard/leaderboard/leaderboard.component';
import { JobListComponent } from './job-list/job-list.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { SubcontractorSelectionComponent } from './post-project/subcontractor-selection/subcontractor-selection.component';
import { WorkerSelectionComponent } from './post-job/worker-selection/worker-selection.component';




export const CLIENT_ROUTING: Routes = [
    {
        path: '',
        component: ClientComponent,
        children: [
            {
                path: 'supervisor',
                component: SupervisorComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'edit-client',
                component: EditClientProfileComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'post-job',
                component: PostJobComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'edit-client-msa',
                component: EditClientProfileMsaComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'client-profile',
                component: ClientProfileComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'change-request',
                component: ChangeRequestComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'edit-worker-profile',
                component: WorkerProfileComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'project-list',
                component: ProjectListComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'job-list',
                component: JobListComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'view-job-details',
                component: ViewJobDetailsComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'question-answer',
                component: QuestionAnswerComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'client-dashboard',
                component: ClientDashboardComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'post-project',
                component: PostProjectComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'bidComparision',
                component: BidComparisionComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'closeOutPackageRequest',
                component: CloseOutPackageRequestComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'invoicesProject',
                component: InvoicesComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'invoicesJob',
                component: JobInvoiceComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'projectDetails',
                component: ClientProjectDetailsComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'jobsiteDetails',
                component: ClientJobsiteDetailsComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'inviteSubContractor',
                component: SubcontractorSelectionComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'inviteWorker',
                component: WorkerSelectionComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'ratingAndReviewProject',
                component: RatingAndReviewComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'project-rating-review',
                component: ProjectRatingReviewComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'worker-comparison',
                component: WorkerComparisonComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'changePassword',
                component: ChangePasswordComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'ratingAndReviewJob',
                component: JobRatingAndReviewComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'review-and-offer',
                component: ReviewAndOfferComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'clientJobTimeSheet',
                component: ClientJobTimeSheetComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'line-item-template',
                component: LineItemTemplateComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'edit-job',
                component: PostJobComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'review-&-award-project',
                component: AwardProjectComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'review-&-award-jobsite',
                component: AwardJobsiteComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'chat-messages',
                component: ChatScreenComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'client-job-time-sheet-details',
                component: ClientJobTimeSheetDetailsComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'Invitee-configuration',
                component: InviteeConfigurationComponent,
                canActivate: [AuthGaurdClientGuard]
            },
            {
                path: 'leader-board',
                component: LeaderboardComponent,
                canActivate: [AuthGaurdClientGuard]
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(CLIENT_ROUTING)],
    exports: [RouterModule]
})
export class ClientRoutingModule { }
