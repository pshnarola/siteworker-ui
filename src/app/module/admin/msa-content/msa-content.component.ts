import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { EditorModule } from 'primeng/editor';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ContentMSAService } from 'src/app/service/admin-services/contentMSA/content-msa.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { ContentMSA } from 'src/app/shared/vo/ContentMSA/content-msa';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-msa-content',
  templateUrl: './msa-content.component.html',
  styleUrls: ['./msa-content.component.css']
})
export class MsaContentComponent implements OnInit, OnDestroy {
  @ViewChild('ed') ed: EditorModule;
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;

  contents: string;

  contentMsaData: ContentMSA[];
  contentMsa: ContentMSA;
  rowIndex = 0;

  type = [];
  types = [];
  selectedType;
  status: string;

  contentMsaFilterValue = '';
  url;
  loading = false;
  offset: Number = 0;
  datatableParam: DataTableParam;
  totalRecords: Number = 0;
  loginUserId;
  showConfirmDialog = false;
  sortField = 'CREATED_DATE';
  sortOrder = 1;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  globalFilter = null;
  filterMap = new Map();
  queryParam;
  displayDialog = false;
  myForm: FormGroup;
  selectedUserId: string;
  submitted = false;
  contentMsaDialog = false;

  typeValidator: boolean;
  contentValidator: boolean;
  message: string;
  showButtons = true;
  clientAccess: any;
  btnDisabled = false;
  columns = [
    { label: this.translator.instant('version.no'), value: 'version', sortable: false },
    { label: this.translator.instant('type'), value: 'type', sortable: true },
    { label: this.translator.instant('uploaded.date'), value: 'createdDate', sortable: false },
    { label: this.translator.instant('status'), value: 'status', sortable: false },
  ];
  contentDialog: boolean;
  MSAContent: any;

  constructor(
    private translator: TranslateService,
    private _localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private _contenMsaService: ContentMSAService,
    private _formBuilder: FormBuilder,
    private _notificationService: UINotificationService,
    private confirmDialogueService: ConfirmDialogueService
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 10,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: null
    };

    this.types = [{ label: 'Project', value: 'PROJECT' },
    { label: 'Jobs', value: 'JOBS' }
    ];

    this.loginUserId = _localStorageService.getLoginUserId();
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.clientAccess = this._localStorageService.getItem('userAccess');
    this.initializeForm();
    this.loadContentMsaList();
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CONTENTMSA);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    if (this.clientAccess) {
      this.menuAccess();
    }
  }

  clear() {
    this.contentMsaFilterValue = '';
    this.filter();
  }

  filter(): void {

    this.filterMap.clear();
    if (this.contentMsaFilterValue !== '') {
      if (('jobs').includes(this.contentMsaFilterValue.toLowerCase())) {
        this.filterMap.set('TYPE', 'JOBS');
      } else if (('projects').includes(this.contentMsaFilterValue.toLowerCase())) {
        this.filterMap.set('TYPE', 'PROJECT');
      } else {
        this.filterMap.set('TYPE', this.contentMsaFilterValue.toUpperCase());
      }
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
    this.loadContentMsaList();
  }

  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder == -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.globalFilter;
    this.sortField = event.sortField ? event.sortField : this.sortField;
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadContentMsaList();
  }


  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadContentMsaList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._contenMsaService.getMSAContentList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.loading = false;
            this.contentMsaData = data.data.result;
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



  addContentMsa(): any {
    this.contentMsaDialog = true;
    this.initializeForm();
  }

  hideDialog(): any {
    this.contentMsaDialog = false;
    this.submitted = false;
    this.initializeForm();
  }

  initializeForm() {
    this.myForm = this._formBuilder.group({
      id: [''],
      type: ['', CustomValidator.required],
      version: [''],
      content: [null, [CustomValidator.required, Validators.maxLength(250)]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isActive: 1,
    });
  }



  onSubmit() {
    this.submitted = true;
    if (this.myForm.get('type').value === 'Jobs') {
      this.myForm.get('type').setValue('JOBS');
    }
    else if (this.myForm.get('type').value === 'Project') {
      this.myForm.get('type').setValue('PROJECT');
    }
    if (!this.myForm.valid) {
      let controlName: string;
      for (controlName in this.myForm.controls) {
        this.myForm.controls[controlName].markAsDirty();
        this.myForm.controls[controlName].updateValueAndValidity(); // Validate form field and show the message
      }
      this.submitted = true;
      return false;
    }
    this._contenMsaService.addMSAContent(JSON.stringify(this.myForm.value)).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('content.msa.added'), '');
          this.loadContentMsaList();
          this.contentMsaDialog = false;
          this.submitted = false;
          this.contents = null;
        } else {
          this._notificationService.error(data.message, '');
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
        this.contentMsaDialog = false;
        this.submitted = false;
      }
    );

  }

  editContentMsa(contentMsa: ContentMSA): void {
    this.contentMsaDialog = true;

    this.contentMsa = { ...contentMsa };

    this.myForm.controls.id.patchValue(this.contentMsa.id);
    this.myForm.controls.name.patchValue(this.contentMsa.type);
  }



  // enable ContentMsa
  activateContentMsa(id): void {
    this.submitted = true;
    this._contenMsaService.enableMSAContent(id).subscribe(
      data => {
        console.log(data);
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('content.msa.enabled'), '');
          this.loadContentMsaList();
          this.submitted = false;
        } else {
          this._notificationService.error(data.message, '');

        }

      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
        this.submitted = false;
      }
    );
    this.initializeForm();

  }

  // disable ContentMsa
  deactivateContentMsa(id): void {
    this.submitted = true;
    this._contenMsaService.disableMSAContent(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('content.msa.disabled'), '');
          this.loadContentMsaList();
          this.submitted = false;
        } else {
          this._notificationService.error(data.message, '');
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
        this.submitted = false;
      }
    );
    this.initializeForm();

  }

  openDialog(id, name?, status?): void {

    let options = null;
    const message = this.translator.instant('dialog.message.region');
    if (status) {
      this.status = 'deactivate';
    } else {
      this.status = 'activate';
    }
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${this.status} MSA version V${name}.0 ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text'),
    };
    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (status) {
          this.deactivateContentMsa(id);
        }
        else {
          this.activateContentMsa(id);
        }
      }
    });
  }

  menuAccess(): void {
    const accessPermission = this.clientAccess.filter(e => e.menuName == 'Masters');
    if (accessPermission[0].canModify) {
      this.showButtons = true;
      this.btnDisabled = false;
    }
    else {
      this.showButtons = false;
      this.btnDisabled = true;
    }
  }
  openMSADialog(clientMSA) {
    this.MSAContent = clientMSA.content;
    this.contentDialog = true;
  }

  closeMSADialog() {
    this.contentDialog = false;
  }
}
