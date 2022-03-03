import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subscription } from 'rxjs';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';
import { MatSidenav } from '@angular/material/sidenav';
import { FormControl } from '@angular/forms';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { User } from '../vo/User';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { NavigationEnd, Router } from '@angular/router';
import { PATH_CONSTANTS } from '../PathConstants';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

@Component({
  selector: 'app-sidebar',
  templateUrl: './app-sidebar.component.html',
  styleUrls: ['./app-sidebar.component.scss']
})
export class AppSidebarComponent implements OnInit, OnDestroy {

  myControl = new FormControl();

  selectedCountry: string;

  selectedJobsites: string;

  countries: any[];

  jobsites: any[];

  hideJobListFilter = true;

  hideProjectListFilter = true;

  showJobsiteDetailFilterComponent = false;

  headerCaption: string;

  subscription = new Subscription();

  isHeaderVisible: boolean;

  user: User;

  rolename: any;

  showSubcontractorProjectListSidebar = true;

  projectJobsideBarVisible = false;

  projectJobsidebarUrlListForAdmin = ['/admin/invoices',
    '/admin/worker-comparison',
    '/admin/rating-review',
    '/admin/set-job-margin',
    '/admin/closeout-package',
    '/admin/project-rating-review',
    '/admin/project-invoices',
    '/admin/job-details',
    '/admin/set-project-margin',
    '/admin/bid-comparison',
    '/admin/project-question-and-answer',
    '/admin/project-details',
    '/admin/jobsite-details',
    '/admin/project-change-request',
    '/admin/dashboard',
    '/admin/timesheets'];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  @ViewChild('drawer', { static: true }) sideNav: MatSidenav;

  public config: PerfectScrollbarConfigInterface = {};

  // tslint:disable-next-line: max-line-length
  constructor(private breakpointObserver: BreakpointObserver, private captionChangeService: HeaderManagementService, private localStorageService: LocalStorageService, private projectJobSelectionService: ProjectJobSelectionService, private router: Router) {

    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      this.rolename = this.user.roles[0].roleName;
    }

    this.subscription.add(this.captionChangeService.captionchangerSubject.subscribe(caption => {
      this.headerCaption = caption;
    }));
    this.subscription.add(this.captionChangeService.hideHeaderSubject.subscribe(visibleHeader => {
      this.isHeaderVisible = visibleHeader;
    }));

    this.subscription.add(this.projectJobSelectionService.hideJobListFilter.subscribe(e => {
      this.hideJobListFilter = e;
    }));

    this.subscription.add(this.projectJobSelectionService.showProjectFilterList.subscribe(e => {
      this.hideProjectListFilter = e;
      this.showJobsiteDetailFilterComponent = !e;
      this.showSubcontractorProjectListSidebar = !e;
    }));

    this.subscription.add(this.projectJobSelectionService.showSubcontractorSidebarList.subscribe(e => {
      this.showSubcontractorProjectListSidebar = e;
      this.hideProjectListFilter = !e;
      this.showJobsiteDetailFilterComponent = !e;
    }));

    this.subscription.add(this.projectJobSelectionService.showJobsiteListFilter.subscribe(e => {
      this.showSubcontractorProjectListSidebar = !e;
      this.hideProjectListFilter = !e;
      this.showJobsiteDetailFilterComponent = e;
    }));

    this.subscription.add(this.captionChangeService.hideSidebarSubject.subscribe(e => {
      if (e) {
        this.sideNav.close();
      } else {
        this.sideNav.open();
      }
    }));

    this.setsubContractorSidebar();

    this.setAdminSidebar();

    this.subscription.add(router.events.pipe(filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showProjectJobsidebarForAdmin(event.url);
    }));

  }

  showProjectJobsidebarForAdmin(url: string): void {
    if (this.projectJobsidebarUrlListForAdmin.includes(this.router.url)) {
      this.projectJobsideBarVisible = true;
    } else {
      this.projectJobsideBarVisible = false;
    }
  }

  setAdminSidebar(): void {
    if (this.projectJobsidebarUrlListForAdmin.includes(this.router.url)) {
      this.projectJobsideBarVisible = true;
    } else {
      this.projectJobsideBarVisible = false;
    }
  }

  setsubContractorSidebar(): void {
    switch (this.router.url) {
      case PATH_CONSTANTS.SUBCONTRACTOR_PROJECT_LIST:
        this.hideProjectListFilter = true;
        this.showJobsiteDetailFilterComponent = false;
        this.showSubcontractorProjectListSidebar = false;
        break;
      case PATH_CONSTANTS.VIEW_MORE_PROJECT_DETAIL:
        this.showSubcontractorProjectListSidebar = false;
        this.hideProjectListFilter = false;
        this.showJobsiteDetailFilterComponent = true;
        break;
      default:
        this.showSubcontractorProjectListSidebar = true;
        this.hideProjectListFilter = false;
        this.showJobsiteDetailFilterComponent = false;
        break;

    }
  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
  }

  public toggleDrawer(any): void {
    this.sideNav.toggle();
  }

}
