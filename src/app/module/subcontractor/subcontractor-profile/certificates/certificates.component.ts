import { HttpResponse } from '@angular/common/http';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { CoiService } from 'src/app/service/subcontractor-services/coi/coi.service';
import { EmrService } from 'src/app/service/subcontractor-services/emr/emr.service';
import { OshaService } from 'src/app/service/subcontractor-services/osha/osha.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { User } from 'src/app/shared/vo/User';
import { COI } from '../vo/COI';
import { EMR } from '../vo/emr';
import { OSHA } from '../vo/OSHA';
import { SubcontractorProfileDto } from '../vo/subcontractor-profile-dto';


@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html',
  styleUrls: ['./certificates.component.css']
})
export class CertificatesComponent implements OnInit {
  subcontractor: SubcontractorProfileDto;

  year;
  yearOfdelted;
  currentYear;
  dataOfYear: string[] = [];
  listOfEMR: EMR[] = [];
  listOfEMRTemp: EMR[] = [];
  listOfEMRTempToDeleted: EMR[] = [];
  emr: EMR;
  emrDto: EMR;
  responseEmr: EMR;
  userTemp: User;
  header: String;
  emrDialog = false;
  hasEMR = false;
  emrForm: FormGroup;


  currentYearOsha;
  hasOSHA = false;
  listOfOsha: OSHA[] = [];
  listOfOshaTemp: OSHA[] = [];
  osha: OSHA;
  oshaDto: OSHA;
  responseOsha: OSHA;
  headerOsha: String;
  oshaDialog = false;
  oshaForm: FormGroup;
  verifyOsha: OSHA;


  COIForm: FormGroup;
  umbrellaExcess;
  umbrellaLiabilities = [
    { label: '$ 1 million', value: '1 million' }
  ];
  hasCOI = false;
  coi: COI;
  coiDto: COI;


  datatableParam: DataTableParam;
  datatableParamOfCOI: DataTableParam;
  offset: Number = 0;
  totalRecords: Number = 0;
  sortField = 'CREATED_DATE';
  sortOrder = 0;
  size = 2;
  globalFilter;
  filterMap = new Map();
  queryParam;
  loading;

  loginUserId;

  selectedFile: File;
  selectedOshaFile: File;
  selectedCOIFile: File;
  showPreview = false;
  newImage = false;
  logoBody: any;
  logoData: string;
  logoBodyOsha: any;
  logoDataOsha: string;
  logoBodyCOI: any;
  logoDataCOI: string;
  image: any;
  singleImageView: any;
  files: File[] = [];
  filesOsha: File[] = [];
  filesCOI: File[] = [];
  fileName: string;

  @Output() goToActiveLicense = new EventEmitter<any>();
  @Output() goToCompanyDetails = new EventEmitter<any>();


  columns = [
    { label: this.translator.instant('year'), value: 'year' },
    { label: this.translator.instant('status'), value: 'status' },
    { label: this.translator.instant('document'), value: 'document' },
  ];

  columnsCOI = [
    { label: this.translator.instant('Type Of Insurance') },
    { label: this.translator.instant('Minimum Limits Required') },
    { label: this.translator.instant('Meet Minimum Limits') },
  ];

  columnsOsha = [
    { label: this.translator.instant('year'), value: 'year' },
    { label: this.translator.instant('status'), value: 'status' },
    { label: this.translator.instant('Document/Osha'), value: 'document' },
  ];
  submitted: boolean;
  editMode = false;
  editModeOsha = false;
  opt: any;
  path: any;
  name: any;
  spinner = false;
  isAutoMobileLimitMeets = true;
  isGeneralLimitMeets = true;
  isWorkerLimitMeets = true;
  coiFileName;

  constructor(
    private translator: TranslateService,
    private _emrService: EmrService,
    private _oshaService: OshaService,
    private coiService: CoiService,
    private _fileServices: FileDownloadService,
    private _notificationService: UINotificationService,
    private _formBuilder: FormBuilder,
    public _subContractorProfileServices: SubcontractorProfileService,
    private _localStorageService: LocalStorageService,
    private confirmDialogueService: ConfirmDialogueService
  ) {
    this.loginUserId = _localStorageService.getLoginUserId();

    this.globalFilter = `{"USER_ID":"${this.loginUserId}"}`;

    this.datatableParam = {
      offset: this.offset,
      size: 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: `{"USER_ID":"${this.loginUserId}"}`
    };

  }

  ngOnInit(): void {
    this._subContractorProfileServices.subContractorProfileDetailSubject.subscribe(data => this.subcontractor = data);
    this.loadEmrList();
    this.loadOshaList();
    this.getDate();
    this.initializeForm();
    this.initializeOshaForm();
    this.initializeCOIForm();
    this.getLogedInClientDetail(this.loginUserId);
    this.loadCOI();
  }

  getDate() {
    this.year = (new Date()).getFullYear();
    this.yearOfdelted = (new Date()).getFullYear();
    this.listOfThreeYear();
  }

  onClick(event) {
    this.submitted = false;
  }
  onClickOsha(event) {
    this.submitted = false;
  }
  onClickCOI(event) {
    this.submitted = false;
    this.COIForm.get('isEnable').setValue(this.hasCOI);
    this.COIForm.get('isEnable').valueChanges.subscribe(response => {
      this.initializeCOIForm();
      if (!response) {
        this.COIForm.removeControl('umbrellaLiability');
      }
      if (response) {
        this.COIForm.addControl('umbrellaLiability', new FormControl('', [CustomValidator.required]));
      }
    });
  }


  listOfThreeYear() {
    this.dataOfYear.length = 0;
    for (let index = 0; index < 3; index++) {
      this.year--;
      this.dataOfYear.push(this.year);
    }
    this.dataOfYear.forEach(year => {

      this.emr = {
        id: '',
        year: year,
        status: '',
        documentPath: '',
        documentName: '',
        user: this.userTemp,
      };

      this.osha = {
        id: '',
        year: year,
        status: '',
        documentPath: '',
        documentName: '',
        optOutReason: '',
        user: this.userTemp,
      };

      this.listOfEMRTemp.push(this.emr);
      this.listOfEMRTempToDeleted.push(this.emr);
      this.listOfOshaTemp.push(this.osha);
    });
  }

  getYearTodisplay(): void {

    this.listOfEMRTemp.forEach(e => {
      this.listOfEMR.find(element => {
        if (e.year == (element.year)) {
          this.listOfEMRTemp.map(q => {
            if (q.year == element.year) {
              q.id = element.id;
              q.year = element.year;
              q.documentPath = element.documentPath;
              q.documentName = element.documentName;
              q.status = element.status;
              q.user = element.user;
            }
          });
        } else {
        }
      });
    });

  }

  addEmr(year): any {
    this.emrDialog = true;
    this.editMode = false;
    this.initializeForm();
    this.header = 'Add EMR Of Year-' + year;
    this.currentYear = year;

  }

  hideDialog(): any {
    this.files = [];
    this.emrDialog = false;
    this.editMode = false;
    this.submitted = false;
  }

  editEmr(entity: EMR) {
    this.header = 'Edit EMR Of Year-' + entity.year;
    this.currentYear = entity.year;
    this.emrDialog = true;

    this.editMode = true;
    this.emrDto = { ...entity };

    this.emrForm.controls.id.patchValue(this.emrDto.id);
    this.emrForm.controls.year.patchValue(this.emrDto.year);
    this.emrForm.controls.status.patchValue(this.emrDto.status);
    this.emrForm.controls.documentName.patchValue(this.emrDto.documentName);
    this.emrForm.controls.documentPath.patchValue(this.emrDto.documentPath);

    this.emrDialog = true;
  }

  initializeForm() {
    this.emrForm = this._formBuilder.group({
      id: [null],
      year: ['', [CustomValidator.required]],
      status: ['UNDER_REVIEW'],
      documentPath: [''],
      documentName: [''],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
    });
  }

  getLogedInClientDetail(id) {
    this._subContractorProfileServices.getSubcontractorDetail(id).subscribe(
      (data) => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractor = data.data;
          this.hasEMR = this.subcontractor.subcontractorProfile.hasEMR;
          this.hasOSHA = this.subcontractor.subcontractorProfile.hasOSHA;
          this.hasCOI = this.subcontractor.subcontractorProfile.hasCOI;

        } else {
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  onLazyLoad(event?): void {
    this.sortOrder = event.sortOrder == -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : null;
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getDeletedYearList() {
    this.year = null;
    this.listOfEMRTemp.length = 0;
    this.dataOfYear.length = 0;
    this.year = (new Date()).getFullYear();

    for (let index = 0; index < 3; index++) {
      this.year--;
      this.dataOfYear.push(this.year);
    }
    this.dataOfYear.forEach(year => {

      this.emr = {
        id: '',
        year: year,
        status: '',
        documentPath: '',
        documentName: '',
        user: this.userTemp,
      };
      this.listOfEMRTemp.push(this.emr);
    });

    this.listOfEMRTemp.forEach(e => {
      this.listOfEMR.find(element => {
        if (e.year == (element.year)) {
          this.listOfEMRTemp.map(q => {
            if (q.year == element.year) {
              q.id = element.id;
              q.year = element.year;
              q.documentPath = element.documentPath;
              q.documentName = element.documentName;
              q.status = element.status;
              q.user = element.user;
            }
          });
        } else {
        }
      });
    });
  }

  getDeletedYearListOfOSHA() {
    this.year = null;
    this.listOfOshaTemp.length = 0;
    this.dataOfYear.length = 0;
    this.year = (new Date()).getFullYear();

    for (let index = 0; index < 3; index++) {
      this.year--;
      this.dataOfYear.push(this.year);
    }
    this.dataOfYear.forEach(year => {

      this.osha = {
        id: '',
        year: year,
        status: '',
        documentPath: '',
        documentName: '',
        optOutReason: '',
        user: this.userTemp,
      };
      this.listOfOshaTemp.push(this.osha);
    });

    this.listOfOshaTemp.forEach(e => {
      this.listOfOsha.find(element => {
        if (e.year == (element.year)) {
          this.listOfOshaTemp.map(q => {
            if (q.year == element.year) {
              q.id = element.id;
              q.year = element.year;
              q.optOutReason = element.optOutReason;
              q.documentPath = element.documentPath;
              q.documentName = element.documentName;
              q.status = element.status;
              q.user = element.user;
            }
          });
        } else {
        }
      });
    });
  }

  loadEmrList(deleted?) {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._emrService.getEmrList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.loading = false;
            this.listOfEMR = data.data.result;
            if (deleted === 'delete') {
              setTimeout(() => {
                this.getDeletedYearList();
              }, 2000);
            } else {
              setTimeout(() => {
                this.getYearTodisplay();
              }, 2000);
            }
          }
        } else {
          this.loading = false;
        }
      },
      error => {
        this.loading = false;
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  onSelect(event) {
    this.files.push(...event.addedFiles);
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this._notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      } else {
        this._notificationService.error(this.translator.instant('image.pdf.upload'), '');
      }
      event.rejectedFiles = [];
    }
  }

  onRemove(id) {
    const fileTemp: File[] = [];
    this.files.forEach((e, index) => {
      if (index !== id) {
        fileTemp.push(e);
      }
    });
    this.files.length = 0;
    this.files = fileTemp;
    this._notificationService.success(this.translator.instant('document.deleted'), '');
  }

  uploadFile(next?: string) {

    if (this.files[1]) {
      this._notificationService.error(this.translator.instant('single.document.required'), '');
    } else {
      this.selectedFile = this.files[0];
      if (this.selectedFile) {
        const uploadImageData = new FormData();
        uploadImageData.append('file', this.selectedFile);
        this._fileServices.uploadFile(uploadImageData).subscribe(
          event => {
            this.fileName = this.selectedFile.name;
            if (event instanceof HttpResponse) {
              this.logoBody = event.body;
              this.logoData = this.logoBody.data;
              this.emrForm.controls.documentPath.setValue(this.logoData);
              this.emrForm.controls.documentName.setValue(this.fileName);
              this.onSubmit();
            }
          },
          (error) => {
            this._notificationService.error(this.translator.instant('common.error'), '');
          }
        );
      }
      else {
        this._notificationService.error(this.translator.instant('select.document'), '');
      }
    }
  }

  onSubmit(next?) {

    if (this.emrForm.controls.id.value != null) {

      this.emrDto = this.emrForm.value;
      this.emrDto.user = this.subcontractor.subcontractorProfile.user;
      this.emrDto.year = this.currentYear;

      this._emrService.updateEmr(this.emrDto).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('emr.updated'), '');
            this.emrDialog = false;
            this.submitted = false;
            this.editMode = false;
            this.files = [];
            this.loadEmrList();

          } else {
            this._notificationService.error(data.message, '');
            this.emrDialog = false;
            this.submitted = false;
            this.editMode = false;
            this.files = [];
            this.loadEmrList();

          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.emrDialog = false;
          this.submitted = false;
          this.editMode = false;
          this.files = [];
          this.loadEmrList();


        }
      );
    } else {
      this.emrDto = this.emrForm.value;
      this.emrDto.user = this.subcontractor.subcontractorProfile.user;
      this.emrDto.year = this.currentYear;

      this._emrService.addEmr(this.emrDto).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('emr.added'), '');
            this.emrDialog = false;
            this.submitted = false;
            this.files = [];
            this.loadEmrList();


          } else {
            this._notificationService.error(data.message, '');
            this.emrDialog = false;
            this.submitted = false;
            this.files = [];
            this.loadEmrList();


          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.emrDialog = false;
          this.submitted = false;
          this.files = [];
          this.loadEmrList();

        }
      );
    }

  }

  deleteOsha(id) {
    this._oshaService.deleteOsha(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('osha.deleted'), '');
          setTimeout(() => {
            this.loadOshaList('delete');
          }, 2000);
        } else {
          this._notificationService.error(data.message, '');
          this.loadOshaList();
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.loadOshaList();
      }
    );
  }

  deleteEmr(id) {
    this._emrService.deleteEmr(id).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this._notificationService.success(this.translator.instant('emr.deleted'), '');
          setTimeout(() => {
            this.loadEmrList('delete');
          }, 2000);
        } else {
          this._notificationService.error(data.message, '');
          this.loadEmrList();
        }
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
        this.loadEmrList();
      }
    );
  }

  onSelectOsha(event): void {
    this.filesOsha.push(...event.addedFiles);
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this._notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      } else {
        this._notificationService.error(this.translator.instant('image.pdf.upload'), '');
      }
      event.rejectedFiles = [];
    }
  }

  onRemoveOsha(id): void {
    const fileTemp: File[] = [];
    this.filesOsha.forEach((e, index) => {
      if (index !== id) {
        fileTemp.push(e);
      }
    });
    this.filesOsha.length = 0;
    this.filesOsha = fileTemp;
    this._notificationService.success(this.translator.instant('document.deleted'), '');
  }

  uploadOshaFile(next?: string): void {
    if (this.filesOsha[1]) {
      this._notificationService.error(this.translator.instant('single.document.required'), '');
    } else {
      this.selectedOshaFile = this.filesOsha[0];
      if (this.selectedOshaFile) {

        if (this.oshaForm.controls.outPutReason.value) {
          return this._notificationService.error(this.translator.instant('please.select.document.or.write.opt.out.reason'), '');
        }

        const uploadImageData = new FormData();
        uploadImageData.append('file', this.selectedOshaFile);
        this._fileServices.uploadFile(uploadImageData).subscribe(
          event => {
            if (event instanceof HttpResponse) {
              this.logoBodyOsha = event.body;
              this.logoDataOsha = this.logoBodyOsha.data;
              this.oshaForm.controls.documentPath.setValue(this.logoDataOsha);
              this.oshaForm.controls.documentName.setValue(this.selectedOshaFile.name);
              this.onSubmitOsha();
            }
          },
          (error) => {
            this._notificationService.error(this.translator.instant('common.error'), '');
          }
        );
      }
      else {
        if (this.oshaForm.controls.outPutReason.value) {
          this.onSubmitOsha();
        } else {
          this._notificationService.error(this.translator.instant('please.select.document.or.write.opt.out.reason'), '');
        }
      }
    }
  }

  addOsha(year): any {
    this.oshaDialog = true;
    this.editModeOsha = false;
    this.initializeOshaForm();
    this.header = 'Upload - ' + year + ' OSHA';
    this.currentYearOsha = year;

  }

  hideDialogOsha(): any {
    this.filesOsha = [];
    this.oshaDialog = false;
    this.editModeOsha = false;
    this.submitted = false;
  }

  editOsha(entityO: OSHA) {
    this.header = 'Edit OSHA Of Year-' + entityO.year;
    this.currentYearOsha = entityO.year;
    this.oshaDialog = true;

    this.editModeOsha = true;
    this.oshaDto = { ...entityO };
    this.verifyOsha = this.oshaDto;

    this.oshaForm.controls.id.patchValue(this.oshaDto.id);
    this.oshaForm.controls.year.patchValue(this.oshaDto.year);
    this.oshaForm.controls.status.patchValue(this.oshaDto.status);
    this.oshaForm.controls.documentName.patchValue(this.oshaDto.documentName);
    this.oshaForm.controls.documentPath.patchValue(this.oshaDto.documentPath);
    this.oshaForm.controls.outPutReason.patchValue(this.oshaDto.optOutReason);



    this.oshaDialog = true;
  }

  getYearTodisplayOsha() {
    this.listOfOshaTemp.forEach(e => {
      this.listOfOsha.find(element => {
        if (e.year == (element.year)) {
          this.listOfOshaTemp.map(q => {
            if (q.year == element.year) {
              q.id = element.id;
              q.year = element.year;
              q.documentPath = element.documentPath;
              q.documentName = element.documentName;
              q.optOutReason = element.optOutReason;
              q.status = element.status;
              q.user = element.user;
            }
          });
        } else {
        }
      });
    });
  }

  initializeOshaForm() {
    this.oshaForm = this._formBuilder.group({
      id: [null],
      year: ['', [CustomValidator.required]],
      status: ['UNDER_REVIEW'],
      documentPath: [''],
      documentName: [''],
      outPutReason: [''],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
    });
  }

  loadOshaList(deleted?) {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this._oshaService.getOshaList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.loading = false;
            this.listOfOsha = data.data.result;
            if (deleted === 'delete') {
              setTimeout(() => {
                this.getDeletedYearListOfOSHA();
              }, 2000);
            } else {
              setTimeout(() => {
                this.getYearTodisplayOsha();
              }, 2000);
            }
            this.listOfOsha.map(e => {
            });
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

  onSubmitOsha() {

    if (this.oshaForm.controls.id.value != null) {

      const id = this.oshaForm.controls.id.value;
      this.oshaDto = this.oshaForm.value;
      this.oshaDto.optOutReason = this.oshaForm.value.outPutReason;
      this.oshaDto.user = this.subcontractor.subcontractorProfile.user;
      this.oshaDto.year = this.currentYearOsha;

      if (this.verifyOsha.documentName && this.oshaDto.optOutReason) {
        this.oshaDto.documentName = null;
        this.oshaDto.documentPath = null;
      } else if (this.verifyOsha.optOutReason && this.oshaDto.documentName) {
        this.oshaDto.optOutReason = null;
      }

      this._oshaService.updateOsha(this.oshaDto).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('osha.updated'), '');
            this.oshaDialog = false;
            this.submitted = false;
            this.editModeOsha = false;
            this.filesOsha = [];
            this.loadOshaList();

          } else {
            this._notificationService.error(data.message, '');
            this.oshaDialog = false;
            this.submitted = false;
            this.editModeOsha = false;
            this.filesOsha = [];
            this.loadOshaList();

          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.oshaDialog = false;
          this.submitted = false;
          this.editModeOsha = false;
          this.filesOsha = [];
          this.loadOshaList();

        }
      );
    } else {
      this.oshaDto = this.oshaForm.value;
      this.oshaDto.optOutReason = this.oshaForm.value.outPutReason;
      this.oshaDto.user = this.subcontractor.subcontractorProfile.user;
      this.oshaDto.year = this.currentYearOsha;

      this._oshaService.addOsha(this.oshaDto).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('osha.added'), '');
            this.oshaDialog = false;
            this.submitted = false;
            this.filesOsha = [];
            this.loadOshaList();

          } else {
            this._notificationService.error(data.message, '');
            this.oshaDialog = false;
            this.submitted = false;
            this.filesOsha = [];
            this.loadOshaList();

          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.oshaDialog = false;
          this.submitted = false;
          this.filesOsha = [];
          this.loadOshaList();

        }
      );
    }
  }

  onStatusChange(event) {
    this.umbrellaExcess = event.value;
  }

  initializeCOIForm() {
    this.COIForm = this._formBuilder.group({
      id: [null],
      isEnable: [this.hasOSHA],
      status: ['UNDER_REVIEW'],
      documentPath: [''],
      documentName: [''],
      umbrellaLiability: ['', [CustomValidator.required]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
    });
  }

  onSelectCOI(event) {
    this.filesCOI.push(...event.addedFiles);
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this._notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      } else {
        this._notificationService.error(this.translator.instant('image.pdf.upload'), '');
      }
      event.rejectedFiles = [];
    }
  }

  uploadFileOfCOI(next?: string) {
    if (this.filesCOI?.length) {
      if (this.filesCOI.length > 1) {
        this._notificationService.error(this.translator.instant('single.document.required'), '');
      } else {
        this.selectedCOIFile = this.filesCOI[0];
        if (this.selectedCOIFile) {
          const uploadImageData = new FormData();
          uploadImageData.append('file', this.selectedCOIFile);
          this._fileServices.uploadFile(uploadImageData).subscribe(
            event => {
              this.fileName = this.selectedCOIFile.name;
              if (event instanceof HttpResponse) {
                this.logoBodyCOI = event.body;
                this.logoDataCOI = this.logoBodyCOI.data;
                this.COIForm.controls.documentPath.setValue(this.logoDataCOI);
                this.COIForm.controls.documentName.setValue(this.fileName);
                this.onSubmitCOI();
              }
            },
            (error) => {
              this._notificationService.error(this.translator.instant('common.error'), '');
            }
          );
        }
      }
    } else {
      this.onSubmitCOI();
    }
  }

  onSubmitCOI() {
    this.submitted = true;

    if (this.COIForm.controls.id.value != null) {
      if (!this.COIForm.valid) {
        CustomValidator.markFormGroupTouched(this.COIForm);
        this.submitted = true;

        return false;
      }
      this.coiDto.user = this.subcontractor.subcontractorProfile.user;
      this.coiDto.documentName = this.COIForm.value.documentName;
      this.coiDto.documentPath = this.COIForm.value.documentPath;
      this.coiDto.id = this.COIForm.value.id;
      this.coiDto.isAutoMobileLimitMeets = this.isAutoMobileLimitMeets;
      this.coiDto.isGeneralLimitMeets = this.isGeneralLimitMeets;
      this.coiDto.isWorkerLimitMeets = this.isWorkerLimitMeets;
      this.coiDto.status = this.COIForm.value.status;
      this.coiDto.umbrellaLiability = this.COIForm.value.umbrellaLiability;
      this.coiService.updateCOI(this.coiDto).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('coi.updated'), '');
            this.filesCOI = [];

            this.submitted = false;
            this.loadCOI();
          } else {
            this._notificationService.error(data.message, '');
            this.filesCOI = [];

            this.submitted = false;
            this.loadCOI();
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.filesCOI = [];

          this.submitted = false;
          this.loadCOI();
        }
      );
    } else {
      if (this.COIForm.value.documentName == '' && this.COIForm.value.documentPath == '') {
        return this._notificationService.error('Document is Mandatory', '');
      }
      if (!this.COIForm.valid) {
        CustomValidator.markFormGroupTouched(this.COIForm);
        this.submitted = true;

        return false;
      }
      this.coiDto = new COI();
      this.coiDto.user = this.subcontractor.subcontractorProfile.user;
      this.coiDto.documentName = this.COIForm.value.documentName;
      this.coiDto.documentPath = this.COIForm.value.documentPath;
      this.coiDto.id = this.COIForm.value.id;
      this.coiDto.isAutoMobileLimitMeets = this.isAutoMobileLimitMeets;
      this.coiDto.isGeneralLimitMeets = this.isGeneralLimitMeets;
      this.coiDto.isWorkerLimitMeets = this.isWorkerLimitMeets;
      this.coiDto.status = this.COIForm.value.status;
      this.coiDto.umbrellaLiability = this.COIForm.value.umbrellaLiability;
      this.coiService.addCOI(this.coiDto).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('coi.added'), '');
            this.filesCOI = [];

            this.submitted = false;
            this.loadCOI();
          } else {
            this._notificationService.error(data.message, '');

            this.submitted = false;
            this.filesCOI = [];
            this.loadCOI();
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');

          this.submitted = false;
        }
      );
    }

  }

  loadCOI() {
    const filterMap = new Map();
    filterMap.set('USER_ID', this.loginUserId);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParamOfCOI = {
      offset: this.offset,
      size: 1,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParamOfCOI);
    this.coiService.getCOIList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.coiDto = data.data.result[0];
            if (this.coiDto) {
              this.isAutoMobileLimitMeets = this.coiDto.isAutoMobileLimitMeets;
              this.isGeneralLimitMeets = this.coiDto.isGeneralLimitMeets;
              this.isWorkerLimitMeets = this.coiDto.isWorkerLimitMeets;
              this.coiFileName = this.coiDto.documentName;
              this.COIForm.get('umbrellaLiability').patchValue(this.coiDto.umbrellaLiability);
              this.COIForm.get('id').patchValue(this.coiDto.id);
              this.COIForm.get('status').patchValue(this.coiDto.status);
              this.COIForm.get('documentName').patchValue(this.coiDto.documentName);
              this.COIForm.get('documentPath').patchValue(this.coiDto.documentPath);
            }
          }
        } else {
        }
      },
      error => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  download(id, name) {
    this._fileServices.downloadFiles(id, name).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const fileName = name;
        saveAs(blob, fileName);
      },
      (error) => {
        this._notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  onSubmitSubcontractorDetail(next?) {
    if (this._subContractorProfileServices.subcontractorEditForm.controls.id.value != null || !this._subContractorProfileServices.subcontractorEditForm.valid) {
      if (this.hasEMR && this.listOfEMR.length == 0) {
        this._notificationService.error(this.translator.instant('emr.required'), '');
        return false;
      }
      if (this.hasOSHA && this.listOfOsha.length == 0) {
        this._notificationService.error(this.translator.instant('osha.required'), '');
        return false;
      }
      if (this.hasCOI && !this.coiDto) {
        this._notificationService.error(this.translator.instant('coi.required'), '');
        return false;
      }
      this.subcontractor.subcontractorProfile.hasEMR = this.hasEMR;
      this.subcontractor.subcontractorProfile.hasOSHA = this.hasOSHA;
      this.subcontractor.subcontractorProfile.hasCOI = this.hasCOI;
      this._subContractorProfileServices.updateSubcontractorProfile(this.subcontractor).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this._notificationService.success(this.translator.instant('subcontractor.profile.updated'), '');
            this.submitted = false;
            if (next == 'next') {
              this.next();
            }
          }
        },
        (error) => {
          this._notificationService.error(this.translator.instant('common.error'), '');
          this.submitted = false;
        }
      );

    }
    else {
      this._notificationService.error(this.translator.instant('client.profile.not.found'), '');
    }
  }

  openEMRDialog(id, name): void {

    let options = null;
    const message = this.translator.instant('dialog.message.delete');

    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text'),
    };

    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteEmr(id);
      }

    });
  }

  openOSHADialog(id, name?, reason?): void {

    let options = null;
    let message;
    if (name) {
      message = this.translator.instant('dialog.message.delete');
    } else {
      message = this.translator.instant('dialog.message.optoutReason');
    }

    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text'),
    };

    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteOsha(id);
      }

    });
  }

  next(string?) {
    this.goToActiveLicense.emit('');
  }

  previous(string?) {
    this.goToCompanyDetails.emit('');
  }

  openDeleteDialogForTemp(index, title): void {
    let options = null;
    const message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ?`),
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

  openDeleteDialogForTempOsha(index, title): void {
    let options = null;
    const message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.onRemoveOsha(index);
      }
    });
  }

  openDeleteDialogForTempEmr(index, title): void {
    let options = null;
    const message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogueService.open(options);
    this.confirmDialogueService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.onRemove(index);
      }
    });
  }

  onRemoveFromList(id) {
    const fileTemp: File[] = [];
    this.filesCOI.forEach((e, index) => {
      if (index !== id) {
        fileTemp.push(e);
      }
    });
    this.filesCOI.length = 0;
    this.filesCOI = fileTemp;
    this._notificationService.success(this.translator.instant('document.deleted'), '');
  }

}
