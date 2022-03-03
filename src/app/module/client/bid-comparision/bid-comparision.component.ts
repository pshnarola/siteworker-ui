import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { ProjectDetail } from '../Vos/projectDetailmodel';

@Component({
  selector: 'app-bid-comparision',
  templateUrl: './bid-comparision.component.html',
  styleUrls: ['./bid-comparision.component.css']
})
export class BidComparisionComponent implements OnInit {

  subscription: Subscription;
  selectedProject: ProjectDetail = null;
  isSelectedProject = false;
  bidForjobsiteScreen = 'jobsiteScreen';

  awardUrl = ['/client/review-&-award-project', '/client/review-&-award-jobsite'];

  constructor(
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private _localStorageService: LocalStorageService,
    private notificationService: UINotificationService,
    private router: Router) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.setProject();
  }

  ngOnDestroy(): void {
    let currentRoute = this.router.url;
    if (!this.awardUrl.includes(currentRoute)) {
      this._localStorageService.removeItem('selectedSubcontractorDetail');
      this._localStorageService.removeItem('selectedSubcontractorForJobsite');
      this._localStorageService.removeItem('selectedSubcontractorForProject');
    }
    this.subscription.unsubscribe();
  }

  onOpenLineItemTemplate() {
    let subconractor = this._localStorageService.getItem('selectedSubcontractorDetail');
    if (subconractor) {
      if (subconractor.length > 0) {
        this.bidForjobsiteScreen = 'lineItemScreen';
      }
      else {
        this.notificationService.error('Please select at least one subcontractor', '');
      }
    }
    else {
      this.notificationService.error('Please select at least one subcontractor', '');
    }
  }

  onBack() {
    this.bidForjobsiteScreen = 'jobsiteScreen';
  }

  private setProject() {
    this.subscription = this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      let project = this._localStorageService.getSelectedProjectObject();
      if (project.id === 'pid') {
        this.isSelectedProject = false;
        this.selectedProject = null;
      }
      else {
        this.selectedProject = project;
        if (this.selectedProject !== null) {
          this.isSelectedProject = true;
        }
      }
    });
  }

}
