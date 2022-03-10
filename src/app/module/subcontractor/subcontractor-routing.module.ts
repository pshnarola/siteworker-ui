import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ChangePasswordComponent } from 'src/app/shared/change-password/change-password.component';
import { ChatScreenComponent } from 'src/app/shared/chat-screen/chat-screen.component';
import { LeaderboardComponent } from 'src/app/shared/shared-leaderboard/leaderboard/leaderboard.component';
import { AcceptProjectComponent } from './accept-project/accept-project.component';
import { ChangeRequestComponent } from './change-request/change-request.component';
import { CloseoutPackgeRequestsComponent } from './closeout-packge-requests/closeout-packge-requests.component';
import { GroupedProjectStatusListComponent } from './grouped-project-status-list/grouped-project-status-list.component';
import { JobsiteDetailComponent } from './jobsite-detail/jobsite-detail.component';
import { PaymentMilestoneComponent } from './payment-milestone/payment-milestone.component';
import { BidQuotationComponent } from './project-biding-flow/bid-quotation/bid-quotation.component';
import { ProjectBidReviewComponent } from './project-biding-flow/project-bid-review/project-bid-review.component';
import { ProjectBidingFlowComponent } from './project-biding-flow/project-biding-flow.component';
import { SelectJobsiteComponent } from './project-biding-flow/select-jobsite/select-jobsite.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ProjectListingConfigurationComponent } from './project-listing-configuration/project-listing-configuration.component';
import { QuestionAnswerReplyComponent } from './question-answer-reply/question-answer-reply.component';
import { QuestionAnswerComponent } from './question-answer/question-answer.component';
import { SubcontractorDashboardComponent } from './subcontractor-dashboard/subcontractor-dashboard.component';
import { SubcontractorInvoiceComponent } from './subcontractor-invoice/subcontractor-invoice.component';
import { SubcontractorProfileDetailComponent } from './subcontractor-profile-detail/subcontractor-profile-detail.component';
import { SubcontractorProfileComponent } from './subcontractor-profile/subcontractor-profile.component';
import { SubcontractorRatingReviewComponent } from './subcontractor-rating-review/subcontractor-rating-review.component';
import { SubcontractorComponent } from './subcontractor.component';
import { ViewMoreProjectDetailComponent } from './view-more-project-detail/view-more-project-detail.component';


export const SUBCONTRACTOR_ROUTING: Routes = [
    {
        path: '',
        component: SubcontractorComponent,
        children: [
            {
                path: 'question-answer',
                component: QuestionAnswerComponent
            },
            {
                path: 'question-answer-reply',
                component: QuestionAnswerReplyComponent
            },
            {
                path: 'edit-subcontractor-profile',
                component: SubcontractorProfileComponent
            },
            {
                path: 'dashboard',
                component: SubcontractorDashboardComponent
            },
            {
                path: 'changePassword',
                component: ChangePasswordComponent
            },
            {
                path: 'change-request',
                component: ChangeRequestComponent
            },
            {
                path: 'project-list',
                component: ProjectListComponent
            },
            {
                path: 'grouped-project-list',
                component: GroupedProjectStatusListComponent
            },
            {
                path: 'view-more-project-information',
                component: ViewMoreProjectDetailComponent
            },
            {
                path: 'project-biding',
                component: ProjectBidingFlowComponent,
                // children: [{
                // }]
            },
            {
                path: 'select-jobsite',
                component: SelectJobsiteComponent,
            },
            {
                path: 'bid-quotation',
                component: BidQuotationComponent,
            },
            {
                path: 'project-detail',
                component: ProjectDetailComponent,
            },
            {
                path: 'jobsite-detail',
                component: JobsiteDetailComponent,
            },
            {
                path: 'payment-milestone',
                component: PaymentMilestoneComponent,
            },
            {
                path: 'project-bid-review',
                component: ProjectBidReviewComponent,
            },
            {
                path: 'rating-review',
                component: SubcontractorRatingReviewComponent,
            },
            {
                path: 'invoices',
                component: SubcontractorInvoiceComponent,
            },
            {
                path: 'closeout-packages',
                component: CloseoutPackgeRequestsComponent,
            },
            {
                path: 'chat-messages',
                component: ChatScreenComponent,
            },
            {
                path: 'accept-project',
                component: AcceptProjectComponent,
            },
            {
                path: 'subcontractor-profile-detail',
                component: SubcontractorProfileDetailComponent
            },
            {
                path: 'project-listing-configuration',
                component: ProjectListingConfigurationComponent
            },
            {
                path: 'leader-board',
                component: LeaderboardComponent,
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(SUBCONTRACTOR_ROUTING)],
    exports: [RouterModule]
})
export class SubcontractorRoutingModule {
}
