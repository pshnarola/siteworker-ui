import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { ClipboardService } from 'ngx-clipboard';
import { Subscription } from 'rxjs';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-preview-project-details-for-external-subcontractor',
  templateUrl: './preview-project-details-for-external-subcontractor.component.html',
  styleUrls: ['./preview-project-details-for-external-subcontractor.component.css']
})

export class PreviewProjectDetailsForExternalSubcontractorComponent implements OnInit {

  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords = 0;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;

  showMore = false;
  filterMap = new Map();
  lat;
  lng;
  status;
  queryParam;
  supervisorList;
  supervisor;
  projectDetail: ProjectDetail;
  projectInvitees = [];
  pendingResponseData = [];
  acceptedInvitations = [];
  isSelectedProject: boolean;
  selectedProject: any;
  subscription = new Subscription();

  dataTableParam: DataTableParam;
  globalFilter: string;
  offset: Number = 0;
  loggedInUserId: any;

  jobsiteDetailList = [];

  paymentMileStoneDialog = false;
  paymentMileStoneList = [];

  AttachmentDialog = false;
  AttachmentList = [];

  externalLink;

  projectId;

  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'title' },
    { label: this.translator.instant('jobsite.description'), value: 'description' },
    { label: this.translator.instant('location'), value: 'location' },
    { label: this.translator.instant('city'), value: 'city' },
    { label: this.translator.instant('state'), value: 'state' },
    { label: this.translator.instant('zipcode'), value: 'zipCode' },
    { label: this.translator.instant('payment.milestone'), value: 'paymentMileStone.length' },
    { label: this.translator.instant('cost'), value: 'cost' },
    // { label: this.translator.instant('bid.amount'), value: 'bidAmount' },
    // { label: this.translator.instant('status'), value: 'status' },
  ];

  paymentColumns = [
    { label: this.translator.instant('milestone.name'), value: 'name' },
    { label: this.translator.instant('line.item.and.closeout.package'), value: 'lineItem' },
    { label: this.translator.instant('amount.release'), value: 'cost' },
    { label: this.translator.instant('percentage'), value: 'percentage' },
  ];

  jobsiteId: any;
  dialogHeader: string;
  bidAmountOfProject;

  constructor(
    private translator: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private notificationService: UINotificationService,
    private projectDetailService: ProjectDetailService,
    private clipboardService: ClipboardService,
    @Inject(DOCUMENT) private document: Document,
    private renderer: Renderer2,
  ) {
    this.dataTableParam = new DataTableParam();
    this.dataTableParam = {
      offset: 0,
      size: 2,
      sortField: 'FIRST_NAME',
      sortOrder: 1,
      searchText: '{"ROLE_NAME": "SUPERVISOR"}'
    };
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.projectId = params.id;
        this.getSelectedProjectDetails();
      });
    this.renderer.setAttribute(this.document.body, 'class', 'subcontractor-theme');
  }


  getSelectedProjectDetails(): any {
    this.projectDetailService.getProjectByProjectIdForPublicURL(this.projectId).subscribe(res => {
      this.projectDetail = res.data;
      this.setJobsiteDetail(this.projectDetail);
      this.supervisor = this.projectDetail.supervisor;
      let host = window.location.hostname;
      let port = window.location.port;
      let protocol = window.location.protocol;
      this.externalLink = `${protocol}//${host}:${port}/#/preview/project-external-detail/?title=${this.projectDetail.title}&id=${this.projectDetail.id}`;
    });
  }

  setJobsiteDetail(projectDetail): any {
    const jobsites: any[] = projectDetail.jobsite;
    const jobsitesBidDetails: any[] = projectDetail.lstJobsiteBidDetail;
    jobsitesBidDetails.forEach(
      jbd => {
        jobsites.forEach(jobsite => {
          if (jobsite.id === jbd.jobSiteDetail.id) {
            jobsite.bidAmount = jbd.subContractorCost;
          }
        });
      }
    );
    this.jobsiteDetailList = jobsites;
  }

  downloadAttachments(): any {
    this.projectDetailService.downloadJobsiteAttachments(this.jobsiteId).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/zip' });
        const fileName = 'jobsite-attachments.zip';
        saveAs(blob, fileName);
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  prepareQueryParam(paramObject): any {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  public downloadProjectAttachment(attachments, id): any {
    this.projectDetailService.downloadProjectAttachments(id).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/zip' });
        const fileName = 'project-attachments.zip';
        saveAs(blob, fileName);
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  onTermsOfUseClick(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_TERMS_OF_USE);
  }

  onPrivacyPolicyClick(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_PRIVACY_POLICY);
  }

  onCookiePolicyClick(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.TERMLY_COOKIE_POLICY);
  }

  redirectToSignIn(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.LOGIN_PATH_FOR_EXTERNAL);
  }

  redirectToSignUp(): any {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.SIGNUP_PATH_FOR_EXTERNAL);
  }
  redirectToDashboard() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.WORDPRESS_WEBSITE);
  }

}
