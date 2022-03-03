import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { JobTitleService } from 'src/app/service/admin-services/job-title/job-title.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobTitle } from 'src/app/shared/vo/JobTitle';

@Component({
  selector: 'app-job-title',
  templateUrl: './job-title.component.html',
  styleUrls: ['./job-title.component.css']
})
export class JobTitleComponent implements OnInit, OnDestroy {

  @ViewChild('fileSelect') myFileVariable: ElementRef;

  @ViewChild('dt') table: Table;
  columns = [
    { label: this.translator.instant('worker.job.title'), value: 'TITLE' }
  ];

  fileName = 'JobTitle_Sample.xlsx';
  currentFile: File;
  selectedFiles: FileList;
  message: string;
  selectedJobTitle: JobTitle[] = [];
  jobTitleFilterValue = '';
  jobTitleDialog = false;
  jobTitleForm: FormGroup;
  loggedInUserId: string;
  data: JobTitle[] = [];
  status;
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  url;
  loading = false;
  offset: Number = 0;
  datatableParam: DataTableParam;
  totalRecords: Number = 0;
  filterMap = new Map();
  sortField = 'TITLE';
  queryParam;
  sortOrder;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  globalFilter;
  submitted = false;
  jobTitle: JobTitle;
  dialogHeader: string;
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  showButtons = true;
  masterAccess: any;
  btnDisabled = false;

  constructor(
    private captionChangeService: HeaderManagementService,
    private _formBuilder: FormBuilder,
    private _jobTitleService: JobTitleService,
    private _localStorageService: LocalStorageService,
    private translator: TranslateService,
    private confirmDialogService: ConfirmDialogueService,
    private notificationService: UINotificationService
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 2,
      sortField: 'TITLE',
      sortOrder: 1,
      searchText: null
    };
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.masterAccess = this._localStorageService.getItem('userAccess');

    this.dialogHeader = this.translator.instant('add.worker.job.title');
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.JOB_TITLE);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.initializeForm();
    if (this.masterAccess) {
      this.menuAccess();
    }
  }

  private initializeForm() {
    this.jobTitleForm = this._formBuilder.group({
      id: [],
      title: ['', [CustomValidator.required]],
      createdBy: this.loggedInUserId,
      updatedBy: this.loggedInUserId,
      isEnable: true
    });
  }

  onAddJobTitle() {
    this.submitted = true;
    if (!this.jobTitleForm.valid) {
      CustomValidator.markFormGroupTouched(this.jobTitleForm);
      this.submitted = true;
      return false;
    }

    if (this.jobTitleForm.controls.id.value != null) {
      if (this.jobTitleForm.valid) {
        this._jobTitleService.updateJobTitle(JSON.stringify(this.jobTitleForm.value)).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('job.title.updated.successfully'), '');
              this.loadJobTitleList();
              this.jobTitleDialog = false;
              this.submitted = false;
            }
            else {
              this.notificationService.error(data.message, '');
              this.jobTitleDialog = false;
              this.submitted = false;
            }
          },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
            this.jobTitleDialog = false;
            this.submitted = false;
          }
        );
      }
    }
    else {
      if (this.jobTitleForm.valid) {
        this._jobTitleService.addJobTitle(JSON.stringify(this.jobTitleForm.value)).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('job.title.added.successfully'), '');
              this.loadJobTitleList();
              this.jobTitleDialog = false;
              this.submitted = false;
            }
            else {
              this.notificationService.error(data.message, '');
              this.jobTitleDialog = false;
              this.submitted = false;
            }
          },
          error => {
            this.notificationService.error(this.translator.instant('common.error'), '');
            this.jobTitleDialog = false;
            this.submitted = false;
          }
        );
      }
    }
  }

  editJobTitle(jobTitle: JobTitle): void {
    this.dialogHeader = this.translator.instant('edit.worker.job.title');
    this.jobTitle = { ...jobTitle };
    this.jobTitleForm.controls.id.patchValue(this.jobTitle.id);
    this.jobTitleForm.controls.title.patchValue(this.jobTitle.title);
    this.jobTitleForm.controls.updatedBy.patchValue(this.loggedInUserId);

    this.jobTitleDialog = true;
  }

  disableJobTitle(id: string, selectedJobtitle?) {
    this._jobTitleService.disableJobTitle(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          if (!selectedJobtitle) {
            this.notificationService.success(this.translator.instant('job.title.disabled.successfully'), '');
          }
          this.loadJobTitleList();
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

  disableSelectedJobTitle() {
    this.selectedJobTitle.forEach(jobTitle => this.disableJobTitle(jobTitle.id, true));
    if (this.selectedJobTitle?.length) {
      this.notificationService.success(this.translator.instant('job.title.disabled.successfully'), '');
    }
    this.selectedJobTitle.splice(0, this.selectedJobTitle.length);
  }

  enableJobTitle(id: string) {
    this._jobTitleService.enableJobTitle(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('job.title.enabled.successfully'), '');
          this.loadJobTitleList();
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

  filter() {

    this.filterMap.clear();
    if (this.jobTitleFilterValue !== '') {
      this.filterMap.set('TITLE', this.jobTitleFilterValue);
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
    this.loadJobTitleList();
  }

  clear() {
    this.jobTitleFilterValue = '';
    this.filter();
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
    this.loadJobTitleList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadJobTitleList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._jobTitleService.getJobTitleList(this.queryParam).subscribe(
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
        console.log(error);
      }
    );
  }

  selectFile(event) {
    this.selectedFiles = event.addedFiles;
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('max.file.size.5.mb'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.only.excel.upload'), '');
      }
      event.rejectedFiles = [];
    }
  }

  uploadBulk() {

    this.currentFile = this.selectedFiles[0];
    this._jobTitleService.bulkUpload(this.currentFile, this.loggedInUserId).subscribe(
      event => {

        if (event.type === HttpEventType.UploadProgress) {
        } else if (event instanceof HttpResponse) {
          this.message = event.body.message;
          this.message = event.body.message;
          this.selectedFiles = undefined;
          this.currentFile = undefined;
          if (event.body.statusCode === '200' && event.body.message === 'OK') {
            this.loadJobTitleList();
            this.notificationService.success(this.translator.instant('job.title.added'), '');
          } else {
            this.loadJobTitleList();
            this.notificationService.error(event.body.message, '');
          }
        }
      },
      err => {
        this.message = 'Could not upload the file!';
        this.selectedFiles = undefined;
        this.currentFile = undefined;
        this.loadJobTitleList();
        this.notificationService.error(this.message, '');
      });
    this.selectedFiles = undefined;
  }

  download(fileName): void {
    this._jobTitleService
      .downloadFile(fileName)
      .subscribe(blob => {
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = this.fileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
  }

  addJobTitle(): void {
    this.dialogHeader = this.translator.instant('add.worker.job.title');
    this.jobTitleDialog = true;
    this.submitted = false;
    this.initializeForm();
  }

  hideDialog(): void {
    this.jobTitleDialog = false;
    this.submitted = false;
    this.initializeForm();
  }

  openDialog(id, title, status) {
    let options = null;
    const message = this.translator.instant('dialog.message');
    if (status) {
      this.status = 'disable';
    }
    else {
      this.status = 'enable';
    }
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${this.status} ${title} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (status) {
          this.disableJobTitle(id);
        }
        else {
          this.enableJobTitle(id);
        }
      }
    });
  }
  menuAccess(): void {
    const accessPermission = this.masterAccess.filter(e => e.menuName == 'Masters');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }
}
