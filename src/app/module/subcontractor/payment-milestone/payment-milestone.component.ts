import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-payment-milestone',
  templateUrl: './payment-milestone.component.html',
  styleUrls: ['./payment-milestone.component.css']
})
export class PaymentMilestoneComponent implements OnInit {

  isSelectedJobSite: boolean = false;
  JobSiteDetail: any;
  projectDetail: ProjectDetail;
  isSelectedProject: boolean;
  subscription = new Subscription();

  constructor(
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
  ) {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.addHideAllLabelSubject.next(false);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.addHideAllLabelSubject.next(false);
    this.getSelectedProjectDetails();
    this.getSelectedJobsiteDetail();
  }

  ngOnDestroy() {
    this.projectJobSelectionService.addHideAllLabelSubject.next(true);
    this.subscription.unsubscribe();
    if (this.localStorageService.getItem('milestoneDetail')) {
      this.localStorageService.removeItem('milestoneDetail');
    }
  }

  getSelectedJobsiteDetail() {
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(data => {
      const jobSite = this.localStorageService.getSelectedJobsiteObject();
      const project = this.localStorageService.getSelectedProjectObject();
      if (project && jobSite) {
        if (jobSite.id === 'jid') {
          this.isSelectedJobSite = false;
          this.JobSiteDetail = null;
        }
        else {
          this.JobSiteDetail = jobSite;
          if (this.JobSiteDetail !== null) {
            this.isSelectedJobSite = true;
          }
        }
      }
      else {
        this.isSelectedJobSite = false;
        this.JobSiteDetail = null;
      }
    }));
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
          if (this.projectDetail !== null) {
            this.isSelectedProject = true;
            this.projectDetail = project;
          }
        }
      } else {
        this.isSelectedProject = false;
        this.projectDetail = null;
      }
    }));
  }

  redirectToLineItemDeliverables(milestone): void {

    let milestoneDetail = {
      jobsiteDetail: this.localStorageService.getSelectedJobsiteObject(),
      milestone: milestone
    };

    this.localStorageService.setItem('milestoneDetail', milestoneDetail);
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_LINE_ITEM_DELIVERABLES);
  }

}
