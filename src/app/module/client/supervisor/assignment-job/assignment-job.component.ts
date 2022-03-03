import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { JobDetailService } from 'src/app/service/client-services/job-detail/job-detail.service';
import { SupervisorService } from 'src/app/service/client-services/supervisor/supervisor.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-assignment-job',
  templateUrl: './assignment-job.component.html',
  styleUrls: ['./assignment-job.component.css']
})
export class AssignmentJobComponent implements OnInit {

  loading = false;
  offset: Number = 0;
  totalRecords: Number = 0;
  data: any[] = [];
  datatableParam: DataTableParam;
  filterMap = new Map();
  sortField = 'TITLE';
  queryParam;
  sortOrder;
  size = 10;
  globalFilter;
  id;
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  @ViewChild('dt') table: Table;
  columns = [
    { label: this.translator.instant('title'), value: 'TITLE' }
  ];

  constructor(
    private translator: TranslateService,
    private _jobDetailsService: JobDetailService,
    private _supervisorService: SupervisorService) { }

  ngOnInit(): void {
    this._supervisorService.supervisorIdTransfer.subscribe(
      data => {
        this.id = data;
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
    this.loadSupervisorJobList();
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
    this.loadSupervisorJobList();
  }

  loadSupervisorJobList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    if(this.id){
      this._jobDetailsService.getJobDetailList(this.queryParam).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
              this.loading = false;
              this.data = data.data.result;
              this.data.map(e => {
  
              });
              this.offset = data.data.first;
              this.totalRecords = data.data.totalRecords;
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


}
