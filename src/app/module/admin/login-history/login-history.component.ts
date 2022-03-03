import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Table } from 'primeng/table';
import { LoginHistoryService } from 'src/app/service/admin-services/login-history/login-history.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-login-history',
  templateUrl: './login-history.component.html',
  styleUrls: ['./login-history.component.css']
})
export class LoginHistoryComponent implements OnInit, OnDestroy {

  @ViewChild('dt') table: Table;
  loading = false;
  offset = 0;
  datatableParam: DataTableParam;
  totalRecords = 0;
  sortField = 'CREATED_DATE';
  queryParam;
  globalFilter = null;
  sortOrder = 1;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;

  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  userTitles = [];
  userTitleParams;

  columns = [
    { label: this.translator.instant('sr.no'), value: 'sr_no', isSortable: false },
    { label: this.translator.instant('company.person.name'), value: 'NAME_OR_COMPANY_NAME', isSortable: true },
    { label: this.translator.instant('email.address'), value: 'EMAIL', isSortable: true },
    { label: this.translator.instant('user.type'), value: 'ROLE_NAME', isSortable: true },
    { label: this.translator.instant('login.at'), value: 'CREATED_DATE', isSortable: true }
  ];

  data = [];

  dateErrorFlag = false;

  userRole = [
    {
      roleName: 'Client',
      roleValue: 'CLIENT'
    },
    {
      roleName: 'Subcontractor',
      roleValue: 'SUBCONTRACTOR'
    },
    {
      roleName: 'Worker',
      roleValue: 'WORKER'
    },
    {
      roleName: 'Admin',
      roleValue: 'ADMIN'
    },
    {
      roleName: 'Sub Admin',
      roleValue: 'SUBADMIN'
    },
    {
      roleName: 'Supervisor',
      roleValue: 'SUPERVISOR'
    }
  ];

  filterForm: FormGroup;

  isFilterOpened = false;

  constructor(
    private captionChangeService: HeaderManagementService,
    private translator: TranslateService,
    private dateHelperService: DateHelperService,
    private loginHistoryService: LoginHistoryService,
    private notificationService: UINotificationService,
    private filterlLeftPanelService: FilterLeftPanelDataService,
    private formBuilder: FormBuilder
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.LOGIN_HISTORY);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.initializeFilterForm();
  }

  initializeFilterForm(): void {
    this.filterForm = this.formBuilder.group({
      user: [null],
      companyName: [''],
      startDate: [''],
      endDate: ['']
    });
  }

  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 1 : 0;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.globalFilter;
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadLoginHistoryList();
  }

  // tslint:disable-next-line: typedef
  private prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadLoginHistoryList() {
    this.loading = true;
    console.log(this.datatableParam);
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.loginHistoryService.getLoginHistoryList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            this.data = data.data.result;

            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
          }
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
      }
    );
  }

  onFilterOpen() {
    this.isFilterOpened = !this.isFilterOpened;
  }

  filter(): void {
    const filterMap = new Map();
    const datePipe = new DatePipe('en-US');
    this.dateErrorFlag = false;

    if (((this.filterForm.value.startDate && !this.filterForm.value.endDate) ||
      (!this.filterForm.value.startDate && this.filterForm.value.endDate))) {
      this.dateErrorFlag = true;
    }

    if (!this.filterForm.value.startDate && !this.filterForm.value.endDate) {
      this.dateErrorFlag = false;
    }

    if (this.filterForm.value.startDate > this.filterForm.value.endDate) {
      this.dateErrorFlag = true;
    }

    if (this.filterForm.value.user) {
      filterMap.set('ROLE_NAME', this.filterForm.value.user.roleValue);
    }

    if (this.filterForm.value.companyName) {
      filterMap.set('NAME_OR_COMPANY_NAME', this.filterForm.value.companyName);
    }

    if (this.filterForm.value.startDate) {
      this.dateHelperService.setStartDate(this.filterForm.value.startDate);
      const value = datePipe.transform(this.filterForm.value.startDate, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('START_DATE', value);
    }
    if (this.filterForm.value.endDate) {
      this.dateHelperService.setEndDate(this.filterForm.value.endDate);
      const valueEnd = datePipe.transform(this.filterForm.value.endDate, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('END_DATE', valueEnd);
    }

    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    if (!this.dateErrorFlag) {
      this.globalFilter = JSON.stringify(jsonObject);
      this.datatableParam = {
        offset: this.offset,
        size: 10,
        sortField: this.sortField.toUpperCase(),
        sortOrder: this.sortOrder,
        searchText: this.globalFilter
      };

      console.log(this.datatableParam);

      this.queryParam = this.prepareQueryParam(this.datatableParam);

      this.loginHistoryService.getLoginHistoryList(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.message === 'OK') {
              this.loading = false;
              this.data = data.data.result;

              this.offset = data.data.first;
              this.totalRecords = data.data.totalRecords;
            }
          } else {
            this.loading = false;
          }
        },
        error => {
          this.loading = false;
        }
      );
    }
    else {
      this.notificationService.error('Enter appropriate Date Range', '');
    }
  }

  clear(): void {
    this.filterForm.reset();
    this.filter();
  }


  getName(name): void {

    this.userTitleParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.userTitleParams);
    this.filterlLeftPanelService.getClientAndCompanyName(this.queryParam).subscribe(data => {

      this.userTitles = data.data;
      this.userTitles = this.userTitles.sort();
    });
  }

  exportExcelLoginHistory() {

    let datatableParam = {
      offset: 0,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.globalFilter
    }
    let queryParam = this.prepareQueryParam(datatableParam)
    this.loginHistoryService.exportToExcel(queryParam).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
        const fileName = 'login-history';
        saveAs(blob, fileName);
      },
      error => {

      }
    );

  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    import('file-saver').then(FileSaver => {
      let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
    });
  }
}
