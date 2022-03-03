import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { IcJobTypeService } from 'src/app/service/admin-services/job-title/ic-job-title.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { IcJobTitle } from 'src/app/shared/vo/IcJobTitle';

@Component({
  selector: 'app-ic-job-title',
  templateUrl: './ic-job-title.component.html',
  styleUrls: ['./ic-job-title.component.css']
})
export class IcJobTitleComponent implements OnInit {

  @ViewChild('dt') table: Table;
  columns = [
    { label: this.translator.instant('independent.contractor.job.title'), value: 'TITLE' }
  ];

  data: IcJobTitle[] = [];
  url;
  status = true;
  loading = false;
  offset: Number = 0;
  datatableParam: DataTableParam;
  totalRecords: Number = 0;
  filterMap = new Map();
  sortField = 'TITLE';
  queryParam;
  sortOrder;
  size = 2;
  globalFilter;
  submitted = false;
  jobTitle: IcJobTitle;
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  constructor(private translator: TranslateService,
    private _icJobTitleService: IcJobTypeService,
    private confirmDialogService: ConfirmDialogueService) { }

  ngOnInit(): void {
  }

  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : null;
    this.sortField = event.sortField ? event.sortField : 'TITLE';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };

    this.loadIcJobTitleList();
  }


  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadIcJobTitleList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._icJobTitleService.getIcJobTitleList(this.queryParam).subscribe(
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

  approveIcJobTitle(id) {
    this._icJobTitleService.approve(id).subscribe(
      data => {

        this.loadIcJobTitleList();
      },
      error => {

      }
    );
  }

  disApproveIcJobTitle(id) {
    this._icJobTitleService.disapprove(id).subscribe(
      data => {

        this.loadIcJobTitleList();
      },
      error => {

      }
    );
  }

  openDialog(id, title, status) {
    let options = null;
    let message = this.translator.instant('dialog.message');
    if (status) {
      this.status = this.translator.instant('disApprove');
    }
    else {
      this.status = this.translator.instant('approve');
    }
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${this.status} ${title} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (status) {
          this.disApproveIcJobTitle(id);
        }
        else {
          this.approveIcJobTitle(id);
        }
      }
    });
  }

}
