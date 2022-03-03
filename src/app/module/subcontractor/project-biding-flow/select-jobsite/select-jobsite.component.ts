import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscriber } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { JobsiteDetailWithoutProject } from 'src/app/module/client/Vos/JobsiteDetailWithoutProject';
import { ProjectDetail } from 'src/app/module/client/Vos/projectDetailmodel';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ProjectBidService } from 'src/app/service/subcontractor-services/project-bid/project-bid.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { BidStatus } from '../../enums/BidStatusenum';
import { ApplyBidDetailDTO } from '../../vos/ApplyBidDetailDTO';
import { ProjectBidDetail } from '../../vos/ProjectBidDetail';


@Component({
  selector: 'app-select-jobsite',
  templateUrl: './select-jobsite.component.html',
  styleUrls: ['./select-jobsite.component.css']
})
export class SelectJobsiteComponent implements OnInit, OnDestroy {
  showMore = false;
  id: any;
  projectDetailToBid: ProjectDetail;
  selectedProjectToBid: ProjectDetail[] = [];

  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;
  totalRecords: any;
  isJobsiteSelected = false;
  selectedJobsites = [];
  disableJobsite = false;
  isBidCompleted = false;
  checked = false;
  filterMap = new Map();
  globalFilter: any;
  offset = 0;
  datatableParam: DataTableParam;
  queryParam: URLSearchParams;
  sortOrder = 0;
  count = 0;
  sortField: any = 'created_date';
  appliedOn = '';
  headerchecked = false;

  projectBidDetail: ProjectBidDetail;
  projectBidDetailDto: ProjectBidDetail;
  applyBidDetailDTO: ApplyBidDetailDTO;

  subscription = new Subscriber();

  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'title', sortable: true },
    { label: this.translator.instant('description'), value: 'description', sortable: true },
    { label: this.translator.instant('city'), value: 'city', sortable: true },
    { label: this.translator.instant('state'), value: 'state', sortable: true },
    { label: this.translator.instant('zipcode'), value: 'zipCode', sortable: true },
    { label: this.translator.instant('cost'), value: 'cost', sortable: true },
    { label: this.translator.instant('bid.status'), value: 'cost', sortable: true },
    { label: this.translator.instant('document'), value: 'document', sortable: false },
  ];

  isSelectedProject: boolean;
  loggedInUser: any;
  loggedInUserId: any;
  jobSiteDetailList: JobsiteDetailWithoutProject[] = [];
  bidStatus: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private captionChangeService: HeaderManagementService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private _projectDetailService: ProjectDetailService,
    private projectBidService: ProjectBidService,
    private localStorageService: LocalStorageService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private _notificationService: UINotificationService,
    private confirmDialogueService: ConfirmDialogueService
  ) {
    // let fullProjectDetail = this.localStorageService.getItem('selectedFullProjectDetail');
    this.projectBidDetailDto = new ProjectBidDetail();
    this.captionChangeService.hideHeaderSubject.next(true);
    // this.projectJobSelectionService.addHideAllLabelSubject.next(false);
    // this.projectJobSelectionService.setSelectedProject.next(fullProjectDetail);
    this.loggedInUser = this.localStorageService.getLoginUserObject();
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.id = params.bidProject;
        // this.getProjectById(this.id);
      });
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.getSelectedProjectDetails();
    // this.projectJobSelectionService.addHideAllLabelSubject.next(false);
  }

  ngOnDestroy(): void {
    this.localStorageService.removeItem('viewMoreProjectDetail');
    this.subscription.unsubscribe();
  }

  getSelectedDataToBid() {
    if (this.localStorageService.getItem('selectedProjectToBid')) {
      const project = this.localStorageService.getItem('selectedProjectToBid');
      if (this.id === project.id) {
        this.selectedJobsites = this.localStorageService.getItem('selectedJobsiteToBid');
      } else {
      }
    } else {
    }
  }

  getSelectedProjectDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      let project: ProjectDetail;
      // if (data) {
      //   project = data as ProjectDetail;
      //   if (project.id === 'pid') {
      //     this.isSelectedProject = false;
      //     this.projectDetailToBid = null;
      //   }
      //   else {
      //     this.projectDetailToBid = project;
      //     this.selectedJobsites = [];
      //     console.log(this.projectDetailToBid);
      //     this.setJobsite();
      //   }
      // }
      // else
      if (this.localStorageService.getSelectedProjectObject()) {
        project = this.localStorageService.getSelectedProjectObject();
        if (project.id === 'pid') {
          this.isSelectedProject = false;
          this.projectDetailToBid = null;
        }
        else {
          this.projectDetailToBid = project;
          this.selectedJobsites = [];
          this.setJobsite();
        }
      }

    }));
  }

  setJobsite() {
    const tempList = [];
    this.projectDetailToBid.jobsite.forEach(
      data => {
        const iterableJobsite = { ...data, isSelected: false, isBidCompleted: false, bidStatus: null };
        tempList.push(iterableJobsite as JobsiteDetailWithoutProject);
      });
    this.jobSiteDetailList = tempList;
    this.getProjectByIdAndUserId();
  }

  validateProjectIsUpdated(isProjectType: boolean): any {
    const projectId = this.projectDetailToBid.id;
    const updatedDate = this.projectDetailToBid.updatedDate;
    this.projectBidService.validateProjectOrJobsiteisUptodate(projectId).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (data.data) {
            const updatedDateFromDb = data.data;
            if (updatedDate === updatedDateFromDb) {
              if (isProjectType) {
                this.applyOnProject();
              } else {
                this.applyOnSelectedJobsite();
              }
            } else {
              this.openDialogToReapply();
            }
          } else {
            this._notificationService.error(data.message, '');
            setTimeout(() => {
              this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_PROJECT_LIST]);
            }, 2000);
          }
        } else {
          this._notificationService.error(data.message, '');
          setTimeout(() => {
            this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_PROJECT_LIST]);
          }, 2000);
        }
      });
  }


  openDialogToReapply(): void {
    let options = null;
    options = {
      title: 'Project details changed',
      message: 'While bidding, project details have been updated by client. Please reapply after verifying updated details.',
      confirmText: this.translator.instant('dialog.confirm.text'),
    };
    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        setTimeout(() => {
          this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_PROJECT_LIST]);
        }, 1000);
      }
    });
  }

  applyOnProject() {
    if (this.projectBidDetailDto.id !== undefined) {
      this.projectBidDetail = new ProjectBidDetail();
      this.applyBidDetailDTO = new ApplyBidDetailDTO();
      this.projectBidDetail.projectDetail = this.projectDetailToBid;
      this.projectBidDetail.subContractor = this.loggedInUser;
      this.projectBidDetail.biddingType = 'BY_PROJECT';
      this.projectBidDetail.status = 'STARTED';
      this.applyBidDetailDTO.projectBidDetail = this.projectBidDetail;
      this.projectBidService.addProjectBidDetail(this.applyBidDetailDTO).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('applied.project'), '');
            this.getProjectByIdAndUserId();
            // if (this.selectedJobsites.length > 0) {
            //   this.localStorageService.setSelectedJobsitesForBidQuotation(this.selectedJobsites);
            // } else {
            this.localStorageService.setSelectedJobsitesForBidQuotation(this.projectBidDetail.projectDetail.jobsite);
            // }
            this.projectJobSelectionService.refreshBidQuotatiionSideBarForJobsite.next();
            this.localStorageService.setItem('selectedProjectToBid', this.applyBidDetailDTO);
            this.router.navigate([PATH_CONSTANTS.BID_QUOTATION]);
          } else {
            this._notificationService.error(data.message, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          console.log(error);
        }
      );
    }
    else {
      this.projectBidDetail = new ProjectBidDetail();
      this.applyBidDetailDTO = new ApplyBidDetailDTO();
      this.projectBidDetail.projectDetail = this.projectDetailToBid;
      this.projectBidDetail.subContractor = this.loggedInUser;
      this.projectBidDetail.biddingType = 'BY_PROJECT';
      this.projectBidDetail.status = 'STARTED';
      this.applyBidDetailDTO.projectBidDetail = this.projectBidDetail;
      this.projectBidService.addProjectBidDetail(this.applyBidDetailDTO).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('applied.project'), '');
            this.getProjectByIdAndUserId();
            if (this.selectedJobsites.length > 0) {
              this.localStorageService.setSelectedJobsitesForBidQuotation(this.selectedJobsites);
            } else {
              this.localStorageService.setSelectedJobsitesForBidQuotation(this.projectBidDetail.projectDetail.jobsite);
            }
            this.projectJobSelectionService.refreshBidQuotatiionSideBarForJobsite.next();
            this.localStorageService.setItem('selectedProjectToBid', this.applyBidDetailDTO);
            this.router.navigate([PATH_CONSTANTS.BID_QUOTATION]);
          } else {
            this._notificationService.error(data.message, '');
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          console.log(error);

        }
      );
    }

  }

  getProjectByIdAndUserId() {
    this.projectBidService.getBiddedDataOfProjectAndListOfJobsite(this.projectDetailToBid.id, this.loggedInUserId).subscribe(
      data => {
        this.headerchecked = false;
        this.selectedJobsites = [];
        this.count = 0;
        if (data.statusCode === '200') {
          if (data.data.projectBidDetail) {
            this.projectBidDetailDto = data.data.projectBidDetail;
            this.appliedOn = this.projectBidDetailDto.biddingType;
            if (this.appliedOn === 'BY_PROJECT') {
              const list = [];
              if ((this.projectBidDetailDto.hasBiddedOnProject) ||
                (!this.projectBidDetailDto.hasBiddedOnProject && data.data.selectedJobSiteBidDetails.length == 0)) {
                this.jobSiteDetailList.forEach(
                  q => {
                    this.projectBidDetailDto.projectDetail.jobsite.forEach(element => {
                      if (q.id === element.id) {
                        q.isSelected = true;
                        list.push(q as JobsiteDetailWithoutProject);
                      }
                    });
                  });
                this.headerchecked = true;
                this.selectedJobsites = list;
                this.disableJobsite = true;
                this.localStorageService.setSelectedJobsitesForBidQuotation(this.selectedJobsites);

              } else if (!this.projectBidDetailDto.hasBiddedOnProject) {
                this.jobSiteDetailList.forEach(
                  q => {
                    data.data.selectedJobSiteBidDetails.forEach((element: { jobSiteDetail: { id: any; }; isJobSiteBidCompleted: any; }) => {
                      if (q.id === element.jobSiteDetail.id) {
                        q.isSelected = true;
                        q.isBidCompleted = element.isJobSiteBidCompleted;
                        list.push(q as JobsiteDetailWithoutProject);
                      }
                    });
                  });
                this.headerchecked = true;
                this.selectedJobsites = list;
                this.disableJobsite = true;
              }

            } else if (this.appliedOn === 'BY_JOBSITE') {
              const list = [];

              this.jobSiteDetailList.forEach(
                q => {

                  data.data.selectedJobSiteBidDetails.forEach((element: { jobSiteDetail: { id: any; }; status: BidStatus; isJobSiteBidCompleted: any; }) => {

                    if (q.id === element.jobSiteDetail.id) {
                      this.count++;
                      q.isSelected = true;
                      q.bidStatus = element.status;
                      q.isBidCompleted = element.isJobSiteBidCompleted;
                      list.push(q as JobsiteDetailWithoutProject);

                    } else {

                    }
                  });
                });

              if (this.jobSiteDetailList.length === list.length) {
                this.headerchecked = true;
              } else {
                this.headerchecked = false;
              }
              this.selectedJobsites = list;
              this.disableJobsite = false;
              this.localStorageService.setSelectedJobsitesForBidQuotation(this.selectedJobsites);

            }

          } else {
            this.projectBidDetailDto = new ProjectBidDetail();
            this.disableJobsite = false;
            this.appliedOn = '';
          }
        }
        else {
          this.projectBidDetailDto = new ProjectBidDetail();
          this.disableJobsite = false;
          this.appliedOn = '';
        }
      });

  }

  private prepareQueryParam(paramObject: { [x: string]: string; }): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  applyOnSelectedJobsite() {
    if (this.selectedJobsites) {
      if (this.projectBidDetailDto.id !== undefined) {
        this.projectBidDetail = new ProjectBidDetail();
        this.applyBidDetailDTO = new ApplyBidDetailDTO();
        this.projectBidDetail.projectDetail = this.projectDetailToBid;
        this.projectBidDetail.subContractor = this.loggedInUser;
        this.projectBidDetail.biddingType = 'BY_JOBSITE';
        this.projectBidDetail.status = 'STARTED';
        this.applyBidDetailDTO.projectBidDetail = this.projectBidDetail;
        this.applyBidDetailDTO.selectedJobSites = this.selectedJobsites;
        this.projectBidService.addProjectBidDetail(this.applyBidDetailDTO).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this._notificationService.success(this.translator.instant('applied.jobsite'), '');
              this.getProjectByIdAndUserId();
              this.localStorageService.setSelectedJobsitesForBidQuotation(this.selectedJobsites);
              this.localStorageService.setItem('selectedJobsiteToBid', this.selectedJobsites);
              this.projectJobSelectionService.refreshBidQuotatiionSideBarForJobsite.next();
              this.router.navigate([PATH_CONSTANTS.BID_QUOTATION]);
            } else {
              this._notificationService.error(data.message, '');
            }
          },
          (error) => {
            this._notificationService.error(this.translator.instant('common.error'), '');
          }
        );
      }
      else {
        this.projectBidDetail = new ProjectBidDetail();
        this.applyBidDetailDTO = new ApplyBidDetailDTO();
        this.projectBidDetail.projectDetail = this.projectDetailToBid;
        this.projectBidDetail.subContractor = this.loggedInUser;
        this.projectBidDetail.biddingType = 'BY_JOBSITE';
        this.projectBidDetail.status = 'STARTED';
        this.applyBidDetailDTO.projectBidDetail = this.projectBidDetail;
        this.applyBidDetailDTO.selectedJobSites = this.selectedJobsites;
        this.projectBidService.addProjectBidDetail(this.applyBidDetailDTO).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this._notificationService.success(this.translator.instant('applied.jobsite'), '');
              this.getProjectByIdAndUserId();
              this.localStorageService.setSelectedJobsitesForBidQuotation(this.selectedJobsites);
              this.localStorageService.setItem('selectedJobsiteToBid', this.selectedJobsites);
              this.projectJobSelectionService.refreshBidQuotatiionSideBarForJobsite.next();
              this.router.navigate([PATH_CONSTANTS.BID_QUOTATION]);
            } else {
              this._notificationService.error(data.message, '');
            }
          },
          (error) => {
            this._notificationService.error(this.translator.instant('common.error'), '');
          }
        );
      }

    }
    else {
      this.notificationService.error('Select jobsite ', '');
    }
  }

  next() {
    this.router.navigate([PATH_CONSTANTS.BID_QUOTATION]);
  }

  goToJobsite(id: string) {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOBSITE + '?jobsite=' + id);
  }

  downloadAttachments(id: any) {
    this._projectDetailService.downloadJobsiteAttachments(id).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/zip' });
        const fileName = 'jobsite-attachments.zip';
        saveAs(blob, fileName);
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
      });
  }

  oHeaderCheckBoxClicked(headerchecked: boolean) {
    this.selectedJobsites.length = 0;
    this.jobSiteDetailList.forEach(e => {
      if (e.status !== 'IN_PROGRESS') {
        e.isSelected = headerchecked;
        this.selectedJobsites.push(e);
      }
    });
    if (!headerchecked) {
      this.selectedJobsites.length = 0;
    }
  }

  onCheckBoxClicked() {
    this.selectedJobsites.length = 0;

    let count = 0;
    this.jobSiteDetailList.forEach(e => {
      if (e.isSelected == false) {
        count++;
      } else {
        this.selectedJobsites.push(e);
      }
    });
    if (count > 0) {
      this.headerchecked = false;
    } else {
      this.headerchecked = true;
    }

  }

}
