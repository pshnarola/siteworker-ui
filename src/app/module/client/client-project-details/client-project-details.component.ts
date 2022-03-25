import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { ClipboardService } from 'ngx-clipboard';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UserService } from 'src/app/service/User.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { ProjectDetail } from '../Vos/projectDetailmodel';

@Component({
  selector: 'app-client-project-details',
  templateUrl: './client-project-details.component.html',
  styleUrls: ['./client-project-details.component.css']
})
export class ClientProjectDetailsComponent implements OnInit {
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;

  showMore = false;
  filterMap = new Map();
  projectDetailForm: FormGroup;
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
  filteredStatus: any[];
  filteredSupervisor: any[];

  jobsiteDetailList = [];

  bidAmountOfProject;

  paymentMileStoneDialog = false;
  paymentMileStoneList = [];

  AttachmentDialog = false;
  AttachmentList = [];
  jobsiteId: any;
  dialogHeader: string;

  statusList = [
    { label: 'Canceled', value: 'CANCELLED' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'In Progress', value: 'IN_PROGRESS' },
  ];

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

  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords = 0;

  globalFilter: string;
  offset: Number = 0;
  disableStatusFlag1: boolean = false;
  disableStatusFlag: boolean = false;
  statusFlag: boolean;
  changeStatusParam: { id: any; status: any; };
  supervisorParam: { projectDetailId: any; supervisorId: any; };
  loggedInUserId: any;
  roleName: any;
  externalLink: string;

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private userService: UserService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private _projectDetailService: ProjectDetailService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private confirmDialogService: ConfirmDialogueService,
    private clipboardService: ClipboardService
  ) {
    this.loggedInUserId = this.localStorageService.getLoginUserId();

    this.dataTableParam = new DataTableParam();
    this.dataTableParam = {
      offset: 0,
      size: 2,
      sortField: 'FIRST_NAME',
      sortOrder: 1,
      searchText: '{"ROLE_NAME": "SUPERVISOR"}'
    };
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.getSupervisorList();
    this.initializeForm();
    this.getSelectedProjectDetails();
    this.checkRoleOfUser();
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  checkRoleOfUser() {
    let loggedInUser = this.localStorageService.getLoginUserObject();
    this.roleName = loggedInUser.roles[0].roleName;
  }

  redirectToSubcontractor(id) {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_SUBCONTRACTOR_PROFILE + "?user=" + id);
  }

  onJobSiteClick(id) {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOBSITE + "?jobsite=" + id);
  }

  initializeForm(): void {
    this.projectDetailForm = this.formBuilder.group({
      id: [],
      status: []
    });
  }

  filterStatus(event): void {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.statusList.length; i++) {
      const statusData = this.statusList[i];
      if (statusData.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(statusData);
      }
    }
    this.filteredStatus = filtered;
    this.filteredStatus = this.filteredStatus.sort();
  }

  filterSupervisor(event): void {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.supervisorList.length; i++) {
      let supervisor = this.supervisorList[i];
      if (supervisor.firstName.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(supervisor);
      }
    }
    this.filteredSupervisor = filtered;
    this.filteredSupervisor = this.filteredSupervisor.sort();
  }
  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getSupervisorList(): void {
    this.userService.getSupervisorByClientAndIsActive(this.loggedInUserId).subscribe(data => {
      this.supervisorList = data.data;
    });
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
          this.supervisor = this.projectDetail.supervisor;
          this.externalLink = CommonUtil.createExternalURLForProject(this.projectDetail.title, this.projectDetail.id);
          this.setJobsiteDetail(this.projectDetail);
          this.getProjectBidAmount();
          if (this.projectDetail !== null) {
            this.isSelectedProject = true;
            if (this.projectDetail.status === 'COMPLETED' || this.projectDetail.status === 'CANCELLED' || this.projectDetail.status === 'DRAFT' || this.projectDetail.status === 'AWARDED') {
              this.disableStatusFlag1 = true;
            } else {
              this.disableStatusFlag1 = false;
              this.disableStatusFlag = false;
            }
            if (this.projectDetail.status === 'IN_PROGRESS') {
              this.statusList = [
                { label: 'Canceled', value: 'CANCELLED' },
                { label: 'Completed', value: 'COMPLETED' }
              ];
            }
            else {
              this.statusList = [
                { label: 'Canceled', value: 'CANCELLED' },
                { label: 'Completed', value: 'COMPLETED' },
                { label: 'In Progress', value: 'IN_PROGRESS' },
              ];
            }
          }
          this.getProjectInviteeList();
        }
      } else {
        this.isSelectedProject = false;
        this.projectDetail = null;
      }
    }));
  }

  setJobsiteDetail(projectDetail) {
    const jobsites: any[] = projectDetail.jobsite;
    const jobsitesBidDetails: any[] = projectDetail.lstJobsiteBidDetail ? projectDetail.lstJobsiteBidDetail : [];

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

  openDialog(event): void {
    let options = null;
    let message;
    message = this.translator.instant('are.you.sure.you.want.to.change.the.status.project');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.setStatus(event);
      }
      else {
        let currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }

  openSupervisorDialog(projectId, event): void {
    let options = null;
    let message;
    message = this.translator.instant('are.you.sure.you.want.to.assign.the.supervisor.project');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.assignSupervisor(projectId, event);
      }
      else {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });

  }

  assignSupervisor(projectId, event): void {
    this.statusFlag = false;
    this.supervisorParam = {
      projectDetailId: projectId,
      supervisorId: event.id
    }
    this.queryParam = this.prepareQueryParam(this.supervisorParam);
    this._projectDetailService.assignSupervisor(this.queryParam).subscribe(data => {
      if (data.message === 'OK' && data.statusCode === '200') {
        this.localStorageService.setItem('selectedProject', data.data);
        this.projectJobSelectionService.addProjectSubject.next(data.data);
        this.notificationService.success(this.translator.instant('project.assigned.to.supervisor'), '');
      }
    });
  }

  setStatus(status): void {
    this.statusFlag = true;
    this.status = status.value;
    if (this.status === 'IN_PROGRESS') {
      this.statusList = [
        { label: 'Canceled', value: 'CANCELLED' },
        { label: 'Completed', value: 'COMPLETED' }
      ];
    }
    if (this.status === 'CANCELLED' || this.status === 'COMPLETED') {
      this.disableStatusFlag = true;
    }
    else {
      this.disableStatusFlag = false;
    }
    this.changeStatusParam = {
      id: this.projectDetail.id,
      status: this.status
    };
    this.queryParam = this.prepareQueryParam(this.changeStatusParam);
    this._projectDetailService.setStatus(this.queryParam).subscribe(data => {
      if (data.message === 'OK' && data.statusCode === '200') {
        this.localStorageService.setItem('selectedProject', data.data);
        this.projectJobSelectionService.addProjectSubject.next(data.data);
        this.notificationService.success(this.translator.instant('project.status.updated'), '');
      }
    });
  }

  getFullName(data: User) {
    if (data !== null) {
      return data.firstName + ' ' + data.lastName;
    }
  }

  inviteSubContractor() {
    this.localStorageService.setItem("addProjectDetail", this.projectDetail);
    this.localStorageService.setItem("currentProjectStep", 4);
    this.localStorageService.setItem('inviteSubcontractor', true);
    this.router.navigate(['/client/inviteSubContractor']);
  }

  copyExternalLink() {
    this.clipboardService.copyFromContent(this.externalLink);
    this.notificationService.success('Copied to clipboard', '');
  }

}
