import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { JobRateCardService } from 'src/app/service/admin-services/job-rate-card.service';
import { StateService } from 'src/app/service/admin-services/state/state.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { EnableDisableJobRateCardDTO } from '../../worker/vo/EnableDisableJobRateCardDTO';

@Component({
  selector: 'app-job-rate-card',
  templateUrl: './job-rate-card.component.html',
  styleUrls: ['./job-rate-card.component.css']
})
export class JobRateCardComponent implements OnInit, OnDestroy {
  nameFilterValue;
  columns = [
    { label: this.translator.instant('client'), value: 'client.firstName', sortable: true },
    { label: this.translator.instant('state'), value: 'state.name', sortable: true },
    { label: this.translator.instant('manage.job.rate.card'), value: 'manageRateCard', sortable: false },

  ];
  myForm: FormGroup;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  queryParam;
  dataTableParam = new DataTableParam();
  jobRateCardList: any;
  state = [];
  filteredState: any[];
  globalFilter: string;
  dataTableParamForState: { offset: number; size: number; sortField: string; sortOrder: number; searchText: any; };
  selectedJobRateCardList = [];
  isAllJobRateCardSelected: any;
  message: any;
  fileName = 'Job_Rate_Card_Sample.xlsx';
  currentFile: File;
  selectedFiles: FileList;
  showButtons: boolean = true;
  clientAccess: any;
  btnDisabled: boolean = false;
  status: any;

  constructor(
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private formBuilder: FormBuilder,
    private router: Router,
    private jobRateCardService: JobRateCardService,
    private stateService: StateService,
    private notificationService: UINotificationService,
    private localStorageService: LocalStorageService,
    private confirmDialogueService: ConfirmDialogueService) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.dataTableParam = {
      offset: 0,
      size: 100000,
      sortField: '',
      sortOrder: 1,
      searchText: null
    };
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.clientAccess = this.localStorageService.getItem("userAccess");
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.JOB_RATE_CARD);
    this.initializeForm();
    this.getStateList();
    this.getJobRateCardList();
    if (this.clientAccess) {
      this.menuAccess();
    }
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
  filter() {
    let filterMap = new Map();
    if (this.myForm.value.state) {
      filterMap.set('STATE_ID', this.myForm.value.state.id);
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.getJobRateCardList();
  }
  clear() {
    this.myForm.reset();
    this.dataTableParam = {
      offset: 0,
      size: 100000,
      sortField: '',
      sortOrder: 1,
      searchText: null
    };
    this.getJobRateCardList();
  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      state: [],
    });
  }
  openManageJobRateCard(data?): void {
    if (data) {
      this.localStorageService.setItem('manageEditJobrateCardData', data);
    }
    this.router.navigate(['admin/manage-job-ratecard']);
  }
  getJobRateCardList(): void {
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobRateCardService.getJobRateCardList(this.queryParam).subscribe(data => {
      this.totalRecords = data.data.totalRecords;
      this.jobRateCardList = data.data.result;
    });
  }
  selectAllRateCard(e): void {
    this.selectedJobRateCardList = [];
    const length = e.dt._value.length;
    if (e.checked) {
      this.isAllJobRateCardSelected = true;
      for (let i = 0; i < length; i++) {
        this.selectedJobRateCardList.push(e.dt._value[i]);
      }
    }
    else {
      this.isAllJobRateCardSelected = false;
      this.selectedJobRateCardList.splice(0, length);
    }
  }
  selectRateCard(e): void {
    this.selectedJobRateCardList = [];
    if (e.checked && !this.isAllJobRateCardSelected) {
      this.selectedJobRateCardList.push(e.value);
    }
    else {
      const index = this.selectedJobRateCardList.findIndex(data => data.id === e.value.id);
      this.selectedJobRateCardList.splice(index, 1);
    }
  }
  getStateList(): void {
    this.dataTableParamForState = {
      offset: 0,
      size: 20000,
      sortField: 'NAME',
      sortOrder: -1,
      searchText: null
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParamForState);
    this.stateService.getStateList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.state = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }
  filterState(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.state.length; i++) {
      const client = this.state[i];
      if (client.name.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(client);
      }
    }
    this.filteredState = filtered;
  }
  enableJobRateCard(jobRateCards?): void {
    let enableDisableDTO = new EnableDisableJobRateCardDTO();
    if (jobRateCards) {
      this.selectedJobRateCardList.push(jobRateCards);
      enableDisableDTO.jobRateCards = this.selectedJobRateCardList;
    }
    else {
      enableDisableDTO.jobRateCards = this.selectedJobRateCardList;
    }
    this.jobRateCardService.enableJobRateCard(enableDisableDTO).subscribe(data => {
      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.job.rate.cards.enabled'), '');
        this.selectedJobRateCardList = [];
        this.getJobRateCardList();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  disableJobRateCard(jobRateCards?): void {
    let enableDisableDTO = new EnableDisableJobRateCardDTO();
    if (jobRateCards) {
      this.selectedJobRateCardList.push(jobRateCards);
      enableDisableDTO.jobRateCards = this.selectedJobRateCardList;
    }
    else {
      enableDisableDTO.jobRateCards = this.selectedJobRateCardList;
    }
    this.jobRateCardService.disableJobRateCard(enableDisableDTO).subscribe(data => {
      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('selected.job.rate.cards.disabled'), '');
        this.selectedJobRateCardList = [];
        this.getJobRateCardList();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  menuAccess(): void {
    let accessPermission = this.clientAccess.filter(e => e.menuName == 'Masters');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }
  openDialog(data, status): void {

    let options = null;
    const message = this.translator.instant('dialog.message.region');

    if (status) {
      this.status = this.translator.instant('disable');
    } else {
      this.status = this.translator.instant('enable');
    }

    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${this.status} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text'),
    };

    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (status) {
          this.disableJobRateCard(data);
        }
        else {
          this.enableJobRateCard(data);
        }
      }
    });
  }
}
