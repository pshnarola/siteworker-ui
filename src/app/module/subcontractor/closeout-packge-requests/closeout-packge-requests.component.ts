import { HttpResponse } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ProjectBidService } from 'src/app/service/subcontractor-services/project-bid/project-bid.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { LineItem } from '../../client/Vos/lineItemModel';
import { SubmitCloseOutAttachment } from '../../worker/vo/submitCloseOutRequestAttachment';
import { CloseoutPackageRequestDTO } from '../vos/CloseOutPackageRequestDTO';
import { SubmitCloseOutPackageRequestDTO } from '../vos/SubmitCloseOutPackageRequestDTO';

@Component({
  selector: 'app-closeout-packge-requests',
  templateUrl: './closeout-packge-requests.component.html',
  styleUrls: ['./closeout-packge-requests.component.css']
})
export class CloseoutPackgeRequestsComponent implements OnInit {
  columns;
  isFilterOpened = false;
  status = [
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords = 0;
  myForm: FormGroup;
  filteredStatus: any[];
  projectTitle: any;
  jobsiteTitle: any;
  subscription = new Subscription();
  communicationHistoryDialog = false;
  lineItemPopup = false;
  submitRequestDialog: boolean;
  viewInvoiceDialog: boolean;
  documentDialog: boolean;
  queryParam: any;
  dataTableParam = new DataTableParam();
  globalFilter: string;
  loggedInUserId: any;
  closeoutList: any;
  viewLineItem: LineItem;
  mySubmitForm: FormGroup;
  files: File[] = [];
  attachment: SubmitCloseOutAttachment;
  FileName: any;
  logoBody: any;
  logoData: any;
  attachmentList: SubmitCloseOutAttachment[] = [];
  spinner: boolean;
  fetchedDBAttachmentList = [];
  submitCloseOutRequest = new SubmitCloseOutPackageRequestDTO();
  submitCloseOutRequestAttachment = new SubmitCloseOutAttachment();
  closeoutId: any;
  documentsList: any;
  isInEditMode: boolean;
  filterFlag = false;
  clientNameParams: { name: any; };
  clients: any;
  rejectionReasonDialog: boolean;
  rejectedReasonList = [];
  selectedJobsite: any;
  selectedProject: any;
  isSelectedProject = false;
  isSelectedJobsite = false;

  _selectedColumns: any[];

  downloadAttachmentParams: { subContractorId: any; closeOutPackageId: any; };
  emptyFileFlag;
  deleteDocumentFlag = true;
  documentHeader;
  rejectedCloseoutFlag = false;
  sortField = 'CREATED_DATE';
  subcontractor: any;
  offset = 0;
  sortOrder = 0;
  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private projectJobSelectionService: ProjectJobSelectionService,
    private projectBidService: ProjectBidService,
    private localStorageService: LocalStorageService,
    private fileService: FileDownloadService,
    private translator: TranslateService,
    private confirmDialogService: ConfirmDialogueService,
    private notificationService: UINotificationService,
    private router: Router,
    private filterLeftPanelService: FilterLeftPanelDataService) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(e => {

      const project = this.localStorageService.getSelectedProjectObject();
      if (project) {
        if (project.id !== 'pid') {
          this.isSelectedProject = true;
          this.selectedProject = project;
          this.projectTitle = project.title;
        }
        else {
          this.isSelectedProject = false;
          this.selectedProject = null;
          this.projectTitle = null;
        }
      } else {
        this.isSelectedProject = false;
        this.selectedProject = null;
        this.projectTitle = null;
      }
      this.setColumnOfTable();
      this.setDefaultCriteria();
      this._selectedColumns = this.columns.filter(x => x.selected == true);
    }));
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(jobsite1 => {
      const jobsite = this.localStorageService.getSelectedJobsiteObject();
      const project = this.localStorageService.getSelectedProjectObject();
      if (project && jobsite) {
        if (jobsite.id !== 'jid') {
          this.isSelectedJobsite = true;
          this.selectedJobsite = jobsite;
          this.jobsiteTitle = jobsite.title;
        } else {
          this.isSelectedJobsite = false;
          this.selectedJobsite = null;
          this.jobsiteTitle = null;
        }
      } else {
        this.isSelectedJobsite = false;
        this.selectedJobsite = null;
        this.jobsiteTitle = null;
      }
      this.setColumnOfTable();
      this.setDefaultCriteria();
      this._selectedColumns = this.columns.filter(x => x.selected == true);
    }));
    this.initializeForm();
    this.setColumnOfTable();
    this._selectedColumns = this.columns.filter(x => x.selected == true);
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }

  setColumnOfTable(): void {
    if (this.isSelectedProject && !this.isSelectedJobsite) {
      this.columns = [
        { label: 'Jobsite Title', value: 'JOBSITE_TITLE', sortable: true, isHidden: false, field: 'jobsiteTitle', selected: true },
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: false },
        { label: 'Region', value: 'REGION', sortable: true, isHidden: false, field: 'region', selected: false },
        { label: 'Requested On', value: 'REQUESTED_DATE', sortable: true, isHidden: false, field: 'requestedOn', selected: false },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: true },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Milestone %', value: 'SUBCONTRACTOR_PERCENTAGE', sortable: false, isHidden: false, field: 'milestone', selected: false },
        { label: 'Cost', value: 'cost', sortable: true, isHidden: false, field: 'cost', selected: true },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: false },
      ];
    }
    else if (this.isSelectedJobsite && this.isSelectedProject) {
      this.columns = [
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: true },
        { label: 'Region', value: 'REGION', sortable: true, isHidden: false, field: 'region', selected: false },
        { label: 'Requested On', value: 'REQUESTED_DATE', sortable: true, isHidden: false, field: 'requestedOn', selected: false },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: true },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Milestone %', value: 'SUBCONTRACTOR_PERCENTAGE', sortable: false, isHidden: false, field: 'milestone', selected: false },
        { label: 'Cost', value: 'cost', sortable: true, isHidden: false, field: 'cost', selected: true },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: false },
      ];
    }
    else if (this.isSelectedJobsite) {

      this.columns = [
        { label: 'Project Title', value: 'projectDetail.title', sortable: true, isHidden: false, field: 'projectTitle', selected: true },
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: false },
        { label: 'Region', value: 'REGION', sortable: true, isHidden: false, field: 'region', selected: false },
        { label: 'Requested On', value: 'REQUESTED_DATE', sortable: true, isHidden: false, field: 'requestedOn', selected: false },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: true },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Milestone %', value: 'SUBCONTRACTOR_PERCENTAGE', sortable: false, isHidden: false, field: 'milestone', selected: false },
        { label: 'Cost', value: 'cost', sortable: true, isHidden: false, field: 'cost', selected: true },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: false },

      ];
    }
    else {
      this.columns = [
        { label: 'Project Title', value: 'projectDetail.title', sortable: true, isHidden: false, field: 'projectTitle', selected: true },
        { label: 'Jobsite Title', value: 'JOBSITE_TITLE', sortable: true, isHidden: false, field: 'jobsiteTitle', selected: true },
        { label: 'Client', value: 'CLIENT_NAME', sortable: true, isHidden: false, field: 'postedBy', selected: false },
        { label: 'Region', value: 'REGION', sortable: true, isHidden: false, field: 'region', selected: false },
        { label: 'Requested On', value: 'REQUESTED_DATE', sortable: true, isHidden: false, field: 'requestedOn', selected: false },
        { label: 'Milestone Name', value: 'MILESTONE_NAME', sortable: true, isHidden: false, field: 'milestoneName', selected: true },
        { label: 'Line Item Deliverables', value: 'lineItem', sortable: false, isHidden: false, field: 'lineItem', selected: false },
        { label: 'Milestone %', value: 'SUBCONTRACTOR_PERCENTAGE', sortable: false, isHidden: false, field: 'milestone', selected: false },
        { label: 'Cost', value: 'cost', sortable: true, isHidden: false, field: 'cost', selected: false },
        { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status', selected: false },

      ];
    }
  }

  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      client: [],
      status: []
    });
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
  filter(): void {
    this.filterFlag = true;
    const filterMap = new Map();
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    filterMap.set('SUBCONTRACTOR_ID', this.loggedInUserId);
    if (this.myForm.value.status) {
      filterMap.set('STATUS', this.myForm.value.status.value);
    }
    if (this.myForm.value.client) {
      filterMap.set('CLIENT_ID', this.myForm.value.client.id);
    }
    if (this.selectedProject) {
      filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
    }
    if (this.selectedJobsite) {
      filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getCloseOutList();
  }
  onFilterClear(): void {
    this.myForm.reset();
    this.filterFlag = false;
    this.setDefaultCriteria();
  }
  openCommunicationHistory(data): void {
    this.localStorageService.setItem('selectedProject', data.projectDetail, false);
    this.router.navigate(['/subcontractor/chat-messages']);
  }
  hideDialog(): void {
    this.communicationHistoryDialog = false;
  }

  lineItemDeliverablePopup(lineItem): void {
    this.lineItemPopup = true;
    this.viewLineItem = lineItem;
  }

  hideLineItemDialog(): void {
    this.lineItemPopup = false;
  }
  openSubmitRequestDialog(id): void {
    this.submitRequestDialog = true;
    this.closeoutId = id;
  }
  hideSubmitRequestDialog(): void {
    this.submitRequestDialog = false;
    this.files = [];
    this.attachmentList = [];
  }
  openViewInvoiceDialog(): void {
    this.viewInvoiceDialog = true;
  }
  hideViewInvoiceDialog(): void {
    this.viewInvoiceDialog = false;
  }
  openDocumentDialog(data): void {
    this.documentDialog = true;
    if (data.status === 'APPROVED') {
      this.deleteDocumentFlag = false;
    }
    else {
      this.deleteDocumentFlag = true;
    }
    this.documentHeader = 'Documents';
    this.closeoutId = data.id;
    this.getCloseoutAttachmentByCloseOutId(data.id);
    this.isInEditMode = true;
  }
  openRejectedSubmitRequest(data): void {
    this.documentDialog = true;
    if (data.status === 'REJECTED') {
      this.documentHeader = 'Submit Request';
      this.rejectedCloseoutFlag = true;
    }
    else {
      this.documentHeader = 'Documents';
      this.rejectedCloseoutFlag = false;
    }
    this.closeoutId = data.id;
    this.getCloseoutAttachmentByCloseOutId(data.id);
    this.isInEditMode = true;
  }
  hideDocumentDialog(): void {
    this.documentDialog = false;
    this.attachmentList = [];
    this.files = [];
  }
  setDefaultCriteria(): void {
    const filterMap = new Map();
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    filterMap.set('SUBCONTRACTOR_ID', this.loggedInUserId);
    if (this.selectedProject) {
      filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
    }
    if (this.selectedJobsite) {
      filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.getCloseOutList();
  }
  getCloseOutList(): void {
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.projectBidService.getCloseout(this.queryParam).subscribe(data => {
      if (data.data?.result) {
        this.closeoutList = data.data.result;
        this.totalRecords = data.data.totalRecords;
      }
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
  openDeleteDialog(id, title, rId) {
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
    this.projectBidService.deleteAttachment(id).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('closeout.file.deleted'), '');
        setTimeout(() => {
          this.getCloseoutAttachmentByCloseOutId(rId);
        }, 2000);
        this.getCloseOutList();
      } else {
        this.notificationService.error(data.message, '');
        this.getCloseOutList();
      }
    });
  }
  onRemoveFromList(id) {
    const fileTemp: File[] = [];
    this.files.forEach((e, index) => {
      if (index !== id) {
        fileTemp.push(e);
      }
    });
    this.files.length = 0;
    this.files = fileTemp;
    this.notificationService.success(this.translator.instant('submit.request.file.deleted'), '');

  }
  getClientByName(name): void {
    this.clientNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.clientNameParams);
    this.filterLeftPanelService.getClientByName(this.queryParam).subscribe(data => {
      this.clients = data.data;
      this.clients = this.clients.sort();
    });
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
  uploadFile(next?: string) {
    if (next == 'editMode') {
      if (this.files.length + this.fetchedDBAttachmentList.length >= 0) {
        if (this.files.length + this.fetchedDBAttachmentList.length <= 5) {
          this.attachment = new SubmitCloseOutAttachment();
          const uploadFileData = new FormData();
          this.files.forEach(element => {
            uploadFileData.append('file', element);
          });
          this.fileService.uploadMultipleFile(uploadFileData).subscribe(
            event => {
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                if (this.logoData.length === this.files.length) {
                  this.files.forEach((element, i) => {
                    this.attachment = new SubmitCloseOutAttachment(element.name, this.logoData[i]);
                    this.attachmentList.push(this.attachment);
                  });
                }
                if (this.rejectedCloseoutFlag) {
                  this.openSubmitRequestConfirmDialog();
                }
                else {
                  this.saveEditCloseoutAttachments();
                }
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
        if (this.rejectedCloseoutFlag) {
          this.openSubmitRequestConfirmDialog();
        }
        else {

          this.saveEditCloseoutAttachments();
        }
      }
    }
    else {
      if (this.files.length !== 0) {
        if (this.files.length <= 5) {
          this.attachment = new SubmitCloseOutAttachment();
          const uploadFileData = new FormData();
          this.files.forEach(element => {
            uploadFileData.append('file', element);
          });
          this.fileService.uploadMultipleFile(uploadFileData).subscribe(
            event => {
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                if (this.logoData.length === this.files.length) {
                  this.files.forEach((element, i) => {
                    this.attachment = new SubmitCloseOutAttachment(element.name, this.logoData[i]);
                    this.attachmentList.push(this.attachment);
                  });
                }
                this.openSubmitRequestConfirmDialog();

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
        this.openSubmitRequestConfirmDialog();
      }
    }
  }
  onSubmitCloseOutRequest(): void {
    const closeOutPackageRequest = new CloseoutPackageRequestDTO();
    closeOutPackageRequest.id = this.closeoutId;
    this.submitCloseOutRequest.attachments = this.attachmentList;
    this.submitCloseOutRequest.closeOutPackageRequest = closeOutPackageRequest;
    this.projectBidService.addSubmitCloseoutRequest(this.submitCloseOutRequest).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('submitted.request'), '');
        if (this.rejectedCloseoutFlag) {
          this.hideDocumentDialog();
        }
        else {
          this.hideSubmitRequestDialog();
        }
        this.setDefaultCriteria();
      }
      else {
        this.notificationService.error(data.message, '');
        this.attachmentList = [];
      }
    });

  }
  downloadDocuments(): void {
    this.projectBidService.downloadCloseOutDocuments(this.closeoutId).subscribe(data => {
      const blob = new Blob([data], { type: 'application/zip' });
      const fileName = 'CloseoutDocuments';
      saveAs(blob, fileName);
    });
  }
  getCloseoutAttachmentByCloseOutId(id): void {
    const filterMap = new Map();
    filterMap.set('CLOSE_OUT_PACKAGE_ID', id);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.projectBidService.getCloseOutDocuments(this.queryParam).subscribe(data => {
      this.fetchedDBAttachmentList = data.data.result;
      if (this.fetchedDBAttachmentList.length > 0) {
        this.emptyFileFlag = false;
      }
      else {
        this.emptyFileFlag = true;
      }
      this.globalFilter = null;
    });
  }
  saveEditCloseoutAttachments(): void {
    const closeOutPackageRequest = new CloseoutPackageRequestDTO();
    closeOutPackageRequest.id = this.closeoutId;
    this.submitCloseOutRequest.attachments = this.attachmentList;
    this.submitCloseOutRequest.closeOutPackageRequest = closeOutPackageRequest;
    this.projectBidService.saveEditCloseoutAttachments(this.submitCloseOutRequest).subscribe(data => {
      if (data.statusCode === '200' || data.message === 'OK') {
        this.notificationService.success(this.translator.instant('attachments.updated'), '');
        this.hideDocumentDialog();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  openSubmitRequestConfirmDialog(): void {
    let options = null;
    const message = this.translator.instant('are.you.sure.you.want.to.submit.request');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.onSubmitCloseOutRequest();
      }
      else {
        this.hideSubmitRequestDialog();
        this.getCloseOutList();
      }
    });
  }
  openRejectionReasonDialog(id): void {
    this.rejectionReasonDialog = true;
    this.getRejectReasonCloseoutById(id);
  }
  hideRejectReasonDialog(): void {
    this.rejectionReasonDialog = false;
  }
  getRejectReasonCloseoutById(id) {
    const filterMap = new Map();
    filterMap.set('CLOSE_OUT_PACKAGE_ID', id);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: 0,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.projectBidService.getRejectCloseOutReason(this.queryParam).subscribe(data => {
      this.rejectedReasonList = data.data.result;
    });
  }
  downloadInvoice(data): void {
    this.downloadAttachmentParams = {
      subContractorId: data.subContractor.id,
      closeOutPackageId: data.id
    };

    this.queryParam = this.prepareQueryParam(this.downloadAttachmentParams);
    this.projectBidService.downloadSubContractorInvoice(this.queryParam).subscribe(data1 => {
      const blob = new Blob([data1], { type: 'application/pdf' });
      const fileName = 'Invoice';
      saveAs(blob, fileName);
    });
  }
  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
  }
  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }
  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.offset = event.first / event.rows;
    this.sortField = event.sortField ? event.sortField.toUpperCase() : this.sortField;
    const filterMap = new Map();
    const selectedProjectObject = this.localStorageService.getSelectedProjectObject();
    const selectedJobsiteObject = this.localStorageService.getSelectedJobsiteObject();
    if (this.selectedProject) {
      if (this.selectedProject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
      }
    }
    else if (selectedProjectObject) {
      if (selectedProjectObject.id !== 'pid') {
        filterMap.set('PROJECT_DETAIL_ID', selectedProjectObject.id);
      }
    }
    if (this.selectedJobsite) {
      if (this.selectedJobsite.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', this.selectedJobsite.id);
      }
    }
    else if (selectedJobsiteObject) {
      if (selectedJobsiteObject.id !== 'jid') {
        filterMap.set('JOBSITE_DETAIL_ID', selectedJobsiteObject.id);
      }
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField,
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };

    this.getCloseOutList();
  }
}
