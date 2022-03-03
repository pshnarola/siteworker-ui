import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LeaderboardComponent } from 'src/app/shared/shared-leaderboard/leaderboard/leaderboard.component';
import { AddClientComponent } from './add-client/add-client.component';
import { AddCustomizedMsaClientComponent } from './add-customized-msa-client/add-customized-msa-client.component';
import { AddSubcontractorComponent } from './add-subcontractor/add-subcontractor.component';
import { AddWorkerComponent } from './add-worker/add-worker.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminComponent } from './admin.component';
import { ApproveClientComponent } from './approve-client/approve-client.component';
import { BidComparisonComponent } from './bid-comparison/bid-comparison.component';
import { CertificateComponent } from './certificate/certificate.component';
import { CityComponent } from './city/city.component';
import { CloseoutPackageComponent } from './closeout-package/closeout-package.component';
import { CompanyComponent } from './company/company.component';
import { DiversityCategoryComponent } from './diversity-category/diversity-category.component';
import { ExperienceComponent } from './experience/experience.component';
import { ClientGamificationConfigurationComponent } from './gamification-configuration/client-gamification-configuration/client-gamification-configuration.component';
import { GamificationConfigurationComponent } from './gamification-configuration/gamification-configuration.component';
import { SubcontractorGamificationConfigurationComponent } from './gamification-configuration/subcontractor-gamification-configuration/subcontractor-gamification-configuration.component';
import { WorkerGamificationConfigurationComponent } from './gamification-configuration/worker-gamification-configuration/worker-gamification-configuration.component';
import { IndustryTypeComponent } from './industry-type/industry-type.component';
import { JobDetailsComponent } from './job-details/job-details.component';
import { JobInvoicesComponent } from './job-invoices/job-invoices.component';
import { JobRateCardComponent } from './job-rate-card/job-rate-card.component';
import { JobRatingReviewsComponent } from './job-rating-reviews/job-rating-reviews.component';
import { JobSetMarginComponent } from './job-set-margin/job-set-margin.component';
import { JobTitleComponent } from './job-title/job-title.component';
import { JobsiteDetailsComponent } from './jobsite-details/jobsite-details.component';
import { LoginHistoryComponent } from './login-history/login-history.component';
import { ManageCertificatesSubcontractorComponent } from './manage-certificates-subcontractor/manage-certificates-subcontractor.component';
import { ManageCertificatesWorkerComponent } from './manage-certificates-worker/manage-certificates-worker.component';
import { ManageJobRateCardComponent } from './manage-job-rate-card/manage-job-rate-card.component';
import { ManageReferencesSubcontractorComponent } from './manage-references-subcontractor/manage-references-subcontractor.component';
import { ManageReferencesWorkerComponent } from './manage-references-worker/manage-references-worker.component';
import { MsaClientComponent } from './msa-client/msa-client.component';
import { MsaContentComponent } from './msa-content/msa-content.component';
import { PrimeNgComponent } from './prime-ng/prime-ng.component';
import { ProjectChangeRequestComponent } from './project-change-request/project-change-request.component';
import { ProjectDetailsComponent } from './project-details/project-details.component';
import { ProjectInvoicesComponent } from './project-invoices/project-invoices.component';
import { ProjectQuestionAndAnswerComponent } from './project-question-and-answer/project-question-and-answer.component';
import { ProjectRatingReviewsComponent } from './project-rating-reviews/project-rating-reviews.component';
import { ProjectSetMarginComponent } from './project-set-margin/project-set-margin.component';
import { RegionComponent } from './region/region.component';
import { AllReferencesComponent } from './reports/all-references/all-references.component';
import { ClientPaymentAgingReportComponent } from './reports/client-payment-aging-report/client-payment-aging-report.component';
import { RevenueReportComponent } from './reports/revenue-report/revenue-report.component';
import { SubcontractorInvoiceReportComponent } from './reports/subcontractor-invoice-report/subcontractor-invoice-report.component';
import { SubcontractorPayoutAgingReportComponent } from './reports/subcontractor-payout-aging-report/subcontractor-payout-aging-report.component';
import { W2WorkerInvoiceReportComponent } from './reports/w2-worker-invoice-report/w2-worker-invoice-report.component';
import { RichEditorComponent } from './rich-editor/rich-editor.component';
import { RxwebComponent } from './rxweb/rxweb.component';
import { ServiceComponent } from './service-component/service.component';
import { StateComponent } from './state/state.component';
import { TimesheetsComponent } from './timesheets/timesheets.component';
import { UomComponent } from './uom/uom.component';
import { ViewTimesheetDetailsComponent } from './view-timesheet-details/view-timesheet-details.component';
import { WorkerComparsionComponent } from './worker-comparsion/worker-comparsion.component';




export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        component: AdminComponent,
        children: [
            {
                path: 'certificate',
                component: CertificateComponent
            },
            {
                path: 'diversity-category',
                component: DiversityCategoryComponent
            },
            {
                path: 'service',
                component: ServiceComponent
            },
            {
                path: 'company',
                component: CompanyComponent
            },
            {
                path: 'experience',
                component: ExperienceComponent
            },
            {
                path: 'industry-type',
                component: IndustryTypeComponent
            },
            {
                path: 'job-title',
                component: JobTitleComponent
            },
            {
                path: 'region',
                component: RegionComponent
            },
            {
                path: 'state',
                component: StateComponent
            },
            {
                path: 'city',
                component: CityComponent
            },
            {
                path: 'uom',
                component: UomComponent
            },
            {
                path: 'content-msa',
                component: MsaContentComponent
            },
            {
                path: 'primeNg',
                component: PrimeNgComponent
            },
            {
                path: 'rxweb',
                component: RxwebComponent
            },
            {
                path: 'diversityCategory',
                component: DiversityCategoryComponent
            },
            {
                path: 'editor',
                component: RichEditorComponent
            },
            {
                path: 'client',
                component: AddClientComponent
            },
            {
                path: 'job-details',
                component: JobDetailsComponent
            },
            {
                path: 'worker-comparison',
                component: WorkerComparsionComponent
            },
            {
                path: 'timesheets',
                component: TimesheetsComponent
            },
            {
                path: 'timesheet-details',
                component: ViewTimesheetDetailsComponent
            },
            {
                path: 'invoices',
                component: JobInvoicesComponent
            },
            {
                path: 'rating-review',
                component: JobRatingReviewsComponent
            },
            {
                path: 'set-job-margin',
                component: JobSetMarginComponent
            },
            {
                path: 'project-details',
                component: ProjectDetailsComponent
            },
            {
                path: 'jobsite-details',
                component: JobsiteDetailsComponent
            },
            {
                path: 'closeout-package',
                component: CloseoutPackageComponent
            },
            {
                path: 'set-project-margin',
                component: ProjectSetMarginComponent
            },
            {
                path: 'project-question-and-answer',
                component: ProjectQuestionAndAnswerComponent
            },
            {
                path: 'project-change-request',
                component: ProjectChangeRequestComponent
            },
            {
                path: 'project-rating-review',
                component: ProjectRatingReviewsComponent
            },
            {
                path: 'project-invoices',
                component: ProjectInvoicesComponent
            },
            {
                path: 'bid-comparison',
                component: BidComparisonComponent
            },
            {
                path: 'job-ratecard',
                component: JobRateCardComponent
            },
            {
                path: 'manage-job-ratecard',
                component: ManageJobRateCardComponent
            },
            {
                path: 'subcontractor',
                component: AddSubcontractorComponent
            },
            {
                path: 'worker',
                component: AddWorkerComponent
            },
            {
                path: 'admin-users',
                component: AdminUsersComponent
            },
            {
                path: 'approve-client',
                component: ApproveClientComponent
            },
            {
                path: 'msa-client',
                component: MsaClientComponent
            },
            {
                path: 'add-customized-msa-client',
                component: AddCustomizedMsaClientComponent
            },
            {
                path: 'dashboard',
                component: AdminDashboardComponent
            },
            {
                path: 'manage-references-subcontractor',
                component: ManageReferencesSubcontractorComponent
            },
            {
                path: 'manage-references-worker',
                component: ManageReferencesWorkerComponent
            },
            {
                path: 'manage-certificate-subcontractor',
                component: ManageCertificatesSubcontractorComponent
            },
            {
                path: 'manage-certificate-worker',
                component: ManageCertificatesWorkerComponent
            },
            {
                path: 'all-references',
                component: AllReferencesComponent
            },
            {
                path: 'client-payment-report',
                component: ClientPaymentAgingReportComponent
            },
            {
                path: 'subcontractor-payout-report',
                component: SubcontractorPayoutAgingReportComponent
            },
            {
                path: 'revenue-report',
                component: RevenueReportComponent
            },
            {
                path: 'login-history',
                component: LoginHistoryComponent
            },
            {
                path: 'w2-worker-invoice-report',
                component: W2WorkerInvoiceReportComponent
            },
            {
                path: 'subcontractor-invoice-report',
                component: SubcontractorInvoiceReportComponent
            },
            {
                path: 'gamification-configuration',
                component: GamificationConfigurationComponent
            },
            {
                path: 'client-gamification-configuration',
                component: ClientGamificationConfigurationComponent
            },
            {
                path: 'subcontractor-gamification-configuration',
                component: SubcontractorGamificationConfigurationComponent
            },
            {
                path: 'worker-gamification-configuration',
                component: WorkerGamificationConfigurationComponent
            },
            {
                path: 'leader-board',
                component: LeaderboardComponent
            },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(ADMIN_ROUTES)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
