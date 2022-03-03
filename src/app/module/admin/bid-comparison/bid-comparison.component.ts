import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-bid-comparison',
  templateUrl: './bid-comparison.component.html',
  styleUrls: ['./bid-comparison.component.css']
})
export class BidComparisonComponent implements OnInit {
  subscription: Subscription;
  selectedProject: ProjectDetail = null;
  isSelectedProject = false;
  bidForjobsiteScreen = 'jobsiteScreen';

  constructor(private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private _localStorageService: LocalStorageService,
    private notificationService: UINotificationService) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.setProject();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this._localStorageService.removeItem('selectedSubcontractorDetail');
    this._localStorageService.removeItem('selectedSubcontractorForJobsite');
    this._localStorageService.removeItem('selectedSubcontractorForProject');
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
