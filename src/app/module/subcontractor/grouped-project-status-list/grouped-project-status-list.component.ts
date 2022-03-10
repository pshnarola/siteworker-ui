import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StateService } from 'src/app/service/admin-services/state/state.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';

@Component({
  selector: 'app-grouped-project-status-list',
  templateUrl: './grouped-project-status-list.component.html',
  styleUrls: ['./grouped-project-status-list.component.css']
})
export class GroupedProjectStatusListComponent implements OnInit {

  projectDetailList: ProjectDetail[] = [];
  totalRecords = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  constructor(
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStrorageService: LocalStorageService,
    private _subcontractorProfileDetail: SubcontractorProfileService,
    private router: Router,
    private stateService: StateService
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.PROJECTSTATUSLIST);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.projectJobSelectionService.showSubcontractorSidebarList.next(true);
  }

  ngOnInit(): void {
    this.projectDetailList = this.localStrorageService.getItem('projectStatusList');
    if (this.projectDetailList) {
      console.log('this.projectDetailList =>', this.projectDetailList);
    }
  }

  calculateDiffInDays(dateSent) {
    const currentDate: any = new Date();
    dateSent = new Date(dateSent);
    const days = Math.floor((currentDate - dateSent) / (1000 * 60 * 60 * 24));
    return days;
  }

  calculateDiffInMinutes(dateSent) {
    const currentDate: any = new Date();
    dateSent = new Date(dateSent);
    const days = Math.floor((currentDate - dateSent) / (1000 * 60) % 60);
    return days;
  }

  calculateDiffInHours(dateSent) {
    const currentDate: any = new Date();
    dateSent = new Date(dateSent);
    const days = Math.floor((currentDate - dateSent) / (1000 * 60 * 60) % 24);
    return days;
  }

  redirectToViewMore(id) {
    this.router.navigate([PATH_CONSTANTS.VIEW_MORE_PROJECT_DETAIL], { queryParams: { user: id } });
  }

}
