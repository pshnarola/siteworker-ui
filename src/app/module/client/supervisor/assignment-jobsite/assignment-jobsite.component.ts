import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { JobsiteDetailService } from 'src/app/service/client-services/jobsite-details/jobsite-detail.service';
import { SupervisorService } from 'src/app/service/client-services/supervisor/supervisor.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { SupervisorAssignmentJob } from 'src/app/shared/vo/SupervisorAssignmentJob';

@Component({
  selector: 'app-assignment-jobsite',
  templateUrl: './assignment-jobsite.component.html',
  styleUrls: ['./assignment-jobsite.component.css']
})
export class AssignmentJobsiteComponent implements OnInit {

  loading = false;
  offset: Number = 0;
  totalRecords: Number = 0;
  data: SupervisorAssignmentJob[] = [];
  datatableParam: DataTableParam;
  filterMap = new Map();
  sortField = 'TITLE';
  queryParam;
  sortOrder;
  size = 10;
  globalFilter;
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  @ViewChild('dt') table: Table;
  columns = [
    { label: this.translator.instant('project.title'), value: 'PROJECT_TITLE', sortable: false},
    { label: this.translator.instant('title'), value: 'TITLE', sortable: true }
  ];

  constructor(
    private translator: TranslateService,
    private _jobsiteDetailsService: JobsiteDetailService,
    private _supervisorService: SupervisorService
  ) { }

  ngOnInit(): void {
    this._supervisorService.supervisorIdTransfer.subscribe(
      data => {
        this.filter(data);
      }
    );
  }

  ngOnDestroy(): void {
  }

  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.sortField = event.sortField ? event.sortField : 'TITLE';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadSupervisorJobSiteList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  filter(supervisorFilterId) {
    this.filterMap.clear();
    if (supervisorFilterId !== '') {
      this.filterMap.set('SUPERVISOR', supervisorFilterId);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadSupervisorJobSiteList();
  }

  loadSupervisorJobSiteList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._jobsiteDetailsService.getJobsiteDetailList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            this.data = data.data.result;
            this.data.map(e => {

            });
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

}
