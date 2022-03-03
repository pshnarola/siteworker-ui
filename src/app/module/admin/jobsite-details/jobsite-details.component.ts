import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UserService } from 'src/app/service/User.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-jobsite-details',
  templateUrl: './jobsite-details.component.html',
  styleUrls: ['./jobsite-details.component.css']
})
export class JobsiteDetailsComponent implements OnInit, OnDestroy {
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;
  totalRecords: any;
  isOpenLineItemdialog = false;
  lineItem;
  showMore = false;

  globalFilter: string;
  offset: Number = 0;
  isSelectedJobSite: boolean = false;
  JobSiteDetail: any;

  selectedJobsiteId: any;
  sortOrder: number;
  sortField: any;
  loggedInUserId: any;

  queryParam;
  queryParamToassign;
  supervisorList;
  dataTableParam: DataTableParam;
  filteredStatus: any[];
  filteredSupervisor: any[];
  subscription = new Subscription();


  columns = [
    { label: this.translator.instant('work.type'), value: 'workType', selected: true },
    { label: this.translator.instant('line.item.id'), value: 'lineItemId', selected: true },
    { label: this.translator.instant('line.item.name'), value: 'lineItemName', selected: true },
    { label: this.translator.instant('cost'), value: 'cost', selected: true },
    { label: this.translator.instant('description'), value: 'description', selected: true },
    { label: this.translator.instant('inclusion'), value: 'inclusions', selected: false },
    { label: this.translator.instant('exclusion'), value: 'exclusions', selected: false },
    { label: this.translator.instant('unit'), value: 'unit.name', selected: false },
    { label: this.translator.instant('quantity'), value: 'quantity', selected: false },
    { label: this.translator.instant('dynamic.label1'), value: 'dynamicLabel1', selected: false },
    { label: this.translator.instant('dynamic.label2'), value: 'dynamicLabel2', selected: false },
    { label: this.translator.instant('dynamic.label3'), value: 'dynamicLabel3', selected: false },
  ];


  paymentColumns = [
    { label: this.translator.instant('milestone.name'), value: 'name' },
    { label: this.translator.instant('line.item.and.closeout.package'), value: 'lineItem' },
    { label: this.translator.instant('amount.release'), value: 'cost' },
    { label: this.translator.instant('percentage'), value: 'percentage' },
  ];

  _selectedColumns: { label: any; value: string; }[];

  projectDetail: any;

  constructor(
    private translator: TranslateService,
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private notificationService: UINotificationService,
    private _projectDetailService: ProjectDetailService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private confirmDialogService: ConfirmDialogueService,
    private router: Router
  ) {
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.dataTableParam = {
      offset: 0,
      size: 2,
      sortField: 'FIRST_NAME',
      sortOrder: 1,
      searchText: '{"ROLE_NAME": "SUPERVISOR"}'
    };
    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.addHideAllLabelSubject.next(false);
  }

  ngOnInit(): void {
    this._selectedColumns = this.columns.filter(x => x.selected == true);

    this.getSelectedJobSiteDetails();
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }

  openLineItemDialog(entity) {
    this.lineItem = entity.lineItem;
    this.isOpenLineItemdialog = true;
  }

  onHideLineItem(event) {
    this.lineItem = null;
    this.isOpenLineItemdialog = false;
  }

  cancelLineItemListingDialog(event) {
    this.lineItem = null;
    this.isOpenLineItemdialog = false;
  }

  getSelectedJobSiteDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(data => {
      const project = this.localStorageService.getSelectedProjectObject();
      const jobSite = this.localStorageService.getSelectedJobsiteObject();
      if (jobSite) {
        if (jobSite.id === 'jid') {
          this.isSelectedJobSite = false;
          this.JobSiteDetail = null;
          this.projectDetail = null;
        }
        else {
          this.JobSiteDetail = jobSite;
          this.projectDetail = project;
          this.showMore = false;
          if (this.JobSiteDetail !== null) {
            this.isSelectedJobSite = true;
          }
        }
      } else {
        this.isSelectedJobSite = false;
        this.JobSiteDetail = null;
        this.projectDetail = null;
      }
    }));
  }

}
