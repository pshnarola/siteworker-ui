import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { QuillModule } from 'ngx-quill';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
// import { EditorModule } from '@bit/primefaces.primeng.editor';
import { EditorModule } from 'primeng/editor';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { UserService } from 'src/app/service/User.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { AddClientComponent } from './add-client/add-client.component';
import { AddCustomizedMsaClientComponent } from './add-customized-msa-client/add-customized-msa-client.component';
import { AddSubcontractorComponent } from './add-subcontractor/add-subcontractor.component';
import { AddWorkerComponent } from './add-worker/add-worker.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { AdminComponent } from './admin.component';
import { AdminRoutingModule } from './admin.routing';
import { ApproveClientComponent } from './approve-client/approve-client.component';
import { BidComparisonComponent } from './bid-comparison/bid-comparison.component';
import { CompareLineItemComponent } from './bid-comparison/compare-line-item/compare-line-item.component';
import { JobsiteBiddingComparsionComponent } from './bid-comparison/jobsite-bidding-comparsion/jobsite-bidding-comparsion.component';
import { ProjectBiddingComparsionComponent } from './bid-comparison/project-bidding-comparsion/project-bidding-comparsion.component';
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
import { IcJobTitleComponent } from './job-title/ic-job-title/ic-job-title.component';
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
import { ReportsComponent } from './reports/reports.component';
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


// tslint:disable-next-line: max-line-length
const components = [
  AdminComponent,
  CertificateComponent,
  RegionComponent,
  RxwebComponent,
  CityComponent,
  StateComponent,
  UomComponent,
  MsaContentComponent,
  PrimeNgComponent,
  ServiceComponent,
  DiversityCategoryComponent,
  CompanyComponent,
  JobTitleComponent,
  IcJobTitleComponent,
  IndustryTypeComponent,
  ExperienceComponent,
  RichEditorComponent,
  AddClientComponent,
  AddSubcontractorComponent,
  LoginHistoryComponent
];

@NgModule({
  declarations: [components,
    JobDetailsComponent,
    WorkerComparsionComponent,
    TimesheetsComponent,
    JobInvoicesComponent,
    JobRatingReviewsComponent,
    JobSetMarginComponent,
    ProjectDetailsComponent,
    JobsiteDetailsComponent,
    CloseoutPackageComponent,
    ProjectSetMarginComponent,
    ProjectQuestionAndAnswerComponent,
    ProjectChangeRequestComponent,
    ProjectRatingReviewsComponent,
    ProjectInvoicesComponent,
    BidComparisonComponent,
    ProjectBiddingComparsionComponent,
    JobsiteBiddingComparsionComponent,
    CompareLineItemComponent,
    JobRateCardComponent,
    ManageJobRateCardComponent,
    AddWorkerComponent,
    AdminUsersComponent,
    ApproveClientComponent,
    MsaClientComponent,
    AddCustomizedMsaClientComponent,
    AdminDashboardComponent,
    ManageReferencesSubcontractorComponent,
    ManageCertificatesSubcontractorComponent,
    ManageCertificatesWorkerComponent,
    ManageReferencesWorkerComponent,
    ReportsComponent,
    AllReferencesComponent,
    ClientPaymentAgingReportComponent,
    SubcontractorPayoutAgingReportComponent,
    RevenueReportComponent,
    ViewTimesheetDetailsComponent,
    W2WorkerInvoiceReportComponent,
    SubcontractorInvoiceReportComponent,
    GamificationConfigurationComponent,
    WorkerGamificationConfigurationComponent,
    SubcontractorGamificationConfigurationComponent,
    ClientGamificationConfigurationComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    PerfectScrollbarModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    DropdownModule,
    ButtonModule,
    DialogModule,
    NgxSpinnerModule,
    QuillModule,
    EditorModule,
    NgxDropzoneModule,
    MultiSelectModule,
    SelectButtonModule
  ],
  providers: [ConfirmDialogueService, UserService],
})
export class AdminModule { }
