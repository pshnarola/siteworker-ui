import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { EditorModule } from 'primeng/editor';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ClientMsaService } from 'src/app/service/admin-services/client-msa/client-msa.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { ClientMSADTO } from './ClientMSADTO';



@Component({
  selector: 'app-msa-client',
  templateUrl: './msa-client.component.html',
  styleUrls: ['./msa-client.component.css']
})
export class MsaClientComponent implements OnInit {
  @ViewChild('ed') ed: EditorModule;

  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  loading = false;

  clientMSADTO: ClientMSADTO;

  datatableParam: DataTableParam;
  offset = 0;
  totalRecords = 0;
  sortField = 'CREATED_DATE';
  sortOrder = 1;
  loginUserId: any;

  submitted = false;
  msaHeader: any;
  clientMsaDialog = false;
  displayDialog = false;
  clientForm: FormGroup;

  clientMsaData = [];

  clientUser: any;
  editclientUser: any;
  clientUserId: any;

  loginUser: any;
  type: any;
  typeField: any;
  globalFilter = null;
  showButtons = true;
  jobAccess: any;
  btnDisabled = false;

  typeList = [
    { label: 'Job', value: 'JOBS' },
    { label: 'Project', value: 'PROJECT' }
  ];

  columns = [
    { label: this.translator.instant('msa.type'), value: 'type', sortable: false },
    { label: this.translator.instant('version.no'), value: 'version', sortable: false },
    { label: this.translator.instant('document'), sortable: false },
    { label: this.translator.instant('msa.uploaded.date'), value: 'createdDate', sortable: true },
    { label: this.translator.instant('accepted.date'), value: 'acceptedDate', sortable: true },
    { label: this.translator.instant('status'), sortable: false },
  ];
  queryParam: URLSearchParams;

  constructor(
    private route: ActivatedRoute,
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private fileService: FileDownloadService,
    private confirmDialogueService: ConfirmDialogueService,
    private msaClientService: ClientMsaService,
    private fileDownloadService: FileDownloadService
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.MSA_CLIENT);

    this.loginUserId = localStorageService.getLoginUserId();
    this.loginUser = localStorageService.getLoginUserObject();
    this.clientUser = localStorageService.getItem('customizedMSAOfClient');

    this.type = 'PROJECT';
    this.typeField = 'Project';

    this.clientMsaData = [];
    this.datatableParam = new DataTableParam();
    this.clientMSADTO = new ClientMSADTO();

    this.datatableParam = {
      offset: 0,
      size: 2,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: null
    };

    this.route.queryParams.subscribe(
      (params: Params) => {
        this.clientUserId = params.user;
      });
  }

  ngOnInit(): void {
    this.getClientDetiail();
    this.initializeForm();
    this.jobAccess = this.localStorageService.getItem('userAccess');

    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.MSA_CLIENT);
    if (this.jobAccess) {
      this.menuAccess();
    }
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
    this.localStorageService.removeItem('customizedMSAOfClient');
  }

  addClientMsa(): any {
    this.clientMsaDialog = true;
    this.msaHeader = 'Add Client MSA';
    this.initializeForm();
  }

  hideDialog(): any {
    this.clientMsaDialog = false;
    this.submitted = false;
    this.initializeForm();
  }

  onTypeChange(event): any {
    if (event.value === 'PROJECT') {
      this.type = 'PROJECT';
      this.typeField = 'Project';
    } else {
      this.type = 'JOBS';
      this.typeField = 'Job';
    }
    this.getClientDetiail();
  }

  initializeForm(): any {
    this.clientForm = this.formBuilder.group({
      id: [''],
      content: [null, [CustomValidator.required, Validators.maxLength(250)]],
      client: [this.clientUser.user.firstName, CustomValidator.required],
      type: [this.typeField, CustomValidator.required],
      msaType: [''],
      version: [''],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isActive: true,
    });
  }

  editClientMsa(clientMsa): void {
    const clientMsaTemp = { ...clientMsa };
    this.msaHeader = 'Update Client MSA';

    this.editclientUser = clientMsaTemp.user;

    this.clientForm.controls.id.patchValue(clientMsaTemp.id);
    this.clientForm.controls.content.patchValue(clientMsaTemp.content);
    this.clientForm.controls.version.patchValue(clientMsaTemp.version);
    if (clientMsaTemp.type === 'PROJECT') {
      this.clientForm.controls.type.patchValue('Project');
    } else if (clientMsaTemp.type === 'JOBS') {
      this.clientForm.controls.type.patchValue('Job');
    }
    this.clientForm.controls.msaType.patchValue(clientMsaTemp.msaType);
    this.clientForm.controls.isActive.patchValue(clientMsaTemp.isActive);
    this.clientForm.controls.createdBy.patchValue(clientMsaTemp.createdBy);
    this.clientForm.controls.updatedBy.patchValue(clientMsaTemp.updatedBy);
    this.clientForm.controls.client.patchValue(clientMsaTemp.user.firstName);

    this.clientMsaDialog = true;
  }

  fatchData() {
    this.clientForm.controls.client.setValue(this.clientUser.user.firstName);
    this.clientForm.controls.type.setValue(this.type);
  }

  prepareQueryParam(paramObject): URLSearchParams {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getClientDetiail(): void {
    const filterMap = new Map();

    if (this.clientUser) {
      filterMap.set('USER_ID', this.clientUser.user.id);
    }

    if (this.type.toUpperCase() === 'JOBS') {
      filterMap.set('TYPE', 'JOBS');
    } else {
      filterMap.set('TYPE', 'PROJECT');
    }

    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.datatableParam);

    this.msaClientService.getClientMSAList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.clientMsaData = data.data.result;
          this.fatchData();
        } else {
          this.notificationService.error(data.message, '');
        }
      },
      error => {
        console.log(error);
      });
  }

  onSubmit() {

    if (!this.clientForm.valid) {
      CustomValidator.markFormGroupTouched(this.clientForm);
      this.submitted = true;
      return false;
    }

    if (this.clientForm.value.id) {
      this.clientMSADTO.id = this.clientForm.value.id;
      this.clientMSADTO.createdBy = this.clientForm.value.createdBy;
      this.clientMSADTO.updatedBy = this.clientForm.value.updatedBy;
      this.clientMSADTO.version = this.clientForm.value.version;
      this.clientMSADTO.content = this.clientForm.value.content;
      this.clientMSADTO.msaType = this.clientForm.value.msaType;
      if (this.clientForm.value.type === 'Job') {
        this.clientMSADTO.type = 'JOBS';
      } else {
        this.clientMSADTO.type = this.clientForm.value.type.toUpperCase();
      }
      this.clientMSADTO.isActive = this.clientForm.value.isActive;
      this.clientMSADTO.user = this.editclientUser;
      this.msaClientService.updateClientMSA(this.clientMSADTO).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('client.msa.submitted'), '');
            this.editclientUser = null;
            this.hideDialog();
            this.getClientDetiail();
          }
          else {
            this.notificationService.error(data.message, '');
            this.submitted = false;
            this.getClientDetiail();
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
          this.getClientDetiail();
        });
    }
    else {
      this.clientMSADTO.content = this.clientForm.value.content;
      this.clientMSADTO.msaType = 'CUSTOMIZED';
      if (this.clientForm.value.type === 'Job') {
        this.clientMSADTO.type = 'JOBS';
      } else {
        this.clientMSADTO.type = this.clientForm.value.type.toUpperCase();
      }
      this.clientMSADTO.version = this.clientForm.value.version;
      this.clientMSADTO.createdBy = this.clientForm.value.createdBy;
      this.clientMSADTO.updatedBy = this.clientForm.value.updatedBy;
      this.clientMSADTO.user = this.clientUser.user;
      this.msaClientService.addClientMSA(this.clientMSADTO).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('client.msa.submitted'), '');
            this.hideDialog();
            this.getClientDetiail();
          }
          else {
            this.notificationService.error(data.message, '');
            this.submitted = false;
            this.getClientDetiail();
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
          this.getClientDetiail();
        });
    }
  }

  onActivate(clientMsa): void {
    this.msaClientService.onActive(clientMsa.id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.getClientDetiail();
        } else {
          this.notificationService.error(data.message, '');
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
      }
    );
  }

  download(documentPath, documentName): void {
    this.fileDownloadService.downloadFiles(documentPath, documentName).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const fileName = documentName;
        saveAs(blob, fileName);
      },
      error => {
        console.log(error);
      });
  }
  menuAccess(): void {
    const accessPermission = this.jobAccess.filter(e => e.menuName == 'Clients');
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
