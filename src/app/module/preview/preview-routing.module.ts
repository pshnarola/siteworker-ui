import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddClientComponent } from './add-client/add-client.component';
import { AddSubcontractorComponent } from './add-subcontractor/add-subcontractor.component';
import { AddWorkerComponent } from './add-worker/add-worker.component';
import { PreviewSubcontractorProfileExternalComponent } from './external/preview-subcontractor-profile-external/preview-subcontractor-profile-external.component';
import { PreviewWorkerProfileExternalComponent } from './external/preview-worker-profile-external/preview-worker-profile-external.component';
import { JobInvoicesComponent } from './job-invoices/job-invoices.component';
import { JobRatingReviewsComponent } from './job-rating-reviews/job-rating-reviews.component';
import { ManageCertificatesSubcontractorComponent } from './manage-certificates-subcontractor/manage-certificates-subcontractor.component';
import { ManageCertificatesWorkerComponent } from './manage-certificates-worker/manage-certificates-worker.component';
import { PendingClientJobComponent } from './pending-client-job/pending-client-job.component';
import { PreviewClientProfileComponent } from './preview-client-profile/preview-client-profile.component';
import { PreviewJobDetailsForExternalWorkerComponent } from './preview-job-details-for-external-worker/preview-job-details-for-external-worker.component';
import { PreviewJobsiteDetailComponent } from './preview-jobsite-detail/preview-jobsite-detail.component';
import { PreviewJobsiteListComponent } from './preview-jobsite-list/preview-jobsite-list.component';
import { PreviewProjectDetailComponent } from './preview-project-detail/preview-project-detail.component';
import { PreviewProjectDetailsForExternalSubcontractorComponent } from './preview-project-details-for-external-subcontractor/preview-project-details-for-external-subcontractor.component';
import { PreviewSubcontractorProfileComponent } from './preview-subcontractor-profile/preview-subcontractor-profile.component';
import { PreviewViewAllJobComponent } from './preview-view-all-job/preview-view-all-job.component';
import { PreviewViewAllProjectComponent } from './preview-view-all-project/preview-view-all-project.component';
import { PreviewViewAllRatingReviewsComponent } from './preview-view-all-rating-reviews/preview-view-all-rating-reviews.component';
import { PreviewViewAllReferencesComponent } from './preview-view-all-references/preview-view-all-references.component';
import { PreviewViewAllWorkExperienceComponent } from './preview-view-all-work-experience/preview-view-all-work-experience.component';
import { PreviewWorkerProfileComponent } from './preview-worker-profile/preview-worker-profile.component';
import { PreviewComponent } from './preview.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { ProjectInvoicesComponent } from './project-invoices/project-invoices.component';
import { ProjectRatingReviewsComponent } from './project-rating-reviews/project-rating-reviews.component';
import { ReferenceCommentComponent } from './reference-comment/reference-comment.component';
import { TermsOfUseComponent } from './terms-of-use/terms-of-use.component';
import { ViewLineItemDeliverablesComponent } from './view-line-item-deliverables/view-line-item-deliverables.component';

export const PREVIEW_ROUTING: Routes = [
    {
        path: '',
        component: PreviewComponent,
        children: [
            {
                path: 'jobsite',
                component: PreviewJobsiteDetailComponent
            },
            {
                path: 'worker-profile-detail',
                component: PreviewWorkerProfileComponent
            },
            {
                path: 'preview-worker-profile-detail',
                component: PreviewWorkerProfileExternalComponent
            },
            {
                path: 'subcontractor-profile-detail',
                component: PreviewSubcontractorProfileComponent
            },
            {
                path: 'preview-subcontractor-profile-detail',
                component: PreviewSubcontractorProfileExternalComponent
            },
            {
                path: 'client-profile-detail',
                component: PreviewClientProfileComponent
            },
            {
                path: 'privacy-policy',
                component: PrivacyPolicyComponent
            },
            {
                path: 'terms-of-use',
                component: TermsOfUseComponent
            },
            {
                path: 'view-all-project',
                component: PreviewViewAllProjectComponent
            },
            {
                path: 'view-all-job',
                component: PreviewViewAllJobComponent
            },
            {
                path: 'view-line-item-deliverables',
                component: ViewLineItemDeliverablesComponent
            },
            {
                path: 'view-all-rating-review',
                component: PreviewViewAllRatingReviewsComponent
            },
            {
                path: 'view-all-references',
                component: PreviewViewAllReferencesComponent
            },
            {
                path: 'view-all-work-experience',
                component: PreviewViewAllWorkExperienceComponent
            },
            {
                path: 'project-detail',
                component: PreviewProjectDetailComponent
            },
            {
                path: 'project-invoices',
                component: ProjectInvoicesComponent
            },
            {
                path: 'project-rating-and-review',
                component: ProjectRatingReviewsComponent
            },
            {
                path: 'job-invoices',
                component: JobInvoicesComponent
            },
            {
                path: 'manage-worker-certificates',
                component: ManageCertificatesWorkerComponent
            },
            {
                path: 'manage-subcontractor-certificates',
                component: ManageCertificatesSubcontractorComponent
            },
            {
                path: 'job-rating-and-review',
                component: JobRatingReviewsComponent
            },
            {
                path: 'client-list',
                component: AddClientComponent
            },
            {
                path: 'worker-list',
                component: AddWorkerComponent
            },

            {
                path: 'subcontractor-list',
                component: AddSubcontractorComponent
            },
            {
                path: 'client-list-job',
                component: PendingClientJobComponent
            },
            {
                path: 'references-comment',
                component: ReferenceCommentComponent
            },
            {
                path: 'jobsite-list',
                component: PreviewJobsiteListComponent
            },
            {
                path: 'project-external-detail',
                component: PreviewProjectDetailsForExternalSubcontractorComponent
            },
            {
                path: 'job-external-detail',
                component: PreviewJobDetailsForExternalWorkerComponent
            }

        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(PREVIEW_ROUTING)],
    exports: [RouterModule]
})
export class PreviewRoutingModule { }