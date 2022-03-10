import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { SubcontractorComponent } from './subcontractor.component';
import { SubcontractorRoutingModule } from './subcontractor-routing.module';
import { QuestionAnswerComponent } from './question-answer/question-answer.component';
import { QuestionAnswerReplyComponent } from './question-answer-reply/question-answer-reply.component';
import { ActiveLicensesComponent } from './subcontractor-profile/active-licenses/active-licenses.component';
import { BasicInformationComponent } from './subcontractor-profile/basic-information/basic-information.component';
import { CompanyDetailComponent } from './subcontractor-profile/company-detail/company-detail.component';
import { ComplianceComponent } from './subcontractor-profile/compliance/compliance.component';
import { SubcontractorProfileComponent } from './subcontractor-profile/subcontractor-profile.component';
import { CertificatesComponent } from './subcontractor-profile/certificates/certificates.component';
import { ReferencesComponent } from './subcontractor-profile/references/references.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { SubcontractorDashboardComponent } from './subcontractor-dashboard/subcontractor-dashboard.component';
import { ChangeRequestComponent } from './change-request/change-request.component';
import { ProjectListComponent } from './project-list/project-list.component';
import { ViewMoreProjectDetailComponent } from './view-more-project-detail/view-more-project-detail.component';
import { ProjectBidingFlowComponent } from './project-biding-flow/project-biding-flow.component';
import { SelectJobsiteComponent } from './project-biding-flow/select-jobsite/select-jobsite.component';
import { BidQuotationComponent } from './project-biding-flow/bid-quotation/bid-quotation.component';
import { ProjectDetailComponent } from './project-detail/project-detail.component';
import { JobsiteDetailComponent } from './jobsite-detail/jobsite-detail.component';
import { LineItemDetailComponent } from './project-biding-flow/line-item-detail/line-item-detail.component';
import { ProjectBidReviewComponent } from './project-biding-flow/project-bid-review/project-bid-review.component';
import { PaymentMilestoneComponent } from './payment-milestone/payment-milestone.component';
import { SubcontractorRatingReviewComponent } from './subcontractor-rating-review/subcontractor-rating-review.component';
import { SubcontractorInvoiceComponent } from './subcontractor-invoice/subcontractor-invoice.component';
import { AcceptProjectComponent } from './accept-project/accept-project.component';
import { CloseoutPackgeRequestsComponent } from './closeout-packge-requests/closeout-packge-requests.component';
import { SubcontractorProfileDetailComponent } from './subcontractor-profile-detail/subcontractor-profile-detail.component';
import { ProjectListingConfigurationComponent } from './project-listing-configuration/project-listing-configuration.component';
import { GroupedProjectStatusListComponent } from './grouped-project-status-list/grouped-project-status-list.component';
const components = [
  SubcontractorComponent,
  QuestionAnswerComponent,
  QuestionAnswerReplyComponent,
  SubcontractorProfileComponent,
  BasicInformationComponent,
  CompanyDetailComponent,
  CertificatesComponent,
  ActiveLicensesComponent,
  ComplianceComponent,
  ReferencesComponent,
  ChangeRequestComponent,
  ProjectDetailComponent
];

@NgModule({
  declarations: [components,
    SubcontractorDashboardComponent,
    ProjectListComponent,
    ViewMoreProjectDetailComponent,
    ProjectBidingFlowComponent,
    SelectJobsiteComponent,
    BidQuotationComponent,
    JobsiteDetailComponent,
    LineItemDetailComponent,
    ProjectBidReviewComponent,
    PaymentMilestoneComponent,
    SubcontractorRatingReviewComponent,
    AcceptProjectComponent,
    SubcontractorInvoiceComponent,
    CloseoutPackgeRequestsComponent,
    SubcontractorProfileDetailComponent,
    ProjectListingConfigurationComponent,
    GroupedProjectStatusListComponent,
  ],

  imports: [
    CommonModule,
    SubcontractorRoutingModule,
    SharedModule,
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    NgxDropzoneModule
  ],
  providers: [ConfirmDialogueService],
})
export class SubcontractorModule { }
