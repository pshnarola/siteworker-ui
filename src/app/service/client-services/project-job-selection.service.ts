import { Injectable } from '@angular/core';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { PostType } from 'src/app/module/client/enums/posttype';

@Injectable()
export class ProjectJobSelectionService {

  public postTypeSubject = new BehaviorSubject(PostType.Project);
  public selectedProjectSubject = new  ReplaySubject(1);
  public selectedJobsiteSubject = new ReplaySubject(1);
  public selectedJobSubject = new ReplaySubject(1);
  public addJobsiteSubject = new ReplaySubject(1);
  public updateJobsiteStatusSubject = new ReplaySubject(1);
  public addProjectSubject = new ReplaySubject(1);

  public adminMarginSidebar = new ReplaySubject(1);

  public adminJobMarginSidebar = new ReplaySubject(1);

  public addJobSubject = new ReplaySubject(1);
  public hideJobListFilter = new Subject<any>();

  public refreshBidQuotatiionSideBarForJobsite = new Subject<any>();

  public selectedJobsiteOfDropdown = new ReplaySubject(1);
  public hideJobsiteListBehaviourSubject = new ReplaySubject<boolean>(1);
  public tempSubject = new ReplaySubject(1);
  public addHideAllLabelSubject = new Subject<boolean>();
  public addHideAllLabelSubjectForJob = new Subject<boolean>();

  public showProjectFilterList = new Subject<any>();
  public showJobsiteListFilter = new Subject<any>();
  public showSubcontractorSidebarList = new Subject<any>();

  public selectedJobsiteToBid = new Subject<any[]>();
  public cancelledAndCompletedSubject = new Subject<any>();

  public jobSwitchSubject = new Subject<any>();

  public refreshSidebarAfterAcceptRejectProject =  new Subject<any>();

  public workerSelectionSubject = new ReplaySubject(1);

  constructor() { }
 
}
