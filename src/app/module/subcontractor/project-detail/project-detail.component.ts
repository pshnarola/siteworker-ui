import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Paginator } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.css']
})
export class ProjectDetailComponent implements OnInit {

  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;

  projectDetail: any;
  isSelectedProject: boolean;
  selectedProject: any;
  subscription = new Subscription();
  first = 0;
  page = 0;
  @ViewChild('paginator', { static: true }) paginator: Paginator

  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'title' },
    { label: this.translator.instant('jobsite.desc'), value: 'description' },
    { label: this.translator.instant('cost'), value: 'cost' },
    { label: this.translator.instant('bid.amount'), value: 'bidAmount' },
    { label: this.translator.instant('city'), value: 'city' },
    { label: this.translator.instant('state'), value: 'state' },
    { label: this.translator.instant('zipcode'), value: 'zipCode' },
  ];

  loggedInUserId: any;

  constructor(
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService) {
    this.loggedInUserId = this.localStorageService.getLoginUserId();

    this.captionChangeService.hideHeaderSubject.next(true);
    this.getSelectedProjectDetails();
  }

  ngOnInit(): void {
    this.getSelectedProjectDetails();
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  getSelectedProjectDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      let project;
      project = this.localStorageService.getSelectedProjectObject();

      if (project) {
        if (project.id === 'pid') {
          this.isSelectedProject = false;
          this.projectDetail = null;
        }
        else {
          this.projectDetail = project;
          this.setBidDetailOfJobsite();
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

  setBidDetailOfJobsite() {
    if (this.localStorageService.getItem('selectedFullProjectDetail')) {
      let jobsiteFullDetail = this.localStorageService.getItem('selectedFullProjectDetail');
      jobsiteFullDetail.jobsites?.forEach(element => {
        this.projectDetail.jobsite.forEach(element1 => {
          if (element1.id === element.jobSiteDetail.id) {
            element1.bidAmount = element.subContractorCost;
          }
        });
      });
    }
  }

  paginate(event) {
    this.first = event.first;
    this.size = event.rows;
    setTimeout(() => this.paginator.changePage(event.page));
  }

  onJobSiteClick(id) {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOBSITE + "?jobsite=" + id);
  }
}
