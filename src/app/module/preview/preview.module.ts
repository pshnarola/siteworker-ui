import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { PreviewComponent } from './preview.component';
import { PreviewRoutingModule } from './preview-routing.module';
import { PreviewJobsiteDetailComponent } from './preview-jobsite-detail/preview-jobsite-detail.component';
import { PreviewWorkerProfileComponent } from './preview-worker-profile/preview-worker-profile.component';
import { PreviewSubcontractorProfileComponent } from './preview-subcontractor-profile/preview-subcontractor-profile.component';
import { PreviewClientProfileComponent } from './preview-client-profile/preview-client-profile.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { PreviewViewAllProjectComponent } from './preview-view-all-project/preview-view-all-project.component';
import { PreviewViewAllJobComponent } from './preview-view-all-job/preview-view-all-job.component';
import { ViewLineItemDeliverablesComponent } from './view-line-item-deliverables/view-line-item-deliverables.component';
import { PreviewViewAllRatingReviewsComponent } from './preview-view-all-rating-reviews/preview-view-all-rating-reviews.component';
import { PreviewViewAllReferencesComponent } from './preview-view-all-references/preview-view-all-references.component';
import { PreviewViewAllWorkExperienceComponent } from './preview-view-all-work-experience/preview-view-all-work-experience.component';
import { PreviewProjectDetailComponent } from './preview-project-detail/preview-project-detail.component';
import { ProjectInvoicesComponent } from './project-invoices/project-invoices.component';
import { ProjectRatingReviewsComponent } from './project-rating-reviews/project-rating-reviews.component';
import { JobInvoicesComponent } from './job-invoices/job-invoices.component';
import { ManageCertificatesWorkerComponent } from './manage-certificates-worker/manage-certificates-worker.component';
import { JobRatingReviewsComponent } from './job-rating-reviews/job-rating-reviews.component';
import { AddClientComponent } from './add-client/add-client.component';
import { AddWorkerComponent } from './add-worker/add-worker.component';
import { ManageCertificatesSubcontractorComponent } from './manage-certificates-subcontractor/manage-certificates-subcontractor.component';
import { AddSubcontractorComponent } from './add-subcontractor/add-subcontractor.component';
import { PendingClientJobComponent } from './pending-client-job/pending-client-job.component';
import { ReferenceCommentComponent } from './reference-comment/reference-comment.component';
import { PreviewJobsiteListComponent } from './preview-jobsite-list/preview-jobsite-list.component';
import { PreviewProjectDetailsForExternalSubcontractorComponent } from './preview-project-details-for-external-subcontractor/preview-project-details-for-external-subcontractor.component';
import { PreviewJobsiteDetailsForExternalSubcontractorComponent } from './preview-jobsite-details-for-external-subcontractor/preview-jobsite-details-for-external-subcontractor.component';
import { PreviewJobDetailsForExternalWorkerComponent } from './preview-job-details-for-external-worker/preview-job-details-for-external-worker.component';
import { PreviewWorkerProfileExternalComponent } from './external/preview-worker-profile-external/preview-worker-profile-external.component';
import { PreviewSubcontractorProfileExternalComponent } from './external/preview-subcontractor-profile-external/preview-subcontractor-profile-external.component';


const components = [
    PreviewComponent,
    PreviewJobsiteDetailComponent,
    ViewLineItemDeliverablesComponent,
    ProjectInvoicesComponent,
    ProjectRatingReviewsComponent,
    JobInvoicesComponent,
    ManageCertificatesWorkerComponent,
    ManageCertificatesSubcontractorComponent,
    JobRatingReviewsComponent,
    AddClientComponent,
    AddWorkerComponent,
    AddSubcontractorComponent,
    ReferenceCommentComponent
];

@NgModule({
    declarations: [components, PreviewWorkerProfileComponent, PreviewSubcontractorProfileComponent, PreviewClientProfileComponent, PrivacyPolicyComponent, TermsOfUseComponent, PreviewViewAllProjectComponent, PreviewViewAllJobComponent, PreviewViewAllRatingReviewsComponent, PreviewViewAllReferencesComponent, PreviewViewAllWorkExperienceComponent, PreviewProjectDetailComponent, PendingClientJobComponent, ReferenceCommentComponent, PreviewJobsiteListComponent, PreviewProjectDetailsForExternalSubcontractorComponent, PreviewJobsiteDetailsForExternalSubcontractorComponent, PreviewJobDetailsForExternalWorkerComponent, PreviewWorkerProfileExternalComponent, PreviewSubcontractorProfileExternalComponent],
    imports: [
        CommonModule,
        PreviewRoutingModule,
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    providers: [ConfirmDialogueService],
})
export class PreviewModule { }