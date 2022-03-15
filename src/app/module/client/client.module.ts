import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ClientComponent } from './client.component';
import { ClientProfileComponent } from './client-profile/client-profile.component';
import { SupervisorComponent } from './supervisor/supervisor.component';
import { ClientRoutingModule } from './client-routing.module';
import { EditClientProfileComponent } from './client-profile/edit-client-profile/edit-client-profile.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { PostJobComponent } from './post-job/post-job.component';
import { WorkerSelectionComponent } from './post-job/worker-selection/worker-selection.component';
import { PayDetailsComponent } from './post-job/pay-details/pay-details.component';
import { JobDetailsComponent } from './post-job/job-details/job-details.component';
import { ReviewConfirmComponent } from './post-job/review-confirm/review-confirm.component';
import { EditClientProfileMsaComponent } from './client-profile/edit-client-profile-msa/edit-client-profile-msa.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PostJobServiceService } from 'src/app/post-job-service.service';
import { AssignmentJobsiteComponent } from './supervisor/assignment-jobsite/assignment-jobsite.component';
import { AssignmentJobComponent } from './supervisor/assignment-job/assignment-job.component';
import { ChangeRequestComponent } from './change-request/change-request.component';
import { WorkerProfileComponent } from './worker-profile/worker-profile.component';
import { ViewJobDetailsComponent } from './view-job-details/view-job-details.component';
import { QuestionAnswerComponent } from './question-answer/question-answer.component';
import { ClientDashboardComponent } from './client-dashboard/client-dashboard.component';
import { PostProjectComponent } from './post-project/post-project.component';
import { AddNewProjectComponent } from './post-project/add-new-project/add-new-project.component';
import { JobsitesComponent } from './post-project/jobsites/jobsites.component';
import { SubcontractorSelectionComponent } from './post-project/subcontractor-selection/subcontractor-selection.component';
import { ReviewComponent } from './post-project/review/review.component';
import { AddJobsiteComponent } from './post-project/jobsites/add-jobsite/add-jobsite.component';
import { UserService } from 'src/app/service/User.service';
import { AddLineItemComponent } from './post-project/jobsites/add-line-item/add-line-item.component';
import { AddMilestoneComponent } from './post-project/jobsites/add-milestone/add-milestone.component';
import { BidComparisionComponent } from './bid-comparision/bid-comparision.component';
import { CloseOutPackageRequestComponent } from './close-out-package-request/close-out-package-request.component';
import { InvoicesComponent } from './invoices/invoices.component';
import { RatingAndReviewComponent } from './rating-and-review/rating-and-review.component';
import { ClientProjectDetailsComponent } from './client-project-details/client-project-details.component';
import { ClientJobsiteDetailsComponent } from './client-jobsite-details/client-jobsite-details.component';
import { GetLineItemComponent } from './post-project/jobsites/get-line-item/get-line-item.component';
import { WorkerComparisonComponent } from './worker-comparison/worker-comparison.component';
import { JobRatingAndReviewComponent } from './job-rating-and-review/job-rating-and-review.component';
import { JobInvoiceComponent } from './job-invoice/job-invoice.component';
import { ReviewAndOfferComponent } from './worker-comparison/review-and-offer/review-and-offer.component';
import { ClientJobTimeSheetComponent } from './client-job-time-sheet/client-job-time-sheet.component';
import { NgxStarRatingModule } from 'ngx-star-rating';
import { LineItemTemplateComponent } from './line-item-template/line-item-template.component';
import { QuillModule } from 'ngx-quill';
import { EditorModule } from 'primeng/editor';
import { SafeHtmlPipe } from 'src/app/shared/safeHtml.pipe';
import { CheckboxModule } from 'primeng/checkbox';
import { ProjectBidingComparisonComponent } from './bid-comparision/project-biding-comparison/project-biding-comparison.component';
import { JobsiteBidingComparisonComponent } from './bid-comparision/jobsite-biding-comparison/jobsite-biding-comparison.component';
import { CompareLineItemComponent } from './bid-comparision/compare-line-item/compare-line-item.component';
import { AwardProjectComponent } from './award-project/award-project.component';
import { AwardJobsiteComponent } from './award-jobsite/award-jobsite.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ClientJobTimeSheetDetailsComponent } from './client-job-time-sheet-details/client-job-time-sheet-details.component';
import { ProjectRatingReviewComponent } from './project-rating-review/project-rating-review.component';
import { InviteeConfigurationComponent } from './invitee-configuration/invitee-configuration.component';
import { JobListComponent } from './job-list/job-list.component';
import { ProjectListComponent } from './project-list/project-list.component';



const components = [
  ClientComponent,
  ClientProfileComponent,
  SupervisorComponent,
  EditClientProfileComponent,
  EditClientProfileMsaComponent,
  AssignmentJobsiteComponent,
  AssignmentJobComponent,
  ChangeRequestComponent,
  ViewJobDetailsComponent,
  WorkerProfileComponent,
  QuestionAnswerComponent,
  ClientDashboardComponent,
  PostProjectComponent,
  AddNewProjectComponent,
  JobsitesComponent,
  SubcontractorSelectionComponent,
  ReviewComponent,
  AddJobsiteComponent,
  AddLineItemComponent,
  AddMilestoneComponent,
  LineItemTemplateComponent,
  SafeHtmlPipe
];

@NgModule({

  declarations: [components, BidComparisionComponent, CloseOutPackageRequestComponent,
    InvoicesComponent, RatingAndReviewComponent, ClientProjectDetailsComponent,
    ClientJobsiteDetailsComponent, GetLineItemComponent, WorkerComparisonComponent,
    JobRatingAndReviewComponent, JobInvoiceComponent, ReviewAndOfferComponent, ClientJobTimeSheetComponent, PostJobComponent,
    WorkerSelectionComponent,
    PayDetailsComponent,
    JobDetailsComponent,
    ReviewConfirmComponent,
    ProjectBidingComparisonComponent,
    JobsiteBidingComparisonComponent,
    CompareLineItemComponent,
    AwardProjectComponent,
    AwardJobsiteComponent,
    ClientJobTimeSheetDetailsComponent,
    ProjectRatingReviewComponent,
    InviteeConfigurationComponent,
    JobListComponent,
    ProjectListComponent,
  ],

  imports: [
    CommonModule,
    ClientRoutingModule,
    PerfectScrollbarModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    DropdownModule,
    ButtonModule,
    DialogModule,
    CheckboxModule,
    NgxDropzoneModule,
    NgbModule,
    NgxSpinnerModule,
    NgxStarRatingModule,
    QuillModule,
    EditorModule,
    SelectButtonModule
  ],
  providers: [ConfirmDialogueService, PostJobServiceService, UserService],
})
export class ClientModule { }
