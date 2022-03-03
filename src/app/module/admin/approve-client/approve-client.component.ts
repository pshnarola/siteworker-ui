import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ApproveClientService } from 'src/app/service/admin-services/approve-client.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { environment } from 'src/environments/environment';
import { ApproveClientAttachment } from './ApproveClientAttachment';
import { ApproveClientDetail } from './ApproveClientDetail';
import { ApproveClientDetailDTO } from './ApproveClientDetailDTO';

@Component({
  selector: 'app-approve-client',
  templateUrl: './approve-client.component.html',
  styleUrls: ['./approve-client.component.css']
})
export class ApproveClientComponent implements OnInit, OnDestroy {


  tableRowSize = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  tablePaginateDropdown = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  loading = false;
  baseUrl = environment.baseURL + '/file/getById?fileId=';
  imageUrl;

  datatableParam: DataTableParam;
  offset = 0;
  totalRecords = 0;
  sortField = 'CREATED_DATE';
  sortOrder = 0;
  loginUserId: any;

  clientData = [];


  files: any[] = [];

  FileName = '';
  selectedLogo: any;
  showPreview = false;
  logoBody: any;
  logoData: string;
  image: any;
  singleImageView: any;
  showButtons = true;
  jobAccess: any;
  btnDisabled = false;
  termList = [
    { label: 'asdf', value: 'ENUM' }
  ];

  typeList = [
    { label: 'Project', value: 'PROJECT' },
    { label: 'Job', value: 'JOBS' }
  ];

  columns = [
    { label: this.translator.instant('name'), value: 'fileName' },
  ];

  clonedProducts: { [s: string]: any } = {};
  attachment: any;
  attachmentList: any;
  temp: any[] = [];
  type: any;
  clientUserId: any;
  submitted = false;

  approveClientForm: FormGroup;

  approveClientDTO: ApproveClientDetailDTO;
  approveClientDetail: ApproveClientDetail;
  approveClientAttachment: ApproveClientAttachment;
  clientUser: any;
  loginUser: any;
  fatchedAttachmentList: any[];
  projectFileCount: any;
  jobFileCount: any;
  projectFileArray: any[] = [];
  jobFileArray: any[] = [];
  projectFilePresenet: any;
  jobFilePresenet: any;
  hasJobApproved = false;
  hasProjectApproved = false;
  isProjectMSAccepted: any;
  isJobMSAccepted: any;

  constructor(
    private route: ActivatedRoute,
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private fileService: FileDownloadService,
    private confirmDialogueService: ConfirmDialogueService,
    private approveClientService: ApproveClientService,
  ) {
    this.captionChangeService.hideSidebarSubject.next(true);
    let client = this.localStorageService.getItem('approvalOfClient');
    this.isProjectMSAccepted = client.isProjectMSAccepted;
    this.isJobMSAccepted = client.isJobMSAccepted;

    this.approveClientDTO = new ApproveClientDetailDTO();
    this.approveClientDetail = new ApproveClientDetail();
    this.approveClientAttachment = new ApproveClientAttachment();

    this.datatableParam = new DataTableParam();
    this.datatableParam = {
      offset: 0,
      size: 2,
      sortField: 'NAME',
      sortOrder: 1,
      searchText: null
    };

    this.loginUserId = localStorageService.getLoginUserId();
    this.loginUser = localStorageService.getLoginUserObject();
    this.clientUser = localStorageService.getItem('approvalOfClient');

    if (this.clientUser.photo) {
      this.imageUrl = this.baseUrl + this.clientUser.photo;
    }
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
    this.localStorageService.removeItem('approvalOfClient');
  }

  ngOnInit(): void {

    this.initializeForm();

    this.route.queryParams.subscribe(
      (params: Params) => {
        this.clientUserId = params.user;
        this.type = params.type.toUpperCase();
        this.addOrRemoveFormControl(this.type);
        this.getClientDetiail(this.clientUserId);
      });

    this.jobAccess = this.localStorageService.getItem('userAccess');

    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.APPROVE_CLIENT);
  }

  private initializeForm() {
    this.approveClientForm = this.formBuilder.group({
      id: [null],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      admin: this.loginUser,
      client: this.clientUser.user,
      clientApprovedForProject: [false,],
      paymentTermsForProject: ['', [Validators.maxLength(3), CustomValidator.required]],
    });
  }

  onSelect(event): void {
    this.files.splice(2, 0, ...event.addedFiles);
    this.files.forEach(
      (e, i) => {
        if (this.temp.some(item => item.file === e)) {
        } else {
          this.temp.push({ file: e, fileName: e.name.split('.').slice(0, -1).join('.'), id: i, postType: this.type });
        }
      });

    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.pdf.upload'), '');
      }
      event.rejectedFiles = [];
    }

    this.checkToDisplayNoRecordFound();

  }

  onRemove(event): void {
    this.files.splice(this.files.indexOf(event), 1);
  }

  onRemoveFromList(id): void {
    let fileTemp: File[] = [];
    let fileTempToEditName: any[] = [];

    if (this.files.length > 0) {
      if (this.files.length < this.temp.length) {
        this.temp.forEach((q, i) => {
          this.files.forEach((e, index) => {
            if (i !== id) {
              if (q.file === e) {
                fileTemp.push(e);
              }
              fileTempToEditName.push(q);
            }
          });
        });
        this.notificationService.success(this.translator.instant('document.deleted'), '');
      } else {
        this.files.forEach((e, index) => {
          this.temp.forEach((q, i) => {
            if (index !== id) {
              if (q.file === e) {
                fileTempToEditName.push(q);
              }
              fileTemp.push(e);
            }
          });
        });
        this.notificationService.success(this.translator.instant('document.deleted'), '');
      }
    } else if (this.temp.length > 0) {
      this.temp.forEach((q, i) => {
        if (i !== id) {
          fileTempToEditName.push(q);
        }
      });
      this.notificationService.success(this.translator.instant('document.deleted'), '');
    }

    fileTempToEditName = fileTempToEditName.filter((el, i, a) => i === a.indexOf(el));
    fileTemp = fileTemp.filter((el, i, a) => i === a.indexOf(el));

    this.files.length = 0;
    this.temp.length = 0;
    this.files = fileTemp;
    this.temp = fileTempToEditName;

    this.checkToDisplayNoRecordFound();
  }

  checkToDisplayNoRecordFound() {
    this.projectFileCount = 0;
    this.jobFileCount = 0;
    this.projectFileArray = [];
    this.jobFileArray = [];

    this.temp.forEach(q => {
      if (q.postType === 'PROJECT') {
        this.projectFileArray.push(q);
        this.projectFileCount++;
      }
      if (q.postType === 'JOBS') {
        this.jobFileArray.push(q);
        this.jobFileCount++;
      }
    });
  }

  onRemoveFromDBList(id, cId) {
    this.approveClientService.deleteApproveClientAttachment(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          setTimeout(() => {
          }, 2000);
        } else {
          this.notificationService.error(data.message, '');
        }
      });
  }

  getLatestAttachmentList(id) {
    const datatableParam = {
      offset: this.offset,
      size: 7,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: `{"APPROVE_CLIENT_ID":"${id}"}`
    };
    const queryParam = this.prepareQueryParam(datatableParam);
    this.fatchedAttachmentList.length = 0;
    this.approveClientService.getApproveClientAttachmentList(queryParam).subscribe(
      data => {
        this.fatchedAttachmentList = data.data.result;
        if (this.files.length > 0) {
          if (this.fatchedAttachmentList.length > 0) {
            this.fatchedAttachmentList.forEach(element => {
              this.temp.push(element);
            });
          }
        }
      });
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

  openDeleteDialog(id, index, title) {
    let options = null;
    const message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message}?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        if (id) {
          this.onRemoveFromList(index);
          this.onRemoveFromDBList(id, this.approveClientForm.value.id);
        }
      }
    });
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

    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.onRemoveFromList(index);
      }
    });
  }

  onTermChange(event): void {
    console.log(event);
  }

  onTypeChange(event): void {
    this.submitted = false;
    if (event.value === 'PROJECT') {
      this.type = 'PROJECT';
    } else {
      this.type = 'JOBS';
    }
    this.addOrRemoveFormControl(this.type);
    this.fatchDetail(this.approveClientDetail);
  }
  addOrRemoveFormControl(type) {
    if (type === 'PROJECT') {
      this.approveClientForm.addControl('clientApprovedForProject', new FormControl(false));
      this.approveClientForm.addControl('paymentTermsForProject', new FormControl('', [CustomValidator.required]));
      this.approveClientForm.removeControl('paymentTermsForJob');

    }
    else if (type === 'JOBS') {
      this.approveClientForm.addControl('clientApprovedForJob', new FormControl(false));
      this.approveClientForm.removeControl('clientApprovedForProject');
      this.approveClientForm.addControl('hasOvertimePayRateApplied', new FormControl(false));
      this.approveClientForm.addControl('marginRateForFullTimeEmployee', new FormControl());
      this.approveClientForm.addControl('marginRateForHourlyJob', new FormControl());
      this.approveClientForm.addControl('paymentTermsForJob', new FormControl('', [CustomValidator.required]));
      this.approveClientForm.removeControl('paymentTermsForProject');
    }
  }
  onRowEditInit(product): void {
    console.log(product);
  }

  onRowEditSave(product): void {
    console.log(product);
  }

  onRowEditCancel(product, index: number): void {
    console.log(product, index);
  }

  getClientDetiail(id: string): void {
    this.fatchedAttachmentList = [];
    this.approveClientService.getApproveClientDetailByClientId(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.approveClientDTO = data.data;
          this.fatchedAttachmentList = this.approveClientDTO.approveClientAttachment;
          this.approveClientDetail = this.approveClientDTO.approveClient;

          if (this.fatchedAttachmentList.length > 0) {
            this.temp = [];
            this.files = [];
            this.fatchedAttachmentList.forEach(element => {
              this.temp.push(element);
            });
            this.checkToDisplayNoRecordFound();
          }

          this.fatchDetail(this.approveClientDetail);
        } else {
          if (data.message !== 'No data found.') {
            this.notificationService.error(data.message, '');
          }
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
      });
  }

  fatchDetail(entity: ApproveClientDetail): void {
    if (entity.clientApprovedForJob && entity.clientApprovedForProject) {
      this.hasJobApproved = true;
      this.hasProjectApproved = true;
      this.approveClientForm.patchValue({
        createdBy: entity.createdBy,
        updatedBy: entity.updatedBy,
        createdDate: entity.createdDate,
        updatedDate: entity.updatedDate,
        id: entity.id,
        admin: entity.admin,
        client: entity.client,
        clientApprovedForJob: entity.clientApprovedForJob,
        clientApprovedForProject: entity.clientApprovedForProject,
        hasOvertimePayRateApplied: entity.hasOvertimePayRateApplied,
        marginRateForFullTimeEmployee: entity.marginRateForFullTimeEmployee,
        marginRateForHourlyJob: entity.marginRateForHourlyJob,
        paymentTermsForJob: entity.paymentTermsForJob,
        paymentTermsForProject: entity.paymentTermsForProject,
      });
    }
    else if (entity.clientApprovedForJob) {
      this.hasJobApproved = true;
      this.approveClientForm.patchValue({
        createdBy: entity.createdBy,
        updatedBy: entity.updatedBy,
        createdDate: entity.createdDate,
        updatedDate: entity.updatedDate,
        id: entity.id,
        admin: entity.admin,
        client: entity.client,
        clientApprovedForJob: entity.clientApprovedForJob,
        hasOvertimePayRateApplied: entity.hasOvertimePayRateApplied,
        marginRateForFullTimeEmployee: entity.marginRateForFullTimeEmployee,
        marginRateForHourlyJob: entity.marginRateForHourlyJob,
        paymentTermsForJob: entity.paymentTermsForJob,
      });
    }
    else if (entity.clientApprovedForProject) {
      this.hasProjectApproved = true;
      this.approveClientForm.patchValue({
        createdBy: entity.createdBy,
        updatedBy: entity.updatedBy,
        createdDate: entity.createdDate,
        updatedDate: entity.updatedDate,
        id: entity.id,
        admin: entity.admin,
        client: entity.client,
        clientApprovedForProject: entity.clientApprovedForProject,
        paymentTermsForProject: entity.paymentTermsForProject,
      });
    }
  }

  uploadFiles() {

    if (this.type === 'PROJECT') {
      this.approveClientForm.controls.clientApprovedForProject.setValue(true);
    }
    if (this.type === 'JOBS') {
      this.approveClientForm.controls.clientApprovedForJob.setValue(true);
    }

    let pCount = 0;
    let jCount = 0;

    this.temp.forEach(e => {
      if (e.postType === 'PROJECT') {
        pCount++;
      } else if (e.postType === 'JOBS') {
        jCount++;
      }
    });

    if (pCount > 5 || jCount > 5) {
      this.notificationService.error('You can upload maximum 5 Attachments', '');
      return false;
    }

    if (!this.approveClientForm.valid) {
      CustomValidator.markFormGroupTouched(this.approveClientForm);
      this.submitted = true;
      return false;
    }
    if (this.type === 'JOBS' && !this.isJobMSAccepted) {
      this.notificationService.error('Job MSA is not accepted', '');
      return false;
    }
    if (this.type === 'PROJECT' && !this.isProjectMSAccepted) {
      this.notificationService.error('Project MSA is not accepted', '');
      return false;
    }

    if (this.approveClientForm.value.id) {
      if (this.temp.length > 0) {

        const tempListForUpload = [];

        this.temp.forEach(a => {
          if (a.file) {
            tempListForUpload.push(a);
          }
        });

        this.attachmentList = [];
        let count = 0;
        if (this.temp.length) {
          this.attachment = new ApproveClientAttachment();
          const uploadFileData = new FormData();

          this.temp.forEach(element => {
            if (element.file) {

            }
            else {
              this.attachment = new ApproveClientAttachment(element.fileName, element.path, element.postType, element.id);
              this.attachmentList.push(this.attachment);
              count++;
            }
          });

          this.temp.forEach(element => {
            uploadFileData.append('file', element.file);
          });

          this.fileService.uploadMultipleFile(uploadFileData).subscribe(
            event => {
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                if (count) {
                  if (this.logoData.length === (this.temp.length - count)) {
                    tempListForUpload.forEach((element, i) => {
                      if (element.file) {
                        this.attachment = new ApproveClientAttachment(element.fileName, this.logoData[i], element.postType);
                        this.attachmentList.push(this.attachment);
                      }
                    });
                    this.onSubmit();
                  }
                } else {
                  if (this.logoData.length === this.temp.length) {
                    this.temp.forEach((element, i) => {
                      this.attachment = new ApproveClientAttachment(element.fileName, this.logoData[i], element.postType);
                      this.attachmentList.push(this.attachment);
                    });
                    this.onSubmit();
                  }
                }
              }
            },
            (error) => {
              this.notificationService.error(this.translator.instant('common.error'), '');
            });
        }


      } else {
        this.onSubmit();
      }
    } else {
      if (this.temp.length !== 0) {
        this.attachmentList = [];
        this.attachment = new ApproveClientAttachment();
        const uploadFileData = new FormData();

        this.temp.forEach(element => {
          uploadFileData.append('file', element.file);
        });

        this.fileService.uploadMultipleFile(uploadFileData).subscribe(
          event => {
            if (event instanceof HttpResponse) {
              this.logoBody = event.body;
              this.logoData = this.logoBody.data;
              if (this.logoData.length === this.temp.length) {
                this.temp.forEach((element, i) => {
                  this.attachment = new ApproveClientAttachment(element.fileName, this.logoData[i], element.postType);
                  this.attachmentList.push(this.attachment);
                });
                this.onSubmit();
              }
            }
          },
          (error) => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          });
      }
      else {
        this.onSubmit();
      }
    }
  }

  onSubmit(): boolean {
    this.submitted = true;

    if (!this.approveClientForm.valid) {
      CustomValidator.markFormGroupTouched(this.approveClientForm);
      this.submitted = true;
      return false;
    }
    if (this.type === 'JOBS' && !this.isJobMSAccepted) {
      this.notificationService.error('Job MSA is not accepted', '');
      return false;
    }
    if (this.type === 'PROJECT' && !this.isProjectMSAccepted) {
      this.notificationService.error('Project MSA is not accepted', '');
      return false;
    }
    this.approveClientDetail = this.approveClientForm.value;
    this.approveClientDTO.approveClient = this.approveClientDetail;
    this.approveClientDTO.approveClientAttachment = this.attachmentList;

    if (this.approveClientForm.value.id) {
      this.approveClientService.updateApproveClient(this.approveClientDTO).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.getClientDetiail(this.clientUserId);
            this.notificationService.success(this.translator.instant('client.approved'), '');
          }
          else {
            this.notificationService.error(data.message, '');
            this.getClientDetiail(this.clientUserId);
            this.submitted = false;
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
        });

    } else {
      this.approveClientService.addApproveClient(this.approveClientDTO).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.getClientDetiail(this.clientUserId);
            this.notificationService.success(this.translator.instant('client.approved'), '');
          }
          else {
            this.notificationService.error(data.message, '');
            this.getClientDetiail(this.clientUserId);
            this.submitted = false;
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
        });

    }
  }

  menuAccess(): void {
    const accessPermission = this.jobAccess.filter(e => e.menuName == 'Jobs');
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
