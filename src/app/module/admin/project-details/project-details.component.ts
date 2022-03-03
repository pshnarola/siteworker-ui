import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { ClipboardService } from 'ngx-clipboard';
import { Subscription } from 'rxjs';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-project-details',
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.css']
})
export class ProjectDetailsComponent implements OnInit {
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

  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'title' },
    { label: this.translator.instant('jobsite.description'), value: 'description' },
    { label: this.translator.instant('location'), value: 'location' },
    { label: this.translator.instant('city'), value: 'city' },
    { label: this.translator.instant('state'), value: 'state' },
    { label: this.translator.instant('zipcode'), value: 'zipCode' },
    { label: this.translator.instant('payment.milestone'), value: 'paymentMileStone.length' },
    { label: this.translator.instant('cost'), value: 'cost' },
    { label: this.translator.instant('bid.amount'), value: 'bidAmount' },
    { label: this.translator.instant('status'), value: 'status' },
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
    private captionChangeService: HeaderManagementService,
    private notificationService: UINotificationService,
    private _projectDetailService: ProjectDetailService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private clipboardService: ClipboardService
  ) {
    this.dataTableParam = new DataTableParam();
    this.dataTableParam = {
      offset: 0,
      size: 2,
      sortField: 'FIRST_NAME',
      sortOrder: 1,
      searchText: '{"ROLE_NAME": "SUPERVISOR"}'
    };
    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.addHideAllLabelSubject.next(false);
  }

  ngOnInit(): void {
    this.getSelectedProjectDetails();
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnDestroy(): void {
    this.projectJobSelectionService.addHideAllLabelSubject.next(true);
    this.subscription.unsubscribe();
  }

  getSelectedProjectDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      const project = this.localStorageService.getSelectedProjectObject();
      if (project) {

        if (project.id === 'pid') {
          this.isSelectedProject = false;
          this.projectDetail = null;
        }
        else {
          this.projectDetail = project;
          this.getProjectInviteeList();
          this.getProjectBidAmount();
          this.setJobsiteDetail(this.projectDetail);
          this.supervisor = this.projectDetail.supervisor;
          this.externalLink = CommonUtil.createExternalURLForProject(this.projectDetail.title, this.projectDetail.id);
          if (this.projectDetail !== null) {
            this.isSelectedProject = true;
          }
        }
      } else {
        this.isSelectedProject = false;
        this.projectDetail = null;
      }
    }));
  }

  setJobsiteDetail(projectDetail) {
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

  getProjectInviteeList(): void {
    this.filterMap.clear();
    this.filterMap.set('PROJECT_DETAIL_ID', this.projectDetail.id);
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);

    this.dataTableParam = {
      offset: this.offset,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this._projectDetailService.getAllProjectInvitee(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.projectInvitees = [];
          this.pendingResponseData = [];
          this.acceptedInvitations = [];
          this.projectInvitees = data.data.result;
          this.projectInvitees.forEach(invitees => {
            if (invitees.status === 'PENDING') {
              this.pendingResponseData.push(invitees);
            } else if (invitees.status === 'ACCEPTED' || invitees.status === 'ACCEPTED_PENDING') {
              this.acceptedInvitations.push(invitees);
            }
          });
        }
      });
  }

  getProjectBidAmount(): void {
    const filterMap = new Map();
    this._projectDetailService.getProjectBidAmount(this.projectDetail.id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.bidAmountOfProject = data.data;
        } else {
          this.bidAmountOfProject = null;
        }
      });
  }

  hidePaymentMileStoneDialog() {
    this.paymentMileStoneDialog = false;
  }

  showPaymentMileStoneDialog(list) {
    this.paymentMileStoneDialog = true;
    this.paymentMileStoneList = list;
  }

  hideAttachmentDialog() {
    this.AttachmentDialog = false;
    this.jobsiteId = null;
    this.AttachmentList = [];
  }

  showAttachmentDialog(list, id) {
    this.dialogHeader = 'Attachments';
    this.AttachmentDialog = true;
    this.AttachmentList = list;
    this.jobsiteId = id;
  }

  downloadAttachments() {
    this._projectDetailService.downloadJobsiteAttachments(this.jobsiteId).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/zip' });
        const fileName = 'jobsite-attachments.zip';
        saveAs(blob, fileName);
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  redirectToSubcontractor(id) {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_SUBCONTRACTOR_PROFILE + "?user=" + id);
  }

  onJobSiteClick(id) {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOBSITE + "?jobsite=" + id);
  }

  copyExternalLink() {
    this.clipboardService.copyFromContent(this.externalLink);
    this.notificationService.success('Copied to clipboard', '');
  }

}
