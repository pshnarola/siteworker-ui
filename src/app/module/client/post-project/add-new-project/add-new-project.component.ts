import { DatePipe } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { Company } from 'src/app/module/admin/company/company';
import { CompanyService } from 'src/app/service/admin-services/company/company.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { IndustryTypeService } from 'src/app/service/admin-services/industry-type/industry-type.service';
import { RegionService } from 'src/app/service/admin-services/region/region.service';
import { StateService } from 'src/app/service/admin-services/state/state.service';
import { JobsiteDetailService } from 'src/app/service/client-services/jobsite-details/jobsite-detail.service';
import { JobsiteService } from 'src/app/service/client-services/post-project/jobsite.service';
import { PostProjectService } from 'src/app/service/client-services/post-project/post-project.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { IndustryType } from 'src/app/shared/vo/IndustryType';
import { Region } from 'src/app/shared/vo/region/region';
import { State } from 'src/app/shared/vo/state/state';
import { JobsiteStatus } from '../../enums/jobsiteStatus';
import { ProjectStatus } from '../../enums/projectStatusenum';
import { JobsiteDetail } from '../../Vos/jobsitemodel';
import { ProjectAttachmentDTO } from '../../Vos/ProjectAttachment';
import { ProjectDetail } from '../../Vos/projectDetailmodel';

@Component({
  selector: 'app-add-new-project',
  templateUrl: './add-new-project.component.html',
  styleUrls: ['./add-new-project.component.css'],
  providers: [DatePipe]
})
export class AddNewProjectComponent implements OnInit {

  todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd');
  dateTime = new Date();
  filteredClients: any[];
  filteredClientLength;
  filteredRegion: any[];
  filteredState: any[];
  filteredIndustryType: any[];
  fileLabel = this.translator.instant('choose.file');
  addNewProjectForm: FormGroup;
  submitted = false;
  clients: Company[];
  queryParam;
  datatableParam: DataTableParam = {
    offset: 0,
    size: 100000,
    sortField: '',
    sortOrder: 1,
    searchText: null
  };
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  blockSomeSpecial: RegExp = COMMON_CONSTANTS.blockSomeSpecial;
  region: Region[];
  industryType: IndustryType[];
  state: State[];
  isInvalidBidDueDate = false;
  isInvalidStartDate = false;
  isInvalidCompletionDate = false;
  companyDialog = false;
  submittedCompany = false;
  myCompanyForm: FormGroup;
  loginUserId: string;
  addProjectDetail = new ProjectDetail();
  bidDueDate = new Date();
  startDate = new Date();
  completionDate = new Date();
  files: File[] = [];
  selectedFile: File[] = [];
  uploadedFile: ProjectAttachmentDTO[] = [];
  uploadableFile: any[] = [];
  logoData;
  logoBody;
  tempAttachment: ProjectAttachmentDTO[] = [];
  filterMap = new Map();
  dataTableParam;
  globalFilter;
  jobsiteList: JobsiteDetail[] = [];
  tempSelectedFile: File[] = [];
  subscription: Subscription;
  subscription1: Subscription;
  subscription2: Subscription;

  isProjectPosted = false;
  checkProjectIsPosted;
  singleJobsiteToBeAdded:boolean = false;


  @Input() reviewproject;
  @Input() reviewFormGroup;

  excelFiles: File[] = [];
  selectedValue = true;
  uploadExcelDialog = false;
  fileName = 'project_import_sample_file.xlsx';
  selectedExcel: any;
  importFromExcelProjectValidationMessage: any;

  stateParams: { name: any; };
  singleJobsiteAdded:boolean = true;
  displaySingleJobsiteAdded:boolean = true;

  constructor(private datePipe: DatePipe,
    private _formBuilder: FormBuilder,
    private companyService: CompanyService,
    private regionService: RegionService,
    private _companyService: CompanyService,
    private _localStorageService: LocalStorageService,
    private industryTypeService: IndustryTypeService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private router: Router,
    private confirmDialogService: ConfirmDialogueService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private postProjectService: PostProjectService,
    private _industryTypeService: IndustryTypeService,
    private jobsiteService: JobsiteService,
    private _fileService: FileDownloadService,
    private filterLeftPanelService: FilterLeftPanelDataService
  ) {
    this.dateTime.setDate(this.dateTime.getDate());

    this.projectJobSelectionService.hideJobsiteListBehaviourSubject.next(true);

  }

  ngOnInit(): void {
    this.isProjectPosted = false;
    this.onSetValueOfForm();
    this.subscription1 = this.postProjectService.editProject.subscribe(
      data => {
        const projectDetail = this._localStorageService.getItem('addProjectDetail');
        const isInEditMode = this._localStorageService.getItem('isEditMode');
        if(isInEditMode) {
          this.displaySingleJobsiteAdded = false;
        } else {
          this.displaySingleJobsiteAdded = true;
        }
        if (this._localStorageService.getItem('isEditMode') && data?.status === 'POSTED') {
          this.isProjectPosted = true;
        } else if (isInEditMode && projectDetail?.status === 'POSTED') {
          this.isProjectPosted = true;
        } else {
          this.isProjectPosted = false;
        }
        if (data !== null) {
          this.onSetValueOfForm();
        }
      }
    );
  }

  ngOnChanges() {
    if (this.reviewFormGroup) {
      this.onSetValueOfForm();
      this.uploadedFile = this._localStorageService.getItem('addProjectDetail').attachment;
    }
  }
  changeValue(event){
    if(event.target.value == 'yes') {
      this.singleJobsiteToBeAdded = true;
      this._localStorageService.setItem('singleJobsiteToBeAdded', true);
    } else {
      this.singleJobsiteToBeAdded = false;
      this._localStorageService.setItem('singleJobsiteToBeAdded', false);
    }
  }

  ngOnDestroy() {
    if (this.reviewFormGroup) {
      this.reviewFormGroup = null;
    }
    console.log('in destroy');
    if (this.subscription) {
      //this.subscription.unsubscribe();
    }
    if (this.subscription1) {
      this.subscription1.unsubscribe();
    }
  }

  onClick(event) {
    if (this.selectedValue) {
      this.submitted = false;
    } else {
      this.showDialogOfUploadExcel();
    }
  }

  hideDialogOfUploadExcel() {
    this.uploadExcelDialog = false;
    this.excelFiles = [];
    this.importFromExcelProjectValidationMessage = null;
    this.selectedValue = true;
  }

  showDialogOfUploadExcel() {
    this.uploadExcelDialog = true;
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
    this.excelFiles.forEach((e, index) => {
      if (index !== id) {
        fileTemp.push(e);
      }
    });
    this.excelFiles.length = 0;
    this.excelFiles = fileTemp;
    this.notificationService.success(this.translator.instant('document.deleted'), '');
  }

  onSelectExcelFile(event): void {
    this.excelFiles.splice(2, 0, ...event.addedFiles);
  }

  uploadExcelData() {
    this.selectedExcel = this.excelFiles[0];
    console.log(this.selectedExcel);
    if (this.excelFiles.length < 2 && this.excelFiles.length > 0) {
      if (this.selectedExcel) {
        const uploadImageData = new FormData();
        uploadImageData.append('file', this.selectedExcel);
        this.postProjectService.uploadExcel(uploadImageData, this.loginUserId).subscribe(
          data => {
            console.log(data);
            if (data instanceof HttpResponse) {
              console.log(data.body);
              const response: any = data.body;
              if (response.statusCode === '200' && response.data) {
                this.notificationService.success('Excel file uploaded successfully', '');
                this.selectedExcel = null;
                this.hideDialogOfUploadExcel();
                this.projectJobSelectionService.addProjectSubject.next(this._localStorageService.getSelectedProjectObject());
              } else {
                if (response.errorCode === 'E5003') {
                  this.importFromExcelProjectValidationMessage = 'No data found';
                } else {
                  if (response.errorCode.length > 6) {
                    this.importFromExcelProjectValidationMessage = response.errorCode;
                  } else {
                    this.importFromExcelProjectValidationMessage = response.message;
                  }
                  // this.notificationService.error(response.errorCode, '');
                }
              }
            }
          }
        );
      }
      else {
        this.notificationService.error('Please select excel file', '');
      }
    } else {
      this.notificationService.error('Please upload 1 file', '');
    }
  }

  onSetValueOfForm() {
    if (this._localStorageService.getItem('selectedProject')) {
      this.checkProjectIsPosted = this._localStorageService.getItem('selectedProject');
    }
    this.loginUserId = this._localStorageService.getLoginUserId();
    this.getRegionList();
    this.getClientList();
    //this.getStateList();
    this.getIndustryTypeList();
    this.initializeCompanyForm();
    this.initializeAddNewProjectForm();
    if (this._localStorageService.getItem('addNewProjectFormValue')) {
      this.singleJobsiteAdded = false;
      this.subscription = this.postProjectService.addNewProject.subscribe(
        data => {
          this.initializeAddNewProjectForm();
          this.addNewProjectForm.setValue(this._localStorageService.getItem('addNewProjectFormValue'));
          let project = this._localStorageService.getItem('addProjectDetail');
          // this.uploadedFile.length = 0;
          this.uploadedFile = project.attachment;
          if (this._localStorageService.getItem('addNewProjectFormValue').bidDueDate) {
            this.addNewProjectForm.controls.bidDueDate.setValue(new Date(this._localStorageService.getItem('addNewProjectFormValue').bidDueDate));
          }
          if (this._localStorageService.getItem('addNewProjectFormValue').startDate) {
            this.addNewProjectForm.controls.startDate.setValue(new Date(this._localStorageService.getItem('addNewProjectFormValue').startDate));
          }
          if (this._localStorageService.getItem('addNewProjectFormValue').completionDate) {
            this.addNewProjectForm.controls.completionDate.setValue(new Date(this._localStorageService.getItem('addNewProjectFormValue').completionDate));
          }
          if (!this._localStorageService.getItem('addNewProjectFormValue').region?.id) {
            let region = {
              'id': 'static',
              'name': this._localStorageService.getItem('addNewProjectFormValue').region
            };
            this.addNewProjectForm.controls.region.setValue(region);
          }
          if (!this._localStorageService.getItem('addNewProjectFormValue').state?.id) {
            let state = {
              'id': 'static',
              'name': this._localStorageService.getItem('addNewProjectFormValue').state
            };
            this.addNewProjectForm.controls.state.setValue(state);
          }
        }
      );
    }
  }

  openClientDialog() {
    this.submittedCompany = false;
    this.companyDialog = true;
    this.initializeCompanyForm();
  }

  hideDialog() {
    this.companyDialog = false;
    this.submittedCompany = false;
    this.initializeCompanyForm();
  }

  onSubmit() {
    this.submittedCompany = true;
    if (!this.myCompanyForm.valid) {
      let controlName: string;
      for (controlName in this.myCompanyForm.controls) {
        this.myCompanyForm.controls[controlName].markAsDirty();
        this.myCompanyForm.controls[controlName].updateValueAndValidity();
      }
      this.submittedCompany = true;
      return false;
    }
    if (this.myCompanyForm.valid) {
      this._companyService.addCompany(JSON.stringify(this.myCompanyForm.value)).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('create.company.successMessage'), '');
            this.companyDialog = false;
            this.submittedCompany = false;
            this.getClientList();
            this.addNewProjectForm.controls.company.patchValue(data.data);
          }
          else {
            this.notificationService.error(data.message, '');
            this.companyDialog = false;
            this.submittedCompany = false;
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
          this.companyDialog = false;
          this.submittedCompany = false;
        }
      );
    }
  }

  initializeCompanyForm(): void {
    this.myCompanyForm = this._formBuilder.group({
      id: [],
      name: ['', [CustomValidator.required, Validators.maxLength(50)]],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      isEnable: 1
    });
  }


  filterClient(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.clients.length; i++) {
      let client = this.clients[i];
      if (client.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(client);
      }
    }
    this.filteredClients = filtered;
    let client = { 'id': 'buttonId' };
    this.filteredClients.push(client);
    this.filteredClientLength = this.filteredClients.length;

  }

  onSelectCompany(event) {
    if (event.id === 'buttonId') {
      this.addNewProjectForm.controls.company.setValue(null);
      this.companyDialog = true;
    }
  }

  filterRegion(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.region.length; i++) {
      let region = this.region[i];
      if (region.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(region);
      }
    }
    this.filteredRegion = filtered;
    this.filteredRegion = this.filteredRegion.sort();
  }

  // filterState(event) {
  //   let filtered: any[] = [];
  //   let query = event.query;
  //   for (let i = 0; i < this.state.length; i++) {
  //     let state = this.state[i];
  //     if (state.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
  //       filtered.push(state);
  //     }
  //   }
  //   this.filteredState = filtered;
  //   this.filteredState = this.filteredState.sort();

  // }

  filterIndustryType(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.industryType.length; i++) {
      let industryType = this.industryType[i];
      if (industryType.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(industryType);
      }
    }
    this.filteredIndustryType = filtered;
    this.filteredIndustryType = this.filteredIndustryType.sort();
  }

  selectFile(event) {
    console.log(event);
    this.fileLabel = event.target.files[0].name;
  }

  onFormChanged(addNewProjectForm: FormGroup) {
    this.isInvalidBidDueDate = false;
    this.isInvalidStartDate = false;
    this.isInvalidCompletionDate = false;
    let bidDueDate = addNewProjectForm.value.bidDueDate;;
    let startDate = addNewProjectForm.value.startDate;
    let completionDate = addNewProjectForm.value.completionDate;
    if (bidDueDate !== null && startDate !== null && completionDate !== null) {
      if (!(bidDueDate < startDate && bidDueDate < completionDate)) {
        this.isInvalidBidDueDate = true;
      }
      if (!(startDate > bidDueDate && startDate < completionDate)) {
        this.isInvalidStartDate = true;
      }
      if (!(bidDueDate < completionDate && startDate < completionDate)) {
        this.isInvalidCompletionDate = true;
      }
    }
  }

  private prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  private getClientList() {
    let datatableParam: DataTableParam = {
      offset: 0,
      size: 1000000,
      sortField: '',
      sortOrder: 1,
      searchText: '{"IS_ENABLE" : true}'
    }
    console.log(datatableParam);
    this.queryParam = this.prepareQueryParam(datatableParam);
    this.companyService.getCompanyList(this.queryParam).subscribe(
      data => {

        console.log(data);
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.clients = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  private getRegionList() {
    let datatableParam: DataTableParam = {
      offset: 0,
      size: 1000000,
      sortField: '',
      sortOrder: 1,
      searchText: '{"IS_ENABLE" : true}'
    }
    this.queryParam = this.prepareQueryParam(datatableParam);
    this.regionService.getRegionList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.region = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  // private getStateList() {
  //   let datatableParam: DataTableParam = {
  //     offset: 0,
  //     size: 1000000,
  //     sortField: '',
  //     sortOrder: 1,
  //     searchText: '{"ENABLE" : true}'
  //   }
  //   this.queryParam = this.prepareQueryParam(datatableParam);
  //   this.stateService.getStateList(this.queryParam).subscribe(
  //     data => {
  //       if (data.statusCode === '200') {
  //         if (data.message == 'OK') {
  //           this.state = data.data.result;
  //         }
  //       } else {
  //       }
  //     },
  //     error => {
  //     }
  //   );
  // }

  filterState(event): void {
    this.stateParams = {
      name: event.query
    };
    this.queryParam = this.prepareQueryParam(this.stateParams);
    this.filterLeftPanelService.getStateForPostProject(this.queryParam).subscribe(data => {
      console.log(data);
      this.filteredState = data.data;
    });
  }

  private getIndustryTypeList() {
    let datatableParam: DataTableParam = {
      offset: 0,
      size: 100000,
      sortField: '',
      sortOrder: 1,
      searchText: '{"IS_ENABLE" : true}'
    };
    this.queryParam = this.prepareQueryParam(datatableParam);
    this.industryTypeService.getIndustryTypeList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.industryType = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  private initializeAddNewProjectForm() {
    this.addNewProjectForm = this._formBuilder.group({
      id: [],
      createdBy: this.loginUserId,
      updatedBy: this.loginUserId,
      title: ['', [Validators.required, Validators.maxLength(50)]],
      company: [null],
      region: [null, Validators.required],
      state: [null, Validators.required],
      industry: [null, Validators.required],
      attachmentLink: ['', Validators.pattern(COMMON_CONSTANTS.ATTECHMENT_LINK)],
      bidDueDate: [null, Validators.required],
      completionDate: [null, Validators.required],
      startDate: [null, Validators.required],
      isNegotiable: [true, Validators.required],
      type: ['OPEN_MARKET_REQUEST', Validators.required]
    });
  }

  onSaveAddNewProjectForm() {
    if (!this.addNewProjectForm.get('title').valid) {
      this.addNewProjectForm.get('title').markAsTouched();
      this.addNewProjectForm.get('title').markAsDirty();
      return false;
    }
    else {
      if (this.setAddNewProjectObject()) {
        this.addProjectDetail.status = 'DRAFT';
        this.addProjectDetail.isSaveAsDraft = true;
        this._localStorageService.setItem('addNewProjectFormValue', this.addNewProjectForm.value, false);
        this._localStorageService.setItem('addProjectDetail', this.addProjectDetail, false);

        if (this.selectedFile.length !== 0) {
          if (this.checkFileName()) {
            this.uploadFile('onSaveAsDraft', '');
          }
          else {
            this.notificationService.error('You have selected same name files', '');
          }
        }
        else {
          this.onSaveAsDraft();
        }
      }
    }
  }

  onSaveAndNext() {
    this.submitted = true;
    if (!this.addNewProjectForm.valid) {
      CustomValidator.markFormGroupTouched(this.addNewProjectForm);
      this.submitted = false;
      return false;
    }
    else {
      if (this.setAddNewProjectObject()) {
        let message = '';
        if (this.reviewFormGroup && this.checkProjectIsValidForPost() && this.checkAllLineItemAssigned()) {
          this.addProjectDetail.status = 'POSTED';
          this.addProjectDetail.isSaveAsDraft = false;
          message = this.translator.instant('project.posted');
          if (this.selectedFile.length !== 0) {
            if (this.checkFileName()) {
              this.uploadFile('onNext', message);
            }
            else {
              this.notificationService.error('You have selected same name files', '');
            }
          }
          else {
            this.onNext(message);
          }
        }
        else {
          message = '';
          this.addProjectDetail.status = 'DRAFT';
          this.addProjectDetail.isSaveAsDraft = true;
          this._localStorageService.setItem('addNewProjectFormValue', this.addNewProjectForm.value, false);
          this._localStorageService.setItem('addProjectDetail', this.addProjectDetail, false);

          message = this.translator.instant('project.saved.as.draft');
          if (this.selectedFile.length !== 0) {
            if (this.checkFileName()) {
              this.uploadFile('onNext', message);
            }
            else {
              this.notificationService.error('You have selected same name files', '');
            }
          }
          else {
            this.onNext(message);
          }
        }
      }
    }
  }

  onSaveAsDraft() {    
    if (this.uploadableFile.length !== 0) {
      console.log(this.uploadedFile);
      this.addProjectDetail.attachment = this.uploadedFile;
      console.log(this.addProjectDetail);
      this.uploadableFile.forEach((file) => {
        this.addProjectDetail.attachment.push(file);
      });
      console.log(this.addProjectDetail.attachment);
    }
    else {
      this.addProjectDetail.attachment = this.uploadedFile;
    }
    if (!this.addProjectDetail.id) {
      console.log(this.addProjectDetail);
      this.postProjectService.addNewProjectDetail(this.addProjectDetail,
        this.translator.instant('project.saved.as.draft')).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('project.saved.as.draft'), '');
            this._localStorageService.setItem('addProjectDetail', data.data, false);
            this.selectedFile.length = 0;
            this.uploadableFile.length = 0;
            this.uploadedFile = data.data.attachment;
            //this.postProjectService.addNewProject.next(data);

            this.projectJobSelectionService.addProjectSubject.next(data.data);

            if (this.reviewFormGroup) {
              this._localStorageService.setItem('currentProjectStep', 3, false);
              this.postProjectService.currentPostProjectStep.next(3);
            }
            else {
              this._localStorageService.setItem('currentProjectStep', 1, false);
              this.postProjectService.currentPostProjectStep.next(1);
            }
          }
        });
    }
    else {
      console.log(this.addProjectDetail)
      this.postProjectService.updateProjectDetail(this.addProjectDetail,
        this.translator.instant('project.saved.as.draft')).subscribe(data => {
          console.log(data);
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('project.saved.as.draft'), '');
            console.log(this.addProjectDetail)
            this._localStorageService.setItem('addProjectDetail', data.data, false);
            this.selectedFile.length = 0;
            this.uploadableFile.length = 0;
            this.uploadedFile = data.data.attachment;
            //this.postProjectService.addNewProject.next(data);

            this.projectJobSelectionService.addProjectSubject.next(data.data);

            if (this.reviewFormGroup) {
              this._localStorageService.setItem('currentProjectStep', 3, false);
              this.postProjectService.currentPostProjectStep.next(3);
            }
            else {
              this._localStorageService.setItem('currentProjectStep', 1, false);
              this.postProjectService.currentPostProjectStep.next(1);
            }
          } else {
            this.notificationService.error(data.message, '')
          }
        });
    }
  }

  onNext(message) {
    if (this.uploadableFile.length !== 0) {
      this.addProjectDetail.attachment = this.uploadedFile;
      this.uploadableFile.forEach((file) => {
        this.addProjectDetail.attachment.push(file);
      });
    }
    else {
      this.addProjectDetail.attachment = this.uploadedFile;
    }
    if (!this.addProjectDetail.id) {
      this.postProjectService.addNewProjectDetail(this.addProjectDetail, message).subscribe(data => {
        if (data) {
          if (data.statusCode === '200' && data.message === 'OK') {
            if (message !== '') {
              this.notificationService.success(message, '');
            }

            this._localStorageService.setItem('addProjectDetail', data.data, false);
            this.selectedFile.length = 0;
            this.uploadableFile.length = 0;
            this.uploadedFile = data.data.attachment;
            this.postProjectService.addNewProject.next(data.data);

            this.projectJobSelectionService.addProjectSubject.next(data.data);

            if (this.reviewFormGroup) {
              this._localStorageService.setItem('currentProjectStep', 4, false);
              this.postProjectService.currentPostProjectStep.next(4);
              this.postProjectService.getSubcontractorSelectionList.next(1);
              this._localStorageService.removeItem('jobsiteDetail');
            }
            else {
              this._localStorageService.setItem('currentProjectStep', 2, false);
              this.postProjectService.currentPostProjectStep.next(2);
              if (data.data.status !== 'POSTED') {
                this.changeStatusOfJobsiteCopiedToDraft();
              }
            }
          }
          else {
            this.notificationService.error(data.message, '');
          }
        }
      });
    }
    else {
      this.postProjectService.updateProjectDetail(this.addProjectDetail, message).subscribe(data => {
        if (data) {
          if (data.statusCode === '200' && data.message === 'OK') {
            if (message !== '') {
              this.notificationService.success(message, '');
            }

            this._localStorageService.setItem('addProjectDetail', data.data, false);
            this.selectedFile.length = 0;
            this.uploadableFile.length = 0;
            this.uploadedFile = data.data.attachment;
            this.postProjectService.addNewProject.next(data.data);

            this.projectJobSelectionService.addProjectSubject.next(data.data);

            if (this.reviewFormGroup) {
              this._localStorageService.setItem('currentProjectStep', 4, false);
              this.postProjectService.currentPostProjectStep.next(4);
              this.postProjectService.getSubcontractorSelectionList.next(1);
              this._localStorageService.removeItem('jobsiteDetail');
            }
            else {
              this._localStorageService.setItem('currentProjectStep', 2, false);
              this.postProjectService.currentPostProjectStep.next(2);
              if (data.data.status !== 'POSTED') {
                this.changeStatusOfJobsiteCopiedToDraft();
              }
            }
          }
          else {
            // if (this._localStorageService.getItem('currentProjectStep') !== 3) {
            this.notificationService.error(data.message, '');
            // }
          }
        }
      });
    }

    console.log('this.singleJobsiteToBeAdded =>', this.singleJobsiteToBeAdded);
    
    if(!this._localStorageService.getItem('isEditMode') && this.singleJobsiteToBeAdded ) {
      this.onAddNewJobsite();
    }

  }

  onAddNewJobsite(): void {
    if (this._localStorageService.getItem('milestoneScreen')) {
      this._localStorageService.removeItem('milestoneScreen');
    }
    this._localStorageService.removeItem('addLineItemScreen');
    this._localStorageService.setItem('addJobsiteScreen', 'addJobsite', false);
    this.postProjectService.jobsiteScreenChange.next('addJobsite');
  }

  setAddNewProjectObject() {
    let selectedClient = this.addNewProjectForm.get('company').value;
    let selectedIndustry = this.addNewProjectForm.get('industry').value;
    let selectedRegion = this.addNewProjectForm.get('region').value;
    let selectedState = this.addNewProjectForm.get('state').value;

    if (!this.isInvalidBidDueDate && !this.isInvalidStartDate && !this.isInvalidCompletionDate) {

      if (this._localStorageService.getItem('addProjectDetail')) {
        this.addProjectDetail = this._localStorageService.getItem('addProjectDetail');
        this.addProjectDetail.updatedBy = this.loginUserId;
      }
      else {
        this.addProjectDetail.id = this.addNewProjectForm.get('id').value;
        this.addProjectDetail.jobsite = [];
        this.addProjectDetail.createdBy = this.addNewProjectForm.get('createdBy').value;
        this.addProjectDetail.updatedBy = this.addNewProjectForm.get('updatedBy').value;
      }

      if (selectedIndustry) {
        this.addProjectDetail.industry = selectedIndustry;
      }
      else {
        this.addProjectDetail.industry = null;
      }

      if (selectedRegion) {
        this.addProjectDetail.region = selectedRegion.name;
      }
      else {
        this.addProjectDetail.region = null;
      }

      if (selectedState) {
        this.addProjectDetail.state = selectedState.name;
      }
      else {
        this.addProjectDetail.state = null;
      }

      this.addProjectDetail.title = this.addNewProjectForm.get('title').value;
      this.addProjectDetail.company = selectedClient;
      this.bidDueDate = this.addNewProjectForm.get('bidDueDate').value;
      this.addProjectDetail.bidDueDate = this.bidDueDate;
      this.startDate = this.addNewProjectForm.get('startDate').value;
      this.addProjectDetail.startDate = this.startDate;
      this.completionDate = this.addNewProjectForm.get('completionDate').value;
      this.addProjectDetail.completionDate = this.completionDate;
      this.addProjectDetail.isNegotiable = this.addNewProjectForm.get('isNegotiable').value;
      this.addProjectDetail.type = this.addNewProjectForm.get('type').value;
      this.addProjectDetail.attachmentLink = this.addNewProjectForm.get('attachmentLink').value;
      this.addProjectDetail.isSaveAsDraft = true;

      let loggedInUserObject = this._localStorageService.getLoginUserObject();

      if (loggedInUserObject.roles[0].roleName === 'SUPERVISOR') {
        this.addProjectDetail.supervisor = this._localStorageService.getLoginUserObject();
        this.addProjectDetail.user = this._localStorageService.getItem('clientOfLoggedInSupervisor');
      }
      else {
        this.addProjectDetail.user = this._localStorageService.getLoginUserObject();
      }

      return true;
    }
    else {
      this.dateErrorMessage();
      return false;
    }
  }

  onCancel() {
    this.onRemoveLocalStorage();
    this.router.navigate([PATH_CONSTANTS.CLIENT_DASHBOARD]);
  }

  onRemoveLocalStorage() {
    this._localStorageService.removeItem('addNewProjectFormValue');
    this._localStorageService.removeItem('selectedJobsiteOfDropdown');
    this._localStorageService.removeItem('Data0');
    this._localStorageService.removeItem('addProjectDetail');
    this._localStorageService.removeItem('jobsiteScreen');
    this._localStorageService.removeItem('currentProjectStep');
    this._localStorageService.removeItem('unselectedLineItem');
    this._localStorageService.removeItem('isEditMode');
  }

  dateErrorMessage() {
    if (this.isInvalidBidDueDate) {
      this.notificationService.error('Invalid bid due date', '');
    }
    if (this.isInvalidStartDate) {
      this.notificationService.error('Invalid start date', '');
    }
    if (this.isInvalidCompletionDate) {
      this.notificationService.error('Invalid completion date', '');
    }
  }

  openWarningDialog() {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Do you want to cancel the post project process?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.onCancel();
      }
    });
  }

  groupByFileName(data) {
    let groupByStatusProject = [];
    let count = 0;
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.name,
        null,
        null,
        () => new ReplaySubject()
      ),
      concatMap(
        object => object.pipe(
          toArray(),
          map(obj =>
            ({ key: object.key, value: obj })
          ))
      )
    );

    result.subscribe(x => {
      groupByStatusProject.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();

    groupByStatusProject.forEach(element => {
      if (element.value.length > 1) {
        count++;
      }
    });

    if (count > 0) {
      return false;
    }
    else {
      return true;
    }
  }

  onFileSelect(event) {

    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('Max file size is 100 MB'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.pdf.doc.upload'), '');
      }
      event.rejectedFiles = [];
    }

    let validFiles: File[] = [];
    this.files.push(...event.addedFiles);
    let chekcLength = this.uploadedFile.length + this.files.length + this.selectedFile.length;
    if (chekcLength <= 10) {
      this.files.forEach((file, index) => {
        if (file.size > 100000000) {
          if (event.rejectedFiles[0].reason === 'size') {
            this.notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
          } else {
            this.notificationService.error(this.translator.instant('image.pdf.upload'), '');
          }

        }
        else {
          validFiles.push(file);
        }
      });
      this.files = [];
      if (this.selectedFile.length === 0) {
        this.selectedFile = validFiles;
      }
      else {
        validFiles.forEach(file => {
          this.selectedFile.push(file);
        });
      }

      let fileNameChecking = [];
      if (this.uploadedFile.length > 0) {
        this.selectedFile.forEach(element1 => {
          fileNameChecking.push(element1);
        });
        this.uploadedFile.forEach(element => {
          let file = {
            'createdBy': element.createdBy,
            'createdDate': element.createdDate,
            'name': element.filename,
            'id': element.id,
            'path': element.path,
            'updatedBy': element.updatedBy,
            'updatedDate': element.updatedDate,
          }
          fileNameChecking.push(file);
        });
      }
      else {
        this.selectedFile.forEach(element1 => {
          fileNameChecking.push(element1);
        });
      }
      console.log(fileNameChecking);
      if (!this.groupByFileName(fileNameChecking)) {
        this.notificationService.error('You have selected same name files', '');
      }
    }
    else {
      this.notificationService.error('Maximum number of file should be 10', '');
      this.files.splice(0, this.files.length);
    }
    console.log(this.selectedFile);
  }

  checkFileName() {
    let fileNameChecking = [];
    if (this.uploadedFile.length > 0) {
      this.selectedFile.forEach(element1 => {
        fileNameChecking.push(element1);
      });
      this.uploadedFile.forEach(element => {
        let file = {
          'createdBy': element.createdBy,
          'createdDate': element.createdDate,
          'name': element.filename,
          'id': element.id,
          'path': element.path,
          'updatedBy': element.updatedBy,
          'updatedDate': element.updatedDate,
        }
        fileNameChecking.push(file);
      });
    }
    else {
      this.selectedFile.forEach(element1 => {
        fileNameChecking.push(element1);
      });
    }

    return this.groupByFileName(fileNameChecking);
  }

  onRemoveFile(event) {
    this.files.splice(this.files.indexOf(event), 1);
    this.selectedFile = this.files;
    console.log(this.selectedFile);
  }

  uploadFile(methodName, message) {
    this.uploadableFile.length = 0;
    console.log(this.selectedFile);
    const uploadFileData = new FormData();
    this.selectedFile.forEach((file) => {
      uploadFileData.append('file', file);
    });

    this._fileService.uploadMultipleFile(uploadFileData).subscribe(
      event => {
        if (event instanceof HttpResponse) {
          this.logoBody = event.body;
          this.logoData = this.logoBody.data;
          if (this.logoData.length === this.selectedFile.length) {
            this.selectedFile.forEach((element, i) => {
              let myFile = {
                'id': '',
                'createdBy': this.loginUserId,
                'updatedBy': this.loginUserId,
                'filename': element.name,
                'path': this.logoData[i]
              }
              this.uploadableFile.push(myFile);
            });
          }
          if ('onSaveAsDraft' === methodName) {
            this.onSaveAsDraft();
          }
          if ('onNext' === methodName) {
            this.onNext(message);
          }
        }
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
        console.log(error);
      });
  }

  openWarnigDialog(name, index1, file) {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Are you sure you want to delete?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        let remainingFile: File[] = [];
        this.selectedFile.forEach((file, index) => {
          if (index !== index1) {
            remainingFile.push(file);
          }
        });
        this.selectedFile.length = 0;
        this.selectedFile = remainingFile;
      }
    });
  }

  openWarnigDialogForUploaded(name, id) {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Are you sure you want to delete ' + name + '?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteAttachment(id);
      }
    });
  }

  deleteAttachment(id) {
    let project = this._localStorageService.getItem('addProjectDetail');
    this.tempAttachment = project.attachment;
    let remainingAttachment: ProjectAttachmentDTO[] = [];
    this.tempAttachment.forEach((attachment, index) => {
      if (attachment.id !== id) {
        remainingAttachment.push(attachment);
      }
    });

    this.tempSelectedFile = [];
    this.selectedFile.forEach((file) => {
      this.tempSelectedFile.push(file);
    });

    this.uploadedFile = remainingAttachment;
    project.attachment = this.uploadedFile;
    console.log(this.tempSelectedFile);

    this.postProjectService.deleteAttachment(id).subscribe(
      data1 => {
        if (data1) {
          console.log(project);
          this._localStorageService.setItem('addProjectDetail', project);
          //Line commented during UI.
          // this.postProjectService.addNewProject.next(project);
          if (!this.reviewFormGroup) {
            this._localStorageService.setItem('currentProjectStep', 1, false);
            this.postProjectService.currentPostProjectStep.next(1);
          }
          else {
            this._localStorageService.setItem('currentProjectStep', 3, false);
            this.postProjectService.currentPostProjectStep.next(3);
          }
          this.projectJobSelectionService.addProjectSubject.next(project);
          this.uploadedFile = remainingAttachment;
          this.selectedFile = [];
          this.tempSelectedFile.forEach((file) => {
            this.selectedFile.push(file);
          });
        }
      });
  }

  checkProjectIsValidForPost() {
    let jobsites = this._localStorageService.getItem('jobsiteDetail');
    if (jobsites) {
      if (jobsites.length !== 0) {
        let hasCost = true;
        jobsites.forEach((jobsite) => {
          if (jobsite.cost === 0) {
            hasCost = false;
          }
        });
        if (hasCost) {
          return true;
        }
        else {
          return false;
        }
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }


  checkAllLineItemAssigned() {
    let jobsites = this._localStorageService.getItem('jobsiteDetail');
    let count = 0;
    let countLineItem = 0;
    jobsites.forEach(jobsite => {
      countLineItem += jobsite.lineItem.length;
      if (jobsite.paymentMileStone.length !== 0) {
        jobsite.paymentMileStone.forEach(element => {
          count += element.lineItem.length;
        });
      }
    });

    if (countLineItem === count) {
      return true;
    }
    else {
      return false;
    }
  }

  changeStatusOfJobsiteCopiedToDraft() {
    let project = this._localStorageService.getItem('addProjectDetail');
    project.jobsite.forEach(element => {
      element.status = JobsiteStatus.DRAFT;
      console.log(element);
      this.jobsiteService.editJobsiteDetail(element, '').subscribe(data => {
        // if (data.statusCode === '200' && data.message === 'OK') {

        // }
        // else {
        //   this.notificationService.error(data.message, '');
        // }
      });
    });
  }

  download(fileName): void {
    this._fileService
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

}
