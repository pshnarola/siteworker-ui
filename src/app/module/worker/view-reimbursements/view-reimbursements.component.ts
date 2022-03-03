import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ReimbursementService } from 'src/app/service/worker-services/reimbursement.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { WorkerSidebarJobListService } from 'src/app/shared/worker-sidebar-job-list.service';
import { JobReimbursementAttachmentDTO } from '../vo/job-reimbursement-attachment-dto';
import { JobReimbursementDetailDTO } from '../vo/job-reimbursement-detail-dto';
import { JobReimbursementDTO } from '../vo/job-reimbursement-dto';

@Component({
  selector: 'app-view-reimbursements',
  templateUrl: './view-reimbursements.component.html',
  styleUrls: ['./view-reimbursements.component.css']
})
export class ViewReimbursementsComponent implements OnInit, OnDestroy {
  @ViewChild('dt') table: Table;
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  isFilterOpened = false;
  status = [
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Created', value: 'CREATED' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Rejected', value: 'REJECTED' },
  ];
  myForm: FormGroup;
  filteredStatus: any[];
  columns;
  _selectedColumns: any[];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  dialog = false;
  myAddForm: FormGroup;
  dataTableParam: DataTableParam;
  queryParam;
  files: File[] = [];
  viewAddReimbursementButton = true;
  selectedJob: any;
  FileName = '';
  selectedLogo: File;
  showPreview = false;
  logoBody: any;
  logoData: string;
  image: any;
  singleImageView: any;
  attachment: JobReimbursementAttachmentDTO;
  attachmentList: JobReimbursementAttachmentDTO[] = [];
  spinner: boolean;
  jobReimbursementDetailDTO = new JobReimbursementDetailDTO();
  jobReimbursementDTO = new JobReimbursementDTO();
  loggedInUser: any;
  reimbursementList = [];
  offset = 0;
  sortField;
  sortOrder;
  globalFilter;
  totalRecords: any;
  filterMap = new Map();
  statusData = [];
  submitted = false;
  isInEditMode = false;
  reimbursementId: any;
  dialogHeader;
  fetchedDBAttachmentList = [];
  isSelectedJob = false;
  emptyArray = [];
  dateErrorFlag: boolean;
  subscription = new Subscription();
  createdFromDate;
  createdToDate;
  jobDetail;
  dataTableParamForEdit = new DataTableParam();
  dataTableParamForReimbursementAttachment = new DataTableParam();
  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private reimbursementService: ReimbursementService,
    private translator: TranslateService,
    private confirmDialogService: ConfirmDialogueService,
    private notificationService: UINotificationService,
    private localStorageService: LocalStorageService,
    private workerSideBarJobListService: WorkerSidebarJobListService,
    private _fileService: FileDownloadService,
    private dateHelperService: DateHelperService,
    private router: Router) {
    this.dataTableParam = new DataTableParam();
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.loggedInUser = this.localStorageService.getLoginUserObject();
    this.initializeForm();
    this.setColumnOfTable();
    this._selectedColumns = this.columns.filter(x => x.selected == true);
    this.subscription.add(this.workerSideBarJobListService.workerSidebarJobChanged.subscribe(e => {
      this.onLoadJob();
      this.setColumnOfTable();
      this._selectedColumns = this.columns.filter(x => x.selected == true);
    }));
    this.onLoadJob();
  }
  ngOnDestroy(): void {
    this.localStorageService.removeItem('workerSelectedJob');
    this.subscription.unsubscribe();
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
  initializeAddNewForm(): void {
    this.myAddForm = this.formBuilder.group({
      selectedJob: [],
      title: [, CustomValidator.required],
      description: [, CustomValidator.required],
      amount: [, CustomValidator.required],
      offCycle: [],
      documents: []
    });
  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      keyword: [],
      createdFrom: [],
      createdTo: [],
      status: []
    });
  }
  setColumnOfTable(): void {
    if (this.isSelectedJob) {
      this.columns = [
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'CLIENT_NAME', selected: true },
        { label: 'Work Week', value: 'WORK_WEEK', sortable: true, isHidden: false, field: 'WORK_WEEK', selected: true },
        { label: 'Created On', value: 'CREATED_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE', selected: false },
        { label: 'Reimbursements Title', value: 'title', sortable: true, isHidden: false, field: 'title', selected: true },
        { label: 'Description', value: 'description', sortable: true, isHidden: false, field: 'description', selected: false },
        { label: 'Amount', value: 'amount', sortable: true, isHidden: false, field: 'amount', selected: true },
        { label: 'Off Cycle', value: 'offCycle', sortable: false, isHidden: false, field: 'offCycle', selected: false },
        { label: 'Attachment', value: 'attachment', sortable: false, isHidden: false, field: 'attachment', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: false },

      ];
    }
    else {
      this.columns = [
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'CLIENT_NAME', selected: true },
        { label: 'Job Title', value: 'JOB_TITLE', sortable: true, isHidden: this.isSelectedJob ? true : false, field: 'JOB_TITLE', selected: true },
        { label: 'Work Week', value: 'WORK_WEEK', sortable: true, isHidden: false, field: 'WORK_WEEK', selected: true },
        { label: 'Created On', value: 'CREATED_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE', selected: false },
        { label: 'Reimbursements Title', value: 'title', sortable: true, isHidden: false, field: 'title', selected: true },
        { label: 'Description', value: 'description', sortable: true, isHidden: false, field: 'description', selected: false },
        { label: 'Amount', value: 'amount', sortable: true, isHidden: false, field: 'amount', selected: false },
        { label: 'Off Cycle', value: 'offCycle', sortable: false, isHidden: false, field: 'offCycle', selected: false },
        { label: 'Attachment', value: 'attachment', sortable: false, isHidden: false, field: 'attachment', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: false },


      ];
    }
  }
  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
  }
  onFilterClear(): void {
    this.myForm.reset();
    this.myForm.get('status').patchValue(this.emptyArray);
    this.onLoadJob();
  }
  filter(): void {
    this.filterMap.clear();
    this.statusData.length = 0;
    const datePipe = new DatePipe('en-US');
    this.dateErrorFlag = false;
    if (((this.myForm.value.createdFrom && !this.myForm.value.createdTo) ||
      (!this.myForm.value.createdFrom && this.myForm.value.createdTo))) {
      this.dateErrorFlag = true;
    }

    if (!this.myForm.value.createdFrom && !this.myForm.value.createdTo) {
      this.dateErrorFlag = false;
    }
    if (this.myForm.value.keyword) {
      this.filterMap.set('KEY_WORD', this.myForm.value.keyword);
    }
    if (this.myForm.value.createdFrom) {
      this.dateHelperService.setStartDate(this.myForm.value.createdFrom);
      const value = datePipe.transform(this.myForm.value.createdFrom, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('START_DATE', value);
    }
    if (this.myForm.value.createdTo) {
      this.dateHelperService.setEndDate(this.myForm.value.createdTo);
      const valueEnd = datePipe.transform(this.myForm.value.createdTo, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('END_DATE', valueEnd);
    }
    if (this.myForm.value.status) {
      this.myForm.value.status.forEach(element => {
        this.statusData.push(element.value);
        this.filterMap.set('STATUS', this.statusData.toString());
      });
    }
    if (this.isSelectedJob) {
      const job = this.localStorageService.getItem('workerSelectedJob');
      const id = job.id;
      if (id !== 'jobId') {
        this.filterMap.set('JOB_DETAIL_ID', id);
      }
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    if (!this.dateErrorFlag) {
      this.globalFilter = JSON.stringify(jsonObject);
      this.dataTableParam = {
        offset: this.offset,
        size: this.size,
        sortField: '',
        sortOrder: -1,
        searchText: this.globalFilter
      };
      this.getReimbursementList();
    }
    else {
      this.notificationService.error(this.translator.instant('please.enter.appropriate.date.range'), '');
    }
  }
  filterStatus(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.status.length; i++) {
      const status = this.status[i];
      if (status.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(status);
      }
    }
    this.filteredStatus = filtered;
    this.filteredStatus = this.filteredStatus.sort();
  }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    // restore original order
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
  addReimbursement(): void {
    // this.initializeAddNewForm();
    this.isInEditMode = false;
    this.dialog = true;
    this.dialogHeader = this.translator.instant('add.reimbursements');
    this.initializeAddNewForm();
    this.myAddForm.controls.selectedJob.patchValue(this.selectedJob.title);
  }
  onSubmitReimbursement(): boolean {
    this.submitted = true;
    if (!this.myAddForm.valid) {
      CustomValidator.markFormGroupTouched(this.myAddForm);
      this.submitted = true;
      return false;
    }
    if (!this.isInEditMode) {
      this.jobReimbursementDetailDTO.reimbursement = new JobReimbursementDTO();
      this.jobReimbursementDetailDTO.reimbursement.title = this.myAddForm.value.title;
      this.jobReimbursementDetailDTO.reimbursement.description = this.myAddForm.value.description;
      this.jobReimbursementDetailDTO.reimbursement.isOffCycle = this.myAddForm.value.offCycle;
      this.jobReimbursementDetailDTO.reimbursement.amount = this.myAddForm.value.amount;
      this.jobReimbursementDetailDTO.reimbursement.status = 'CREATED';
      this.jobReimbursementDetailDTO.reimbursementAttachments = this.attachmentList;
      if (this.selectedJob && this.selectedJob !== 'jobId') {
        this.jobReimbursementDetailDTO.reimbursement.jobDetail = this.selectedJob;
      } else {
        this.jobReimbursementDetailDTO.reimbursement.jobDetail = this.jobDetail;
      }
      this.jobReimbursementDetailDTO.reimbursement.worker = this.loggedInUser;
      this.jobReimbursementDetailDTO.reimbursement.createdBy = this.localStorageService.getLoginUserId();
      this.reimbursementService.addReimbursement(this.jobReimbursementDetailDTO).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('reimbursement.added'), '');
          this.hideDialog();
          this.onLoadJob();
        }
        else {
          this.notificationService.error(data.message, '');
          this.attachmentList = [];
        }
      });
    }
    else {
      this.jobReimbursementDetailDTO.reimbursement = new JobReimbursementDTO();
      this.jobReimbursementDetailDTO.reimbursementAttachments = this.fetchedDBAttachmentList;
      this.jobReimbursementDetailDTO.reimbursement.id = this.reimbursementId;
      this.jobReimbursementDetailDTO.reimbursement.title = this.myAddForm.value.title;
      this.jobReimbursementDetailDTO.reimbursement.description = this.myAddForm.value.description;
      this.jobReimbursementDetailDTO.reimbursement.isOffCycle = this.myAddForm.value.offCycle;
      this.jobReimbursementDetailDTO.reimbursement.amount = this.myAddForm.value.amount;
      this.jobReimbursementDetailDTO.reimbursement.status = 'CREATED';
      this.jobReimbursementDetailDTO.reimbursementAttachments = this.attachmentList;
      if (this.selectedJob && this.selectedJob !== 'jobId') {
        this.jobReimbursementDetailDTO.reimbursement.jobDetail = this.selectedJob;
      } else {
        this.jobReimbursementDetailDTO.reimbursement.jobDetail = this.jobDetail;
      }
      this.jobReimbursementDetailDTO.reimbursement.worker = this.loggedInUser;
      this.reimbursementService.updateReimbursement(this.jobReimbursementDetailDTO).subscribe(data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('reimbursement.updated'), '');
          this.hideDialog();
          this.onLoadJob();
        }
        else {
          this.notificationService.error(data.message, '');
          this.attachmentList = [];
        }
      });
    }
  }
  getReimbursementList(): void {
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.reimbursementService.getReimbursementList(this.queryParam).subscribe(data => {
      this.reimbursementList = data.data.result;
      this.totalRecords = data.data.totalRecords;
      if (this.localStorageService.getItem('workerSelectedJob')) {

      }
    });
  }
  onLoadJob(): void {
    let filterMap = new Map();
    filterMap.set('WORKER_ID', this.localStorageService.getLoginUserId());
    if (this.localStorageService.getItem('workerSelectedJob')) {
      const job = this.localStorageService.getItem('workerSelectedJob');
      const id = job.id;
      if (id !== 'jobId') {
        this.isSelectedJob = true;
        this.selectedJob = job;
        this.viewAddReimbursementButton = false;
        filterMap.set('JOB_DETAIL_ID', id);
      }
      else {
        this.isSelectedJob = false;
        this.viewAddReimbursementButton = true;
        this.globalFilter = null;
      }
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getReimbursementList();
  }
  onLazyLoad(event): void {
    let filterMap = new Map();
    filterMap.set('WORKER_ID', this.localStorageService.getLoginUserId());
    if (this.localStorageService.getItem('workerSelectedJob')) {
      const job = this.localStorageService.getItem('workerSelectedJob');
      const id = job.id;
      if (id !== 'jobId') {
        this.isSelectedJob = true;
        this.selectedJob = job;
        this.viewAddReimbursementButton = false;
        filterMap.set('JOB_DETAIL_ID', id);
      }
      else {
        this.isSelectedJob = false;
        this.viewAddReimbursementButton = true;
        this.globalFilter = null;
      }
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.dataTableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getReimbursementList();
  }
  onSelect(event): void {
    this.files.splice(2, 0, ...event.addedFiles);
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.pdf.upload'), '');
      }
      event.rejectedFiles = [];
    }
  }
  onRemove(event): void {
    this.files.splice(this.files.indexOf(event), 1);
  }
  hideDialog(): void {
    this.dialog = false;
    this.files.length = 0;
    this.fetchedDBAttachmentList.length = 0;
    this.attachmentList.length = 0;
    this.submitted = false;
    this.onLoadJob();
  }
  openDeleteDialogForTemp(index, title): void {
    let options = null;
    const message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message}?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.onRemoveFromList(index);
      }
    });
  }
  onRemoveFromList(id): void {
    const fileTemp: File[] = [];
    this.files.forEach((e, index) => {
      if (index !== id) {
        fileTemp.push(e);
      }
    });
    this.files.length = 0;
    this.files = fileTemp;
    this.notificationService.success(this.translator.instant('document.deleted'), '');
  }
  uploadFile(next?: string): void {
    this.spinner = true;
    if (next == 'editMode') {
      if (this.files.length + this.fetchedDBAttachmentList.length >= 0) {
        if (this.files.length + this.fetchedDBAttachmentList.length <= 5) {
          this.attachment = new JobReimbursementAttachmentDTO();
          const uploadFileData = new FormData();
          this.files.forEach(element => {
            uploadFileData.append('file', element);
          });
          this._fileService.uploadMultipleFile(uploadFileData).subscribe(
            event => {
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                if (this.logoData.length === this.files.length) {
                  this.files.forEach((element, i) => {
                    this.attachment = new JobReimbursementAttachmentDTO(element.name, this.logoData[i]);
                    this.attachmentList.push(this.attachment);
                  });
                }
                this.onSubmitReimbursement();

              }
            },
            (error) => {
              this.notificationService.error(this.translator.instant('common.error'), '');
              this.spinner = false;
            });

        } else {
          this.notificationService.error(this.translator.instant('you.can.upload.maximum.five.attachments'), '');
        }
      } else {
        this.onSubmitReimbursement();
      }
    }
    else {
      if (this.files.length !== 0) {
        if (this.files.length <= 5) {
          this.attachment = new JobReimbursementAttachmentDTO();
          const uploadFileData = new FormData();
          this.files.forEach(element => {
            uploadFileData.append('file', element);
          });
          this._fileService.uploadMultipleFile(uploadFileData).subscribe(
            event => {
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                if (this.logoData.length === this.files.length) {
                  this.files.forEach((element, i) => {
                    this.attachment = new JobReimbursementAttachmentDTO(element.name, this.logoData[i]);
                    this.attachmentList.push(this.attachment);
                  });
                }
                this.onSubmitReimbursement();

              }
            },
            (error) => {
              this.notificationService.error(this.translator.instant('common.error'), '');
              this.spinner = false;
            });
        }
        else {
          this.notificationService.error(this.translator.instant('you.can.upload.maximum.five.attachments'), '');
        }
      }
      else {
        this.onSubmitReimbursement();
      }
    }
  }
  downloadDocuments(id): void {
    let filterMap = new Map();
    filterMap.set('JOB_REIMBURSEMENT_ID', id);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParamForReimbursementAttachment = {
      offset: 0,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParamForReimbursementAttachment);
    this.reimbursementService.getAttachments(this.queryParam).subscribe(data => {
      let attachmentsList = data.data.result;
      if (attachmentsList.length > 0) {
        this.reimbursementService.downloadReimbursementAttachments(id).subscribe(data => {
          const blob = new Blob([data], { type: 'application/zip' });
          const fileName = 'Reimbursements';
          saveAs(blob, fileName);
        });
      }
      else {
        this.notificationService.error('No attachments present', '');
      }
    });
  }
  editReimbursement(data): void {
    this.dialogHeader = this.translator.instant('edit.reimbursements');
    this.initializeAddNewForm();
    this.isInEditMode = true;
    this.jobReimbursementDTO = { ...data };
    this.getAttachmentByReimbursement(data.id);
    this.reimbursementId = this.jobReimbursementDTO.id;
    this.jobDetail = this.jobReimbursementDTO.jobDetail;
    this.myAddForm.controls.selectedJob.patchValue(this.jobReimbursementDTO.jobDetail.title);
    this.myAddForm.controls.title.patchValue(this.jobReimbursementDTO.title);
    this.myAddForm.controls.description.patchValue(this.jobReimbursementDTO.description);
    this.myAddForm.controls.amount.patchValue(this.jobReimbursementDTO.amount);
    this.myAddForm.controls.offCycle.patchValue(this.jobReimbursementDTO.isOffCycle);
    this.dialog = true;
  }
  openDeleteReimbursementDialog(data): void {
    let options = null;
    let message;
    message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteReimbursement(data);
      }
      else {
        const currentUrl = this.router.url;
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      }
    });
  }
  deleteReimbursement(data): void {
    this.reimbursementService.deleteReimbursement(data.id).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('reimbursement.deleted'), '');
        this.onLoadJob();
      }
    });
  }
  getAttachmentByReimbursement(id): void {
    let filterMap = new Map();
    filterMap.set('JOB_REIMBURSEMENT_ID', id);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParamForEdit = {
      offset: 0,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParamForEdit);
    this.reimbursementService.getAttachments(this.queryParam).subscribe(data => {
      this.fetchedDBAttachmentList = data.data.result;
    });

  }
  openDeleteDialog(id, title, rId): void {
    let options = null;
    const message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message}?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (id) {
          this.onRemoveFromDBList(id, rId);
        }
      }
    });
  }
  onRemoveFromDBList(id, rId) {
    this.reimbursementService.deleteAttachment(id).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('reimbursement.file.deleted'), '');
        setTimeout(() => {
          this.getAttachmentByReimbursement(rId);
        }, 2000);
        this.onLoadJob();
      } else {
        this.notificationService.error(data.message, '');
        this.onLoadJob();
      }
    });
  }
}
