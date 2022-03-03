import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { LineItemService } from 'src/app/service/client-services/post-project/line-item.service';
import { PostProjectService } from 'src/app/service/client-services/post-project/post-project.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { LineItem } from '../../../Vos/lineItemModel';

@Component({
  selector: 'app-get-line-item',
  templateUrl: './get-line-item.component.html',
  styleUrls: ['./get-line-item.component.css']
})
export class GetLineItemComponent implements OnInit {

  loading = false;
  offset: Number = 0;
  totalRecords: Number = 0;
  data: LineItem[] = [];
  datatableParam: DataTableParam;
  filterMap = new Map();
  sortField = 'CREATED_DATE';
  queryParam;
  sortOrder;
  size;
  globalFilter;
  isEditdialog = false;
  @Input() id;
  @Output() cancelDialog = new EventEmitter<boolean>();

  @ViewChild('dt') table: Table;
  columns = [
    { label: this.translator.instant('work.type'), value: 'WORK_TYPE' },
    { label: this.translator.instant('line.item.id'), value: 'LINE_ITEM_ID' },
    { label: this.translator.instant('line.item.name'), value: 'LINE_ITEM_NAME' },
    { label: this.translator.instant('description'), value: 'DESCRIPTION' },
    { label: this.translator.instant('cost'), value: 'COST' }
  ];

  constructor(
    private translator: TranslateService,
    private confirmDialogService: ConfirmDialogueService,
    private localStorageService: LocalStorageService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private postProjectService: PostProjectService,
    private lineItemService: LineItemService,
    private notificationService: UINotificationService,
  ) { }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.setFilter(this.id);
  }

  setFilter(id) {
    this.filterMap.clear();
    if (id !== '') {
      this.filterMap.set('JOBSITE_ID', id);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: 0,
      size: 10,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadLineItemList();
  }

  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    if (event.sortField) {
      this.sortField = event.sortField;
    }
    else {
      this.sortField = 'CREATED_DATE'
    }
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadLineItemList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadLineItemList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    console.log(this.datatableParam);
    if (this.id) {
      this.lineItemService.getLineItem(this.queryParam).subscribe(
        data => {
          this.data = data.result;
          this.loading = false;
          this.offset = data.first;
          this.totalRecords = data.totalRecords;
        }
      );
    }
  }

  editLineItem(lineItem) {
    this.cancelDialog.emit(false);
    this.localStorageService.setItem('lineItem', lineItem);
    this.lineItemService.lineItemIdTransfer.next(lineItem);
    setTimeout(
      () => {
        if (this.localStorageService.getItem('milestoneScreen')) {
          this.localStorageService.removeItem('milestoneScreen');
        }
        this.localStorageService.removeItem('addJobsiteScreen');
        this.localStorageService.setItem('addLineItemScreen', 'addLineItem', false);
        this.postProjectService.jobsiteScreenChange.next('addLineItem');
        if (this.localStorageService.getItem('currentProjectStep') === 3) {
          this.localStorageService.setItem('currentProjectStep', 2);
          this.postProjectService.currentPostProjectStep.next(2);
        }
      }, 1000
    );
  }

  openDialog(id, name, paymentMilestone) {
    let options = null;
    let message = '';
    if (paymentMilestone === null) {
      message = "Are you sure you want to delete?";
    }
    else {
      message = name + " is already associated with " + paymentMilestone.name + ", please unassign to delete it.";
    }
    options = {
      title: "Warning",
      message: message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (paymentMilestone === null) {
          this.deleteLineItem(id);
        }
      }
    });
  }

  deleteLineItem(id) {
    this.lineItemService.deleteLineItemById(id,
      this.translator.instant('lineItem.deleted.successfully')).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('lineItem.deleted.successfully'), '');
          } else {
            this.notificationService.error(data.message, '');
          }
        }
      );
    setTimeout(() => {
      this.cancelDialog.emit(false);
    }, 2000);
  }
}
