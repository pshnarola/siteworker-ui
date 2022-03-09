import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { interval, Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ProjectDetail } from 'src/app/module/client/Vos/projectDetailmodel';
import { AdminUserService } from 'src/app/service/admin-services/admin-user/admin-user.service';
import { GamificationConfigurationService } from 'src/app/service/admin-services/gamification-configuration/gamification-configuration.service';
import { BellNotificationService } from 'src/app/service/bell-notification.service';
import { ChatMessageServiceService } from 'src/app/service/chat-message-service.service';
import { ClientProfileService } from 'src/app/service/client-services/client-profile/client-profile.service';
import { PostProjectService } from 'src/app/service/client-services/post-project/post-project.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { SupervisorService } from 'src/app/service/client-services/supervisor/supervisor.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { LoginAsService } from 'src/app/service/login-as.service';
import { LoginService } from 'src/app/service/login.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { BasicDetailService } from 'src/app/service/worker-services/basic-detail/basic-detail.service';
import * as MenuJson from 'src/assets/translate/menu/en.json';
import { environment } from 'src/environments/environment';
import { CommonUtil } from '../CommonUtil';
import { CustomValidator } from '../CustomValidator';
import { UINotificationService } from '../notification/uinotification.service';
import { PATH_CONSTANTS } from '../PathConstants';
import { User } from '../vo/User';


@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  // tslint:disable-next-line: no-output-rename
  @Output('toggle') toggleSidebar: EventEmitter<any> = new EventEmitter();

  loggedInUser: User;
  user: User;
  rolename: any;
  loggedInUserName: string;
  messageHidden = false;
  hidden = false;
  totalNotifications: number;
  totalMessages: number;
  subscription = new Subscription();
  copiedProject: ProjectDetail;
  workerDto: any;
  subcontractor: any;
  client: any;
  profileImage: any;
  singleImageView: any;
  displayAvatar = false;
  usernameLabel: string;
  avatarColor = '#2196F3';
  userMenuAccess: any;
  hasProjectAccess = false;
  hasJobAccess = false;
  menuAccessJson = MenuJson;

  // Interval
  source = interval(environment.bellNotificationInterval);
  autoLogoutInterval = interval(environment.autoLogout);
  autoLogoutimmediateInterval = interval(environment.autoLogoutimmediate);

  isSupervisorAllowToPostProject: boolean = false;

  logInAsDialog = false;
  loginAsForm: FormGroup;
  userNameForLoginAs: { name: any; };
  queryParam: any;
  filteredUserNameForLoginAs: any[] = [
    { firstName: "hello", lastName: "sfsdf", email: "sdafdsfdf" },
    { firstName: "hello", lastName: "sfsdf", email: "sdafdsfdf" },
    { firstName: "hello", lastName: "sfsdf", email: "sdafdsfdf" }
  ];
  submitted: boolean;
  routesData: any;
  isGamificationEnabled = false;
  // tslint:disable-next-line: max-line-length

  constructor(
    private localStorageService: LocalStorageService,
    private _clientProfile: ClientProfileService,
    private loginAsService: LoginAsService,
    private router: Router,
    private bellNotificationService: BellNotificationService,
    private notificationService: UINotificationService,
    private confirmDialogService: ConfirmDialogueService,
    private translator: TranslateService,
    private postProjectService: PostProjectService,
    private chatMessageServiceService: ChatMessageServiceService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private _clientProfileService: ClientProfileService,
    private _workerProfileServices: BasicDetailService,
    private _subContractorProfileServices: SubcontractorProfileService,
    private _adminUserService: AdminUserService,
    private _supervisorService: SupervisorService,
    private _formBuilder: FormBuilder,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private captionChangeService: HeaderManagementService,
    private gamificationConfigurationService: GamificationConfigurationService,
    private loginService: LoginService,
  ) {
    this.routesData = this.translator.instant('adminProjects.routes');
    this.user = this.localStorageService.getLoginUserObject();
    if (this.user != null) {
      if (this.user) {
        this.rolename = this.user.roles[0].roleName;
        this.loggedInUserName = this.user.firstName + ' ' + this.user.lastName;
      }

    } else {
      this.loggedInUserName = 'Guest';
    }

    this.getUnreadNotification();
    this.getUnreadMessages();
    if (this.rolename === 'CLIENT') {
      this.getClientDetailByUserId();
    }

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  showloginAsDialog() {
    this.logInAsDialog = true;
    this.initializeForm();
    this.submitted = false;
  }

  hideloginAsDialog() {
    this.logInAsDialog = false;
    this.initializeForm();

  }

  checkToggleFunction() {

    setTimeout(function () {

      $('#navbarTogglerDemo02 button:not(.mat-menu-trigger)').on('click', function () {
        $('#navbarTogglerDemo02').removeClass("show"); //bootstrap 4.x
      });

      $('#navbarTogglerDemo02 button.mat-menu-trigger').on('click', function () {

        $('.close-parent-item').on('click', function () {
          $('#navbarTogglerDemo02').removeClass("show"); //bootstrap 4.x
        });

      });
    }, 2000);


  }

  initializeForm() {
    this.loginAsForm = this._formBuilder.group({
      id: [],
      userName: ['', [CustomValidator.required]],
      adminUserName: ['', [CustomValidator.required]],
      adminPassword: ['', [CustomValidator.required]],
      createdBy: this.user.id,
      updatedBy: this.user.id,
      enable: 1,
    });
  }

  onSubmit() {
    this.submitted = true;
    if (!this.loginAsForm.valid) {
      let controlName: string;
      // tslint:disable-next-line: forin
      for (controlName in this.loginAsForm.controls) {
        this.loginAsForm.controls[controlName].markAsDirty();
        this.loginAsForm.controls[controlName].updateValueAndValidity();
      }
      this.submitted = true;
      return false;
    }
    else {

      let userParams = {
        "username": this.loginAsForm.value.adminUserName,
        "password": this.loginAsForm.value.adminPassword
      };

      let queryparam = this.prepareQueryParam(userParams);
      setTimeout(() => {
        this.loginAsService.generateTokenForLoginAs(queryparam, this.loginAsForm.value.userName.email);
      }, 3000);
    }
  }

  getFilteredUsernameForLogin(event) {

    this.userNameForLoginAs = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.userNameForLoginAs);
    this.filterLeftPanelService.getUserDetailByName(this.queryParam).subscribe(data => {
      this.filteredUserNameForLoginAs = data.data;
      this.filteredUserNameForLoginAs = this.filteredUserNameForLoginAs.sort();
    });
  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getClientDetailByUserId(): void {
    const userId = this.localStorageService.getLoginUserId();
    this._clientProfile.getClientProfileDetailById(userId).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (data.data.basicProfile) {
            this.hasProjectAccess = data.data.basicProfile.isProjectAccess;
            this.hasJobAccess = data.data.basicProfile.isJobAccess;
          }
        }
      });
  }


  bellNotificationClicked(): void {
    this.router.navigate([PATH_CONSTANTS.BELL_NOTIFICATION]);
    this.bellNotificationService.markNotificationAsSeenByUserId(this.user.id).subscribe(e => {
      if (e.statusCode === '200' && e.message === 'OK') {
        this.getUnreadNotification();
      } else {
        this.notificationService.error(e.message, '');
      }
    },
      error => {
        console.log(error);
      });

  }

  goToLeaderBoard(): void {
    switch (this.rolename) {
      case 'ADMIN':
        this.router.navigate([PATH_CONSTANTS.ADMIN_LEADER_BOARD]);
        break;
      case 'CLIENT':
        this.router.navigate([PATH_CONSTANTS.CLIENT_LEADER_BOARD]);
        break;
      case 'SUBCONTRACTOR':
        this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_LEADER_BOARD]);
        break;
      case 'WORKER':
        this.router.navigate([PATH_CONSTANTS.WORKER_LEADER_BOARD]);
        break;
      default:
        break;
    }


  }

  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }

  ngOnInit(): void {
    this.getGamificationToggle();

    this.subscription.add(this.gamificationConfigurationService.toggleGamificationSubject.subscribe(data => {
      if (data) {
        this.isGamificationEnabled = true;
      } else {
        this.isGamificationEnabled = false;
      }
    }));

    this.subscription.add(this.source.subscribe(
      val => {
        this.getUnreadNotification();
        this.getUnreadMessages();
      }));

    this.subscription.add(this.autoLogoutInterval.subscribe(
      (value) => {
        // this.loginService.autoLogout();
        this.openDialogFoLogoutConfirmation();
      }));

    this.subscription.add(this.autoLogoutimmediateInterval.subscribe(
      (value) => {
        this.loginService.autoLogout();
      }));

    this.initializeForm();

    switch (this.rolename) {
      case 'ADMIN':
        this.usernameLabel = 'AU';
        this.displayAvatar = true;
        break;
      case 'CLIENT':
        this.subscription.add(this.captionChangeService.profileDataSubject.subscribe(
          response => {
            this.getLogedInClientDetail(response);
          }));
        this.getLogedInClientDetail(this.user.id);
        break;
      case 'SUBCONTRACTOR':
        this.subscription.add(this.captionChangeService.profileDataSubject.subscribe(
          response => {
            this.getLogedInSubcontractorDetail(response);
            this.avatarColor = '#FCCC00';
          }));
        this.getLogedInSubcontractorDetail(this.user.id);
        this.avatarColor = '#FCCC00';
        break;
      case 'WORKER':
        this.subscription.add(this.captionChangeService.profileDataSubject.subscribe(
          response => {
            this.getLogedInWorkerDetail(response);
          }));
        this.getLogedInWorkerDetail(this.user.id);
        break;
      case 'SUBADMIN':
        this.checkUserRoleRights(this.rolename, this.user.id);
        break;
      case 'SUPERVISOR':
        this.checkUserRoleRights(this.rolename, this.user.id);
        break;
    }

    this.checkToggleFunction();
  }

  public getUnreadNotification(): void {
    this.bellNotificationService.getUnreadNotificationCount(this.user.id).subscribe(e => {
      this.totalNotifications = e.data as number;
      if (this.totalNotifications === 0) {
        this.hidden = true;
      } else {
        this.hidden = false;
      }
    });
  }

  postProject() {
    const project = this.localStorageService.getItem('addProjectDetail');
    if (project) {
      this.openWarningDialogForPostProject();
    }
    else {
      this.router.navigate(['/client/post-project']);
    }
  }
  postJob() {
    const job = this.localStorageService.getItem('jobId');
    if (job) {
      this.openWarningDialogForPostJob();
    }
    else {
      this.router.navigate(['/client/post-job']);
    }
  }

  public logout(): void {
    this.localStorageService.logout();
    this.router.navigate([PATH_CONSTANTS.LOGIN_PATH]);
  }

  public toggleSideBarEvent(): void {
    this.toggleSidebar.emit();
  }

  public viewProfile(): void {
    const id = this.user.id;
    switch (this.rolename) {
      // case 'ADMIN':
      //   this.router.navigate([]);
      //   break;
      case 'CLIENT':
        this.router.navigate([PATH_CONSTANTS.CLIENT_PROFILE_DETAIL], { queryParams: { user: id } });
        break;
      case 'SUBCONTRACTOR':
        this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_DETAIL_PROFILE], { queryParams: { user: id } });
        break;
      case 'WORKER':
        this.router.navigate([PATH_CONSTANTS.WORKER_DETAIL_PROFILE], { queryParams: { user: id } });
        break;
    }
  }

  public editProfile(): void {
    switch (this.rolename) {
      // case 'ADMIN':
      //   break;
      case 'CLIENT':
        this.router.navigate([PATH_CONSTANTS.EDIT_CLIENT_PROFILE]);
        break;
      case 'SUBCONTRACTOR':
        this.router.navigate([PATH_CONSTANTS.EDIT_SUBCONTRACTOR_PROFILE]);
        break;
      case 'WORKER':
        this.router.navigate([PATH_CONSTANTS.EDIT_WORKER_PROFILE]);
        break;
    }
  }


  openDashboard(): void {
    switch (this.rolename) {
      case 'CLIENT':
        this.localStorageService.removeItem('editJobId');
        this.router.navigate([PATH_CONSTANTS.CLIENT_DASHBOARD]);
        break;
      case 'SUBCONTRACTOR':
        this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_DASHBOARD]);
        break;
      case 'WORKER':
        this.router.navigate([PATH_CONSTANTS.WORKER_DASHBOARD]);
        break;
    }
  }

  workerComparisionClicked(): void {
    this.router.navigate([PATH_CONSTANTS.CLIENT_WORKER_COMPARISON]);
  }

  addLineItemClicked(): void {
    this.router.navigate([PATH_CONSTANTS.ADD_LINE_ITEM]);
  }

  jobDetailsClicked(): void {
    const job = this.localStorageService.getSelectedJob();
    if (this.router.url === '/client/ratingAndReviewProject?type=JOBS') {
      this.router.navigate([PATH_CONSTANTS.VIEW_JOB_DETAILS]);
    }
    else if (job && job.id !== 'jobId') {
      this.router.navigate([PATH_CONSTANTS.VIEW_JOB_DETAILS]);
    }
    else {
      this.openselectJobDialog();
    }
  }
  adminJobDetailsClicked(): void {
    const job = this.localStorageService.getSelectedJob();
    if (job && job.id !== 'jobId') {
      this.router.navigate([PATH_CONSTANTS.ADMIN_VIEW_JOB_DETAILS]);
    } else {
      this.openselectJobDialog();
    }
  }

  jobSetMarginClicked(): void {
    this.router.navigate([PATH_CONSTANTS.JOB_SET_MARGIN]);
  }

  adminWorkerComparisonClicked(): void {
    this.router.navigate([PATH_CONSTANTS.ADMIN_WORKER_COMPARISON]);
  }

  adminJobRatingReviewClicked(): void {
    this.localStorageService.setItem('ratingAndReviewClicked', true);
    this.router.navigate([PATH_CONSTANTS.ADMIN_JOB_RATING_REVIEW]);
  }

  adminProjectRatingReviewClicked(): void {
    this.localStorageService.setItem('ratingAndReviewClicked', true);
    this.router.navigate([PATH_CONSTANTS.ADMIN_PROJECT_RATING_REVIEW]);
  }

  projectListingClicked(from: string): void {
    switch (from) {
      case 'PROJECT':
        this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_PROJECT_LIST]);
        break;
    }
  }

  jobListingClicked(): void {
    this.router.navigate([PATH_CONSTANTS.WOKER_JOB_LISTING]);
  }
  acceptJobsClicked(): void {
    this.router.navigate([PATH_CONSTANTS.ACCEPT_JOBS]);
  }
  applyJobsClicked(): void {
    this.router.navigate([PATH_CONSTANTS.APPLY_JOB]);
  }
  reimbursementsClicked(): void {
    this.router.navigate([PATH_CONSTANTS.VIEW_REIMBURSEMENTS]);
  }
  workerJobDetailsClicked(): void {
    this.router.navigate([PATH_CONSTANTS.WORKER_JOB_DETAILS]);
  }

  timeSheetClicked(): void {
    this.router.navigate([PATH_CONSTANTS.CLIENT_JOB_TIMESHEET]);
  }

  acceptRejectProjectClicked(): void {
    this.router.navigate([PATH_CONSTANTS.ACCEPT_REJECT_PROJECT]);
  }

  changePasswordClicked(): void {
    switch (this.rolename) {
      case 'CLIENT':
        this.router.navigate([PATH_CONSTANTS.CLIENT_CHANGE_PASSWORD]);
        break;
      case 'SUBCONTRACTOR':
        this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_CHANGE_PASSWORD]);
        break;
      case 'WORKER':
        this.router.navigate([PATH_CONSTANTS.WORKER_CHANGE_PASSWORD]);
        break;
      case 'SUPERVISOR':
        this.router.navigate([PATH_CONSTANTS.CLIENT_CHANGE_PASSWORD]);
        break;
    }
  }
  projectListingConfigurationCLicked() {
    this.router.navigate([PATH_CONSTANTS.PROJECT_LISTING_CONFIGURATION]);
  }
  jobListingConfigurationCLicked() {
    this.router.navigate([PATH_CONSTANTS.JOB_LISTING_CONFIGURATION]);
  }
  supervisorManagementClicked(): void {
    this.router.navigate([PATH_CONSTANTS.CLIENT_SUPERVISOR]);
  }

  inviteeConfigurationClicked(): void {
    this.router.navigate([PATH_CONSTANTS.INVITEE_CONFIGURATION]);
  }

  gamificationConfigurationClicked(): void {
    this.router.navigate([PATH_CONSTANTS.GAMIFICATION_CONFIGURATION]);
  }

  changeRequestClicked(): void {
    if (this.rolename === 'CLIENT') {
      this.router.navigate([PATH_CONSTANTS.CHANGE_REQUEST]);
    }

    if (this.rolename === 'SUPERVISOR') {
      this.router.navigate([PATH_CONSTANTS.CHANGE_REQUEST]);
    }

    if (this.rolename === 'SUBCONTRACTOR') {
      this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_CHANGE_REQUEST]);
    }
  }

  projectDetailsClicked(): void {
    const project = this.localStorageService.getSelectedProjectObject();
    if (this.router.url === '/client/project-rating-review') {
      this.router.navigate([PATH_CONSTANTS.CLIENT_PROJECT_DETAILS]);
    }
    else if (project && project.id !== 'pid') {
      this.router.navigate([PATH_CONSTANTS.CLIENT_PROJECT_DETAILS]);
    } else {
      this.openselectProjectDialog();
    }
  }
  adminProjectDetailsClicked(): void {
    const project = this.localStorageService.getSelectedProjectObject();
    if (project && project.id !== 'pid') {
      this.router.navigate([PATH_CONSTANTS.ADMIN_PROJECT_DETAILS]);
    } else {
      this.openselectProjectDialog();
    }
  }

  jobsiteDetailsClicked(): void {
    const jobsite = this.localStorageService.getSelectedJobsiteObject();
    if (this.router.url === '/client/ratingAndReviewProject?type=JOBS' || this.router.url === '/client/ratingAndReviewProject?type=PROJECT') {
      this.openselectJobsiteDialog();
    }
    else if (jobsite && jobsite.id !== 'jid') {
      this.router.navigate([PATH_CONSTANTS.CLIENT_JOBSITE_DETAILS]);
    } else {
      this.openselectJobsiteDialog();
    }
  }

  adminJobsiteDetailsClicked(): void {
    const jobsite = this.localStorageService.getSelectedJobsiteObject();
    // if (this.localStorageService.getSelectedJobsiteObject()) {
    //   this.localStorageService.removeItem('selectedJobsite');
    // } else {
    if (jobsite && jobsite.id !== 'jid') {
      this.router.navigate([PATH_CONSTANTS.ADMIN_JOBSITE_DETAILS]);
    } else {
      this.openselectJobsiteDialog();
    }
    // }
  }

  bidComparisionClicked(): void {
    // const project = this.localStorageService.getSelectedProjectObject();
    // if (project && project.id !== 'pid') {
    this.router.navigate([PATH_CONSTANTS.BID_COMPARISION]);
    // } else {
    //   this.openselectProjectDialog();
    // }
  }

  closeOutPackageRequestClicked(): void {
    this.router.navigate([PATH_CONSTANTS.CLOSE_OUT_PACKAGE]);
  }

  clientProjectRatingReviewClicked() {
    this.localStorageService.setItem('ratingAndReviewClicked', true);
    this.router.navigate([PATH_CONSTANTS.PROJECT_RATING_REVIEW]);
  }
  clientRatingAndReviewClicked(from: string): void {
    let routing;
    let params;
    switch (from) {
      case 'PROJECT':
        routing = PATH_CONSTANTS.CLIENT_RATING_AND_REVIEW_PROJECT;
        params = 'PROJECT';
        this.localStorageService.setItem('ratingAndReviewClicked', true);
        this.router.navigate([routing], { queryParams: { type: params } });
        break;
      case 'JOB':
        routing = PATH_CONSTANTS.CLIENT_RATING_AND_REVIEW_PROJECT;
        params = 'JOBS';
        this.localStorageService.setItem('ratingAndReviewClicked', true);
        this.router.navigate([routing], { queryParams: { type: params } });
        break;
    }
  }

  clientInvoicesClicked(from: string): void {
    let routing;
    switch (from) {
      case 'PROJECT':
        routing = PATH_CONSTANTS.INVOICES;
        break;
      case 'JOB':
        routing = PATH_CONSTANTS.JOB_INVOICES;
        break;
    }
    this.router.navigate([routing]);
  }

  qAndAReplyForSubcontractorClicked(): void {
    const project = this.localStorageService.getSelectedProjectObject();
    if (project && project.id !== 'pid') {
      this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_QAndAReply]);
    } else {
      this.openselectProjectDialog();
    }
  }

  qAndAForAdminClicked(): void {
    // this.checkToggleFunction();
    const project = this.localStorageService.getSelectedProjectObject();
    if (project && project.id !== 'pid') {
      this.router.navigate([PATH_CONSTANTS.ADMIN_QUESTION_AND_ANSWER]);
    } else {
      this.openselectProjectDialog();
    }
  }

  bidComparisonForAdminClicked(): void {
    this.router.navigate([PATH_CONSTANTS.ADMIN_BID_COMPARISON]);
  }

  paymentMilestoneSubcontractor() {
    const jobsite = this.localStorageService.getSelectedJobsiteObject();
    if (jobsite && jobsite.id !== 'jid') {
      this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_PAYMENT_MILESTONE]);
    } else {
      this.openselectJobsiteDialog();
    }
  }

  projectDetailSubcontractor(): void {
    const project = this.localStorageService.getSelectedProjectObject();
    if (project && project.id !== 'pid') {
      this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_PROJECT_DETAIL]);
    } else {
      this.openselectProjectDialog();
    }
  }

  jobsiteDetailSubcontractor(): void {
    const jobsite = this.localStorageService.getSelectedJobsiteObject();
    if (jobsite && jobsite.id !== 'jid') {
      this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_JOBSITE_DETAIL]);
    } else {
      this.openselectJobsiteDialog();
    }
  }

  projectBidSubcontractor(): void {
    // For Special case as no set of projects are matching
    this.localStorageService.removeItem('selectedFullProjectDetail');
    this.localStorageService.removeItem('selectedProject');
    this.localStorageService.removeItem('selectedJobsite');
    const project = this.localStorageService.getSelectedProjectObject();
    // if (project && project.id !== 'pid') {
    this.router.navigate([PATH_CONSTANTS.SELECT_JOBSITE]);
    // } else {
    //   this.openselectProjectDialogForBid();
    // }
  }

  openselectProjectDialogForBid(): void {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Please select at least one jobsite',
      // cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      this.router.navigate([PATH_CONSTANTS.SELECT_JOBSITE]);
    });
  }

  copyProjectClicked(): void {
    const project = this.localStorageService.getSelectedProjectObject();
    if (project && project.id !== 'pid') {
      if (this.rolename === 'CLIENT') {
        this.copyProject();
      } else {
        // this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_QUESTION_AND_ANSWER]);
      }
    } else {
      this.openselectProjectDialog();
    }
  }
  adminCloseoutClicked(): void {
    this.router.navigate([PATH_CONSTANTS.ADMIN_CLOSEOUT]);
  }
  questionAndAnswerClicked(): void {
    const project = this.localStorageService.getSelectedProjectObject();
    if (project && project.id !== 'pid' && (this.rolename === 'CLIENT' || this.rolename === 'SUPERVISOR') && this.router.url === '/client/project-rating-review') {
      this.router.navigate([PATH_CONSTANTS.CLIENT_QUESTION_AND_ANSWER]);
    }
    else if (project && project.id !== 'pid' && (this.rolename === 'CLIENT' || this.rolename === 'SUPERVISOR')) {
      this.router.navigate([PATH_CONSTANTS.CLIENT_QUESTION_AND_ANSWER]);
    }
    else {
      this.openselectProjectDialog();
    }
    if (this.rolename === 'SUBCONTRACTOR') {
      this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_QUESTION_AND_ANSWER]);
    }
  }

  openselectProjectDialog(): void {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Please select at least one project',
      // cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (this.rolename === 'CLIENT') {
        //this.router.navigate([PATH_CONSTANTS.CLIENT_DASHBOARD]);
      } else if (this.rolename === 'SUBCONTRACTOR') {
        //this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_DASHBOARD]);
      }
      else if (this.rolename === 'ADMIN') {
        //this.router.navigate([PATH_CONSTANTS.ADMIN_DASHBOARD]);
      }
    });
  }

  openselectJobsiteDialog(): void {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Please select at least one jobsite',
      // cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (this.rolename === 'CLIENT') {
        //this.router.navigate([PATH_CONSTANTS.CLIENT_DASHBOARD]);
      } else {
        // this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_DASHBOARD]);
      }
    });
  }

  openselectJobDialog(): void {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Please select at least one job',
      // cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (this.rolename === 'CLIENT' || this.rolename === 'SUPERVISOR') {
          // this.router.navigate([PATH_CONSTANTS.CLIENT_DASHBOARD]);
        }
        else if (this.rolename === 'ADMIN') {
          // this.router.navigate([PATH_CONSTANTS.ADMIN_DASHBOARD]);
        }
      }
    });
  }

  openWarningDialogForPostProject() {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Are you sure you want to add new project?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.localStorageService.removeItem('addNewProjectFormValue');
        this.localStorageService.removeItem('selectedJobsiteOfDropdown');
        this.localStorageService.removeItem('Data0');
        this.localStorageService.removeItem('addProjectDetail');
        this.localStorageService.removeItem('jobsiteScreen');
        this.localStorageService.removeItem('currentProjectStep');
        this.localStorageService.removeItem('unselectedLineItem');
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }
  openWarningDialogForPostJob() {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Are you sure you want to add new job?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        // this.router.navigate(['/client/post-job']);
        this.localStorageService.removeItem('jobId');
        const currentUrl = this.router.url;
        if (currentUrl === '/client/post-job') {
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
            this.router.navigate([currentUrl]);
          });
        }
        else {
          this.router.navigate(['/client/post-job']);
        }
      }
    });
  }
  workerRatingAndReviewClicked(): void {
    this.router.navigate([PATH_CONSTANTS.RATING_AND_REVIEW]);
  }
  workerInvoicesClicked(): void {
    this.router.navigate([PATH_CONSTANTS.WORKER_INVOICE]);

  }
  subcontractorRatingAndReviewClicked(): void {
    this.localStorageService.setItem('subcontractorRatingReviewClicked', true);
    this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_RATING_AND_REVIEW]);
  }
  subcontractorInvoicesClicked(): void {
    this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_INVOICE]);
  }
  subcontractorCloseoutPackagesClicked(): void {
    this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_CLOSEOUT]);
  }
  copyProject() {
    const selectedProject = this.localStorageService.getSelectedProjectObject();
    this.postProjectService.cloneProject(selectedProject.id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.getProjectById(data.data);
        }
        else {
          this.notificationService.error(data.message, '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  getProjectById(id) {
    this.postProjectService.getProjectById(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.copiedProject = data.data;
          this.editProject(this.copiedProject);
        }
        else {
          this.notificationService.error(data.message, '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  editProject(project: any): void {
    this.localStorageService.removeItem('InvitedSubcontracor');
    this.localStorageService.removeItem('inviteSubcontractorFlage');
    const projectDetail = project;
    if (this.localStorageService.getItem('addProjectDetail')) {
      this.openWarningDialogForCopyProject(projectDetail);
    }
    else {
      const currentUrl = this.router.url;
      if (currentUrl === '/client/post-project') {
        this.localStorageService.setItem('editMode', true);
        this.setValueOfEditProject(projectDetail);
        this.postProjectService.editProject.next(projectDetail);
        this.localStorageService.setItem('jobsiteScreen', 'jobsiteListing');
        this.postProjectService.jobsiteScreenChange.next('jobsiteListing');
        this.localStorageService.setItem('currentProjectStep', 1);
        this.postProjectService.currentPostProjectStep.next(1);
        this.projectJobSelectionService.addJobsiteSubject.next(projectDetail);
        this.localStorageService.removeItem('editMode');
        this.router.navigate(['/client/post-project']);
      }
      else {
        this.setValueOfEditProject(projectDetail);
        this.postProjectService.currentPostProjectStep.next(1);
        this.router.navigate(['/client/post-project']);
      }
    }
  }

  openWarningDialogForCopyProject(project) {
    let options = null;
    options = {
      title: 'Warning',
      message: 'You will lose unsaved data of currently opened project. Are you sure you want to copy ' + project.title + '?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.localStorageService.removeItem('addNewProjectFormValue');
        this.localStorageService.removeItem('selectedJobsiteOfDropdown');
        this.localStorageService.removeItem('Data0');
        this.localStorageService.removeItem('addProjectDetail');
        this.localStorageService.removeItem('jobsiteScreen');
        this.localStorageService.removeItem('currentProjectStep');
        this.localStorageService.removeItem('unselectedLineItem');
        this.localStorageService.removeItem('milestoneScreen');
        this.localStorageService.removeItem('addJobsiteScreen');
        this.localStorageService.removeItem('addLineItemScreen');
        this.localStorageService.setItem('editMode', true);
        this.setValueOfEditProject(project);
        this.postProjectService.editProject.next(project);
        this.localStorageService.setItem('jobsiteScreen', 'jobsiteListing');
        this.postProjectService.jobsiteScreenChange.next('jobsiteListing');
        this.localStorageService.setItem('currentProjectStep', 1);
        this.postProjectService.currentPostProjectStep.next(1);
        this.projectJobSelectionService.addJobsiteSubject.next(project);
        this.projectJobSelectionService.selectedJobsiteOfDropdown.next(null);
        this.localStorageService.removeItem('editMode');
        this.router.navigate(['/client/post-project']);
      }
    });
  }


  setValueOfEditProject(projectDetail): void {
    // this.selectedFilteredJobsite = null;    
    this.localStorageService.setItem('addProjectDetail', projectDetail);
    const form = {
      bidDueDate: projectDetail.bidDueDate,
      company: projectDetail.company,
      completionDate: projectDetail.completionDate,
      createdBy: projectDetail.createdBy,
      id: projectDetail.id,
      industry: projectDetail.industry,
      isNegotiable: projectDetail.isNegotiable,
      region: projectDetail.region,
      startDate: projectDetail.startDate,
      state: projectDetail.state,
      title: projectDetail.title,
      type: projectDetail.type,
      updatedBy: projectDetail.updatedBy
    };
    this.localStorageService.setItem('addNewProjectFormValue', form);
    this.postProjectService.addNewProject.next(projectDetail);
  }

  public getUnreadMessages(): void {
    this.subscription.add(this.chatMessageServiceService.unreadMessagesCount.subscribe(e => {
      this.chatMessageServiceService.getUnreadMessageCount(this.user.id).subscribe(e => {
        this.totalMessages = e.data as number;
        if (this.totalMessages === 0) {
          this.messageHidden = true;
        } else {
          this.messageHidden = false;
        }
      });
    }));
  }

  markMessageAsSeen(): void {
    this.chatMessageServiceService.markNotificationAsSeenByUserId(this.user.id).subscribe(e => {
      if (e.statusCode === '200' && e.message === 'OK') {
        this.getUnreadMessages();
      } else {
        this.notificationService.error(e.message, '');
      }
    },
      error => {
        console.log(error);
      });
  }




  openChat() {
    switch (this.rolename) {
      case 'CLIENT':
        this.router.navigate([PATH_CONSTANTS.CLIENT_CHAT_SCREEN]);
        break;
      case 'SUBCONTRACTOR':
        this.router.navigate([PATH_CONSTANTS.SUBCONTRACTOR_CHAT_SCREEN]);
        break;
      case 'WORKER':
        this.router.navigate([PATH_CONSTANTS.WORKER_CHAT_SCREEN]);
        break;
    }

  }
  getLogedInClientDetail(id) {
    this._clientProfileService.getClientDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.client = data.data;
          this.profileImage = this.client.photo;
          this.usernameLabel = this.client.user.firstName.substring(0, 1) + this.client.user.lastName.substring(0, 1);
          this.loggedInUserName = this.client.user.firstName + ' ' + this.client.user.lastName;
          if (this.client.photo) {
            this.singleImageView = environment.baseURL + '/file/getById?fileId=' + this.profileImage;
            this.displayAvatar = false;
          }
          else {
            this.displayAvatar = true;
          }
        } else {
        }
      },
      error => {
        console.log(error);
      }
    );
  }
  getLogedInSubcontractorDetail(id) {
    this._subContractorProfileServices.getSubcontractorDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractor = data.data;
          this.profileImage = this.subcontractor.subcontractorProfile.photo;
          this.usernameLabel = this.subcontractor.subcontractorProfile.user.firstName.substring(0, 1) + this.subcontractor.subcontractorProfile.user.lastName.substring(0, 1)
          this.loggedInUserName = this.subcontractor.subcontractorProfile.user.firstName + ' ' + this.subcontractor.subcontractorProfile.user.lastName;
          if (this.subcontractor.subcontractorProfile.photo) {
            this.singleImageView = environment.baseURL + '/file/getById?fileId=' + this.profileImage;
            this.displayAvatar = false;
          }
          else {
            this.displayAvatar = true;
          }
        } else {
          // this._notificationService.error(this.translator.instant('subcontractor.profile.error'), '');
        }
      },
      error => {

      }
    );
  }

  getLogedInWorkerDetail(id) {
    this._workerProfileServices.getWorkerDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.workerDto = data.data;
          this.profileImage = this.workerDto.workerProfile.photo;
          this.usernameLabel = this.workerDto.workerProfile.user.firstName.substring(0, 1) + this.workerDto.workerProfile.user.lastName.substring(0, 1)
          this.loggedInUserName = this.workerDto.workerProfile.user.firstName + ' ' + this.workerDto.workerProfile.user.lastName;
          if (this.workerDto.workerProfile.photo) {
            this.singleImageView = environment.baseURL + '/file/getById?fileId=' + this.profileImage;
            this.displayAvatar = false;
          }
          else {
            this.avatarColor = '#15B533';
            this.displayAvatar = true;
          }
          // this.profileImage=this.workerDto.
        } else {
        }
      },
      error => {

      }
    );
  }
  checkUserRoleRights(role: any, id: any): void {
    let loggedInUserId = this.localStorageService.getLoginUserId();
    if (role === 'SUPERVISOR') {
      this._supervisorService.getSupervisorProfileDetailById(loggedInUserId).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.isSupervisorAllowToPostProject = data.data.isAllowToPostProject;
          this.displayAvatar = true;
          this.usernameLabel = data.data.supervisor.firstName.substring(0, 1) + data.data.supervisor.lastName.substring(0, 1);
        }
      },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          console.log(error);
        });
    }
    else if (role === 'SUBADMIN') {
      if (this.user != null) {
        this.usernameLabel = this.user.firstName.substring(0, 1) + ' ' + this.user.lastName.substring(0, 1)
        this.displayAvatar = true;
      }
      this._adminUserService.getUserPermissionsListById(id).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.userMenuAccess = data.data;
            this.menuAccess();
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          console.log(error);
        }
      );
    }
  }
  menuAccess(): void {
    this.localStorageService.setItem("userAccess", this.userMenuAccess);
    this.userMenuAccess.forEach(element => {
      if (element.menuName === this.menuAccessJson["default"].adminClients.menuName) {
        this.menuAccessJson["default"].adminClients.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminDashboard.menuName) {
        this.menuAccessJson["default"].adminDashboard.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminJobs.menuName) {
        this.menuAccessJson["default"].adminJobs.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminMasters.menuName) {
        this.menuAccessJson["default"].adminMasters.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminProjects.menuName) {
        this.menuAccessJson["default"].adminProjects.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminReports.menuName) {
        this.menuAccessJson["default"].adminReports.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminSubcontractors.menuName) {
        this.menuAccessJson["default"].adminSubcontractors.canView = element.canView;
      }
      else if (element.menuName === this.menuAccessJson["default"].adminWorkers.menuName) {
        this.menuAccessJson["default"].adminWorkers.canView = element.canView;
      }
    });
    this.localStorageService.setItem("subMenuAccess", this.menuAccessJson["default"]);
  }

  redirectToDashboard() {
    CommonUtil.openWindowForExternalurl(PATH_CONSTANTS.WORDPRESS_WEBSITE);
  }
  openDialog(): void {
    let options = null;
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant('are.you.sure.want.to.logout'),
      cancelText: this.translator.instant('no'),
      confirmText: this.translator.instant('yes')

    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.logout();
      }
    });
  }

  getGamificationToggle() {
    this.gamificationConfigurationService.getGamificationConfiguration().subscribe(data => {
      this.isGamificationEnabled = data.data;
    });
  }

  openDialogFoLogoutConfirmation(): void {
    let options = null;
    const message = 'Session timeout, do you want to continue?';
    options = {
      title: 'Warning',
      message: `${message}`,
      confirmText: 'No',
      cancelText: 'Yes',
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.loginService.autoLogout();
      }
    });
  }

}
