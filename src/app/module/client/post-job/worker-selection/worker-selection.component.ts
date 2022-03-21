import { MapsAPILoader } from '@agm/core';
import { Component, ElementRef, EventEmitter, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { PostJobServiceService } from 'src/app/post-job-service.service';
import { CertificateService } from 'src/app/service/admin-services/certificate/certificate.service';
import { JobTitleService } from 'src/app/service/admin-services/job-title/job-title.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UserService } from 'src/app/service/User.service';
import { WorkerProfileDetailService } from 'src/app/service/worker-services/worker-profile-detail/worker-profile-detail.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-worker-selection',
  templateUrl: './worker-selection.component.html',
  styleUrls: ['./worker-selection.component.css']
})
export class WorkerSelectionComponent implements OnInit {

  p: number;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  postJobDetails: { jobDetails: any, payDetails: any, workerSelection: any } = {
    jobDetails: '',
    payDetails: '',
    workerSelection: ''
  };

  jobDetail;
  selectedWorkers = [];
  selectedWorkersEmail = [];
  status;
  flag = 0;
  emailFlag = false;
  inviteFlag = 0;
  email;
  otherInviteeList;
  otherInvitees = [];
  otherInviteesEmail = [];
  emailList;
  dataTableParam: DataTableParam;
  data: User[] = [];
  url;
  loading = false;
  offset = 0;
  workers;
  totalRecords = 0;
  emptyFlag: boolean = false;
  queryParam;
  @Output() submittedWorkerSelection = new EventEmitter<any>();
  @Output() previousClick = new EventEmitter<any>();
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  workerSelectionForm: FormGroup;
  isFilterOpened = false;
  emailFilterValue: string;
  addedWorkerFlag = false;
  workerId: string;
  workerDetail;
  profileImage: any;
  imageUrl;
  globalFilter;
  subscription = new Subscription();
  datatableParamCertificate = new DataTableParam();
  certificates;
  certificateData: Subscription;
  filteredCertificates: any[];
  filterWorkerName = [];
  filterCertificateValue = [];
  filteredJobTitle = [];
  jobTitleFilter = [];
  location;
  geoCoder;
  filterMap = new Map();
  @ViewChild('search')
  public searchElementRef: ElementRef;
  zoom: number;
  datatableParamJobTitle = new DataTableParam();
  jobTitleData;
  jobTitleList = [];
  workerNameParams: { name: any; };
  filterWorkers: any;
  latitude: any;
  longitude: any;
  isWorkerInvite: boolean = false;
  constructor(
    private postJobService: PostJobServiceService,
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService,
    private confirmDialogService: ConfirmDialogueService,
    private translator: TranslateService,
    private router: Router,
    private notificationService: UINotificationService,
    private userService: UserService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private certificateService: CertificateService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    private jobTitleService: JobTitleService,
    private filterLeftPanelService: FilterLeftPanelDataService) {

    this.isWorkerInvite = this.localStorageService.getIsWorkerInvite();

    this.dataTableParam = new DataTableParam();
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: '{"ROLE_NAME": "WORKER"}'
    };
  }

  ngOnInit(): void {
    this.initializeForm();
    this.postJobService.initializeJobDetailsForm();
    this.postJobDetails = this.postJobService.postJobDetails;
    this.getCertificateList();
    this.getJobTitleList();
    this.subscription.add(this.projectJobSelectionService.workerSelectionSubject.subscribe(data => {
      this.setDefaultCriteriaCustom();
      this.getLocation();
    }
    ));

    if (this.isWorkerInvite === true) {
      this.setDefaultCriteriaCustom();
      this.getLocation();
    }
  }
  setDefaultCriteria() {
    let filterMap = new Map();
    filterMap.set('CLIENT_INVITEE_ID', this.localStorageService.getLoginUserId());
    filterMap.set('ROLE_NAME', 'WORKER');
    filterMap.set('PROJECT_OR_JOB_ID', this.localStorageService.getItem('jobId'));
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    console.log('149 =>', 149);

    this.getWorkerProfileDetail();
  }
  getWorkerProfileDetail() {
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.userService.userSelection(this.queryParam).subscribe(data => {
      console.log('156 =>', 156);

      this.workerDetail = data.data.result;
      if (this.workerDetail.length === 0) {
        this.emptyFlag = true;
      }
      else {
        this.emptyFlag = false;
      }
      this.totalRecords = data.data.totalRecords;
      this.imageUrl = environment.baseURL + '/file/getById?fileId=';
    });


  }
  setDefaultCriteriaCustom() {

    let filterMap = new Map();
    filterMap.set('CLIENT_INVITEE_ID', this.localStorageService.getLoginUserId());
    filterMap.set('ROLE_NAME', 'WORKER');
    filterMap.set('PROJECT_OR_JOB_ID', this.localStorageService.getItem('jobId'));
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.getWorkerProfileDetailCustom();
  }
  getWorkerProfileDetailCustom() {
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.userService.userSelectionCustom(this.queryParam).subscribe(data => {
      console.log('194, data =>', 194, data);

      this.workerDetail = data.data.result;
      if (this.workerDetail.length === 0) {
        this.emptyFlag = true;
      }
      else {
        this.emptyFlag = false;
      }
      this.totalRecords = data.data.totalRecords;
      this.imageUrl = environment.baseURL + '/file/getById?fileId=';
    });


  }

  // tslint:disable-next-line: typedef
  prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  public paginate(event: any): void {
    this.offset = event.first / event.rows;
    this.dataTableParam = {
      offset: this.offset,
      size: this.size = event.rows ? event.rows : this.size,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: `{"ROLE_NAME": "WORKER"}`
    };
    if (this.jobTitleFilter.length || this.filterWorkerName.length || this.filterCertificateValue.length || this.location) {
      this.setDefaultCriteria();
    } else {
      this.setDefaultCriteriaCustom();
    }
  }
  initializeForm(): void {
    this.workerSelectionForm = this.formBuilder.group({
      leadId: [],
      inviteeList: [],
      otherInviteeList: [],
    });
  }
  onSelectWorker(worker): void {
    if (this.selectedWorkers.length < 15) {
      this.selectedWorkers.push(worker);
      this.flag = 1;
    }
  }

  removeFromSelectedWorker(worker): void {
    const index = this.selectedWorkers.indexOf(worker);
    if (index !== -1) {
      this.selectedWorkers.splice(index, 1);
      this.flag = 0;
    }
  }

  isWorkerSelected(id): boolean {
    let count = 0;
    this.selectedWorkers.forEach(
      function (worker) {
        if (worker.user.id === id) {
          count++;
        }
      }
    );
    if (count > 0) {
      return true;
    }
    else {
      return false;
    }
  }
  isWorkerInvited(id): boolean {
    let invitedWorker = this.localStorageService.getItem('jobInviteeList');
    if (invitedWorker) {
      if (!(invitedWorker.some((worker) => worker.user.id === id))) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return true;
    }
  }
  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
  }
  onFilterClear(): void {
    this.setDefaultCriteriaCustom();
    this.jobTitleFilter = [];
    this.filterWorkerName = [];
    this.filterCertificateValue = [];
    this.location = '';
    this.latitude = '';
    this.longitude = '';
  }
  validateEmail(event: any[]): void {
    const EMAIL_REGEXP = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;
    // tslint:disable-next-line: prefer-for-of
    event.forEach(element => {
      this.email = element;
      if (this.email !== '' && !EMAIL_REGEXP.test(this.email)) {
        this.emailFlag = true;
        this.notificationService.error('', this.email + ' is not a valid email');
      }
      else {
        this.emailFlag = false;
      }
    });

  }
  onInvite(): void {

    this.jobDetail = this.localStorageService.getItem('jobDetail');

    this.workerSelectionForm.value.otherInviteeList = this.otherInvitees;
    this.workerSelectionForm.value.leadId = this.jobDetail.jobDetail.id;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.selectedWorkers.length; i++) {
      this.email = this.selectedWorkers[i].user.email;
      this.selectedWorkersEmail.push(this.email);
      this.workerSelectionForm.value.inviteeList = this.selectedWorkersEmail;
    }
    if (this.selectedWorkers.length === 0 && this.otherInvitees.length === 0) {
      this.notificationService.error(this.translator.instant('no.workers.selected'), '');

    }
    else {
      this.postJobService.addJobInvitee(JSON.stringify(this.workerSelectionForm.value)).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('worker.invited'), '');
          this.inviteFlag = 1;
          this.localStorageService.setItem('jobInviteeList', this.selectedWorkers);
          this.selectedWorkersEmail = [];
          this.selectedWorkers = [];
          this.selectedWorkers.length = 0;
          this.otherInvitees = [];
          this.selectedWorkers.length = 0;
          this.addedWorkerFlag = true;
        }
        else {
          this.notificationService.error(data.message, '');

        }
      });
    }
  }

  onSubmitWorkerSelection(): void {
    this.submittedWorkerSelection.emit(this.selectedWorkers);
  }

  saveDraft(): void {
    this.postJobService.saveTillWorkerSelectionAsDraft(this.selectedWorkers);
  }
  goToDashboard(): void {
    if (this.otherInvitees.length !== 0) {
      this.flag = 1;
      this.workerSelectionForm.value.otherInviteeList = this.otherInvitees;
    }
    if (this.flag && !this.inviteFlag) {
      let options = null;
      const message = this.translator.instant('post.new.job.dialog.message');
      options = {
        title: this.translator.instant('warning'),
        message: this.translator.instant(`${message}`),
        cancelText: this.translator.instant('dialog.cancel.text'),
        confirmText: this.translator.instant('dialog.confirm.text')

      };
      this.confirmDialogService.open(options);
      this.confirmDialogService.confirmed().subscribe(confirmed => {
        this.jobDetail = this.localStorageService.getItem('jobDetail');
        if (confirmed) {
          this.workerSelectionForm.value.leadId = this.jobDetail.jobDetail.id;
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.selectedWorkers.length; i++) {
            this.email = this.selectedWorkers[i].user.email;
            this.selectedWorkersEmail.push(this.email);
            this.workerSelectionForm.value.inviteeList = this.selectedWorkersEmail;
          }
          this.postJobService.addJobInvitee(JSON.stringify(this.workerSelectionForm.value)).subscribe(data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('worker.invited'), '');
              this.inviteFlag = 1;
              this.selectedWorkersEmail = [];
              this.selectedWorkers = [];
              this.selectedWorkers.length = 0;
              this.otherInvitees = [];
              this.selectedWorkers.length = 0;
              this.addedWorkerFlag = true;
              setTimeout(() => {
                this.router.navigate([PATH_CONSTANTS.CLIENT_DASHBOARD]);
              }, 2000);
            }
          });
        }
      });
    }
    else {
      this.router.navigate([PATH_CONSTANTS.CLIENT_DASHBOARD]);
    }
  }

  goToJobDetail() {
    this.localStorageService.removeItem('jobId');
    this.localStorageService.removeItem('jobDetail');
    this.localStorageService.removeItem('isWorkerInvite');
    this.router.navigate([PATH_CONSTANTS.VIEW_JOB_DETAILS])
  }

  postNewJob(): void {
    if (this.otherInvitees.length !== 0) {
      this.flag = 1;
      this.workerSelectionForm.value.otherInviteeList = this.otherInvitees;
    }
    if (this.flag && !this.inviteFlag) {
      let options = null;
      const message = this.translator.instant('post.new.job.dialog.message');
      options = {
        title: this.translator.instant('warning'),
        message: this.translator.instant(`${message}`),
        cancelText: this.translator.instant('dialog.cancel.text'),
        confirmText: this.translator.instant('dialog.confirm.text')

      };
      this.confirmDialogService.open(options);
      this.confirmDialogService.confirmed().subscribe(confirmed => {
        this.jobDetail = this.localStorageService.getItem('jobDetail');
        if (confirmed) {
          this.workerSelectionForm.value.leadId = this.jobDetail.jobDetail.id;
          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < this.selectedWorkers.length; i++) {
            this.email = this.selectedWorkers[i].user.email;
            this.selectedWorkersEmail.push(this.email);
            this.workerSelectionForm.value.inviteeList = this.selectedWorkersEmail;
          }
          this.postJobService.addJobInvitee(JSON.stringify(this.workerSelectionForm.value)).subscribe(data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('worker.invited'), '');
              this.inviteFlag = 1;
              this.selectedWorkersEmail = [];
              this.selectedWorkers = [];
              this.selectedWorkers.length = 0;
              this.otherInvitees = [];
              this.selectedWorkers.length = 0;
              this.addedWorkerFlag = true;
              let currentUrl = this.router.url;
              if (currentUrl === '/client/post-job') {
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  setTimeout(() => {
                    this.router.navigate([currentUrl]);
                  }, 2000);
                });
              }
              else {
                this.router.navigate(['/client/post-job']);
              }
            }
          });
        }
      });
    }
    else {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate([PATH_CONSTANTS.POST_JOB]);
      });
    }
  }
  previous(): void {
    this.previousClick.emit('');
  }
  redirectToWorker(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_WORKER_PROFILE + "?user=" + id);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.localStorageService.removeItem('jobInviteeList');
  }
  filter() {
    let filterMap = new Map();
    filterMap.set('CLIENT_INVITEE_ID', this.localStorageService.getLoginUserId());
    filterMap.set('ROLE_NAME', 'WORKER');
    filterMap.set('PROJECT_OR_JOB_ID', this.localStorageService.getItem('jobId'));
    if (this.jobTitleFilter.length) {
      filterMap.set('JOB_TITLE_FILTER', this.jobTitleFilter.map(e => e.id).toString());
    }
    if (this.filterWorkerName.length) {
      filterMap.set('WORKER_NAME_FILTER', this.filterWorkerName.map(e => e.id).toString());
    }
    if (this.filterCertificateValue.length) {
      filterMap.set('CERTIFICATE_FILTER', this.filterCertificateValue.map(e => e.id).toString());
    }
    if (this.location !== '') {
      filterMap.set('LATITUDE', this.latitude);
      filterMap.set('LONGITUDE', this.longitude);
      filterMap.set('WORKER_LOCATION', this.location);
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    if (this.jobTitleFilter.length || this.filterWorkerName.length || this.filterCertificateValue.length || this.location) {
      this.getWorkerProfileDetail();
    } else {
      this.setDefaultCriteriaCustom();
    }
  }
  getCertificateList(): void {
    this.datatableParamCertificate = {
      offset: 0,
      size: 100000,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: '{"IS_ENABLE": true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParamCertificate);
    this.certificateData = this.certificateService.getCertificateList(this.queryParam).subscribe(data => {
      this.certificates = data.data?.result;
    });
  }
  filterCertificate(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.certificates.length; i++) {
      const certificate = this.certificates[i];
      if (certificate.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(certificate);
      }
    }
    this.filteredCertificates = filtered;

  }
  getLocation(): void {
    this.mapsAPILoader.load().then(() => {
      this.geoCoder = new google.maps.Geocoder();

      const autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener('place_changed', () => {
        this.ngZone.run(() => {
          const place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.filterMap.clear();
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          const info = place.address_components;
          info.forEach(e => {
            switch (e.types[0]) {
              case 'sublocality_level_1':
                this.filterMap.set('REGION', e.long_name);
                break;
              case 'administrative_area_level_1':
                this.filterMap.set('STATE', e.long_name);
                break;
              case 'country':
                this.filterMap.set('COUNTRY', e.long_name);
                break;
              case 'postal_code':
                this.filterMap.set('ZIPCODE', e.long_name);
                break;
              case 'locality':
                this.filterMap.set('LOCALITY', e.long_name);
                break;
              default:
                break;
            }
          });
          this.filterMap.set('LATITUDE', place.geometry.location.lat());
          this.filterMap.set('LONGITUDE', place.geometry.location.lng());
          this.filterMap.set('ADDRESS', place.formatted_address);
          this.zoom = 12;
          const jsonObject = {};
          this.getAddressFromAutocompleteMapsApi(this.filterMap);

          this.filterMap.forEach((value, key) => {
            jsonObject[key] = value;
          });
        });
      });
    });


  }
  getAddressFromAutocompleteMapsApi(event): void {
    this.latitude = event.get('LATITUDE');
    this.longitude = event.get('LONGITUDE');

  }
  filterJobTitle(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.jobTitleData.length; i++) {
      const jobTitle = this.jobTitleData[i];
      if (jobTitle.title.toLowerCase().indexOf(query.toLowerCase()) >= 0) {
        filtered.push(jobTitle);
      }
    }
    this.filteredJobTitle = filtered;
  }
  getJobTitleList(): void {

    this.datatableParamJobTitle = {
      offset: 0,
      size: 100000,
      sortField: 'TITLE',
      sortOrder: 1,
      searchText: '{"ENABLE": true}'
    };
    this.queryParam = this.prepareQueryParam(this.datatableParamJobTitle);
    this.jobTitleService.getJobTitleList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.jobTitleData = data.data.result;
            // tslint:disable-next-line: no-shadowed-variable
            this.jobTitleData.forEach(data => {
              this.jobTitleList.push(data.title);
            });
          }
        } else {
        }
      },
      error => {
      }
    );
  }
  getWorkerByName(name): void {
    this.workerNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.workerNameParams);
    this.filterLeftPanelService.getWorkerByNameVirtualScroll(this.queryParam).subscribe(data => {
      this.filterWorkers = data.data;
      this.filterWorkers = this.filterWorkers.sort();
    });
  }
  getFullName(data) {
    return data.first + ' ' + data.last;
  }
}
