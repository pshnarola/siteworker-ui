import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscriber } from 'rxjs';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ProjectBidService } from 'src/app/service/subcontractor-services/project-bid/project-bid.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { BidDetailInfoDTO } from '../../vos/BidInfoDTO';
import { ProjectBidDetail } from '../../vos/ProjectBidDetail';
import { SubmitBId } from '../../vos/SubmitBid';

@Component({
  selector: 'app-project-bid-review',
  templateUrl: './project-bid-review.component.html',
  styleUrls: ['./project-bid-review.component.css']
})
export class ProjectBidReviewComponent implements OnInit {

  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;
  totalRecords = 0;

  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'jobSiteDetail.title', sortable: true },
    { label: this.translator.instant('description'), value: 'jobSiteDetail.description', sortable: true },
    { label: this.translator.instant('city'), value: 'jobSiteDetail.city', sortable: true },
    { label: this.translator.instant('state'), value: 'jobSiteDetail.state', sortable: true },
    { label: this.translator.instant('zipcode'), value: 'jobSiteDetail.zipCode', sortable: true },
    { label: this.translator.instant('bid.amount'), value: 'subContractorCost', sortable: true },
    { label: this.translator.instant('document'), value: 'document', sortable: false },
  ];

  columnsOfProject = [
    { label: this.translator.instant('jobsite.title'), value: 'title', sortable: true },
    { label: this.translator.instant('description'), value: 'description', sortable: true },
    { label: this.translator.instant('city'), value: 'city', sortable: true },
    { label: this.translator.instant('state'), value: 'state', sortable: true },
    { label: this.translator.instant('zipcode'), value: 'zipCode', sortable: true },
    { label: this.translator.instant('document'), value: 'document', sortable: false },
  ];

  loggedInUser: any;
  loggedInUserId: any;

  filterMap = new Map();
  globalFilter;
  offset = 0;
  size = 10;
  datatableParam: DataTableParam;
  projectDetailToBid: any;

  projectBidDetailDto: ProjectBidDetail;
  bidDetailInfoDTO: BidDetailInfoDTO;
  subscription = new Subscriber();

  selectedJobsitesToBid;

  selectedJobsitesOfWholeProject;

  submitBidDetail: SubmitBId;



  queryParam: URLSearchParams;
  sortOrder: number = 0;
  sortField: any = "created_date";
  listofjobsitesTocalculateBidAmount: any;

  constructor(
    private translator: TranslateService,
    private router: Router,
    private _projectDetailService: ProjectDetailService,
    private notificationService: UINotificationService,
    private localStorageService: LocalStorageService,
    private projectBidService: ProjectBidService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private _notificationService: UINotificationService,
  ) {
    this.projectJobSelectionService.addHideAllLabelSubject.next(false);
    this.loggedInUser = this.localStorageService.getLoginUserObject();
    this.loggedInUserId = this.localStorageService.getLoginUserId();
  }

  ngOnInit(): void {
    this.projectJobSelectionService.addHideAllLabelSubject.next(false);
    this.getSelectedProjectDetails();
  }

  ngOnDestroy(): void {
    this.projectJobSelectionService.addHideAllLabelSubject.next(true);
    this.subscription.unsubscribe();
  }

  previous() {
    this.router.navigate([PATH_CONSTANTS.BID_QUOTATION]);
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getSelectedProjectDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      const project = this.localStorageService.getSelectedProjectObject();
      if (project.id === 'pid') {
        this.projectDetailToBid = null;
      }
      else {
        this.projectDetailToBid = project;
        this.selectedJobsitesToBid = [];
        this.projectBidDetailDto = null;
        this.bidDetailInfoDTO = null;
        this.getProjectBidDetailByIdAndUserId();

      }
    }));
  }

  getProjectBidDetailByIdAndUserId() {
    this.projectBidService.getBiddedDataOfProjectAndListOfJobsite(this.projectDetailToBid.id, this.loggedInUserId).subscribe(
      data => {

        if (data.statusCode === '200') {
          if (data.data.projectBidDetail.hasBiddedOnProject) {
            this.projectBidDetailDto = data.data.projectBidDetail;
            this.selectedJobsitesOfWholeProject = this.projectBidDetailDto.projectDetail.jobsite;
          } else if (!data.data.projectBidDetail.hasBiddedOnProject && data.data.projectBidDetail.biddingType === "BY_PROJECT") {
            this.projectBidDetailDto = data.data.projectBidDetail;
            this.listofjobsitesTocalculateBidAmount = data.data.selectedJobSiteBidDetails;
            this.selectedJobsitesOfWholeProject = this.projectBidDetailDto.projectDetail.jobsite;
          } else if (data.data.selectedJobSites) {
            this.getJobsiteBidDetailByIdAndUserId();
          }
        }
        else {
          this.projectBidDetailDto = new ProjectBidDetail();
        }
      });
  }

  calculateBidAmountForProjectType() {
    let total = 0;
    this.listofjobsitesTocalculateBidAmount.forEach(element => {
      total += element.subContractorCost;
    });
    return total;
  }

  getJobsiteBidDetailByIdAndUserId() {
    let filterMap = new Map();
    filterMap.set('SUBCONTRACTOR_ID', this.loggedInUserId);
    filterMap.set('PROJECT_ID', this.projectDetailToBid.id);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: 10000,
      sortField: "CREATED_DATE",
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.projectBidService.getAllJobsitetBidDetail(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.data.result.length !== 0) {
            this.bidDetailInfoDTO = data.data.result;

            this.selectedJobsitesToBid = this.bidDetailInfoDTO;
          } else {
            this.bidDetailInfoDTO = new BidDetailInfoDTO();
          }
        }
      });
  }

  calculateTotalBId() {
    let total = 0;
    this.selectedJobsitesToBid.forEach(element => {
      total += element.subContractorCost
    });
    return total;
  }

  downloadAttachments(id) {
    this._projectDetailService.downloadJobsiteAttachments(id).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/zip' });
        const fileName = "jobsite-attachments.zip";
        saveAs(blob, fileName);
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  submitBid() {
    if (this.bidDetailInfoDTO) {
      this.submitBidDetail = new SubmitBId()
      this.submitBidDetail.projectId = this.projectDetailToBid.id;
      this.submitBidDetail.subContractorId = this.loggedInUserId;
      this.submitBidDetail.isBiddedOnWholeProject = false;
      this.submitBidDetail.jobSiteBidDetails = this.selectedJobsitesToBid;

      this.projectBidService.submitBid(this.submitBidDetail).subscribe(
        data => {
          if (data.statusCode === '200') {
            this.notificationService.success('Bid Submitted', '');
            this.goToProjectList();
          } else {
            this.notificationService.error(data.errorCode, '');

          }
        });
    } else if (!this.bidDetailInfoDTO && this.projectBidDetailDto) {
      this.submitBidDetail = new SubmitBId();
      this.submitBidDetail.projectId = this.projectDetailToBid.id;
      this.submitBidDetail.subContractorId = this.loggedInUserId;
      this.submitBidDetail.isBiddedOnWholeProject = true;

      this.projectBidService.submitBid(this.submitBidDetail).subscribe(
        data => {
          if (data.statusCode === '200') {
            this.notificationService.success('Bid Submitted', '');
            this.goToProjectList();
          } else {
            this.notificationService.error(data.errorCode, '');

          }
        });
    }
  }

  goToProjectList() {
    this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_PROJECT_LIST]);
  }

}
