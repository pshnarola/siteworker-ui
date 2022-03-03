import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Table } from 'primeng/table';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { QuestionAnswerService } from 'src/app/service/client-services/question-answer/question-answer.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobsiteDetail } from '../Vos/jobsitemodel';
import { ProjectDetail } from '../Vos/projectDetailmodel';
import { QuestionAnswerAttachment } from '../Vos/questionAnswerAttachment';

@Component({
  selector: 'app-question-answer',
  templateUrl: './question-answer.component.html',
  styleUrls: ['./question-answer.component.css']
})
export class QuestionAnswerComponent implements OnInit {

  datatableParam: DataTableParam;
  filterMap = new Map();
  queryParam;
  offset: Number = 0;
  totalRecords: Number = 0;

  selectedProject: ProjectDetail = null;
  selectedJobsite: JobsiteDetail = null;
  subscription = new Subscription();
  isSelectedProject = false;
  isSelectedJobsite = false;
  @ViewChild('dt') table: Table;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  columns = [];
  loading = false;
  data = [];
  questionAnswerForm: FormGroup;
  loggedInUserId: string;
  selectedFile: File[] = [];
  files: File[] = [];
  message: string;
  isInvalidFiles = false;
  sortField = 'CREATED_DATE';
  sortOrder = -1;
  globalFilter;
  IsLazy = false;
  uploadedFile: QuestionAnswerAttachment[] = [];
  uploadableFile: any[] = [];
  logoBody;
  logoData;
  questionAnswerFile: any;
  excelFile: File[] = [];
  selectedExcel: File;
  excelFileToShow: File[] = [];
  sorting = false;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;


  constructor(
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private confirmDialogService: ConfirmDialogueService,
    private _localStorageService: LocalStorageService,
    private translator: TranslateService,
    private _formBuilder: FormBuilder,
    private router: Router,
    private notificationService: UINotificationService,
    private questionAnswerService: QuestionAnswerService,
    private _fileService: FileDownloadService) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.setProject();
    this.setJobsite();
    this.setColumnOfTable();
    this.initializeQuestionAnswerForm(this.data);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setProject() {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      const project = this._localStorageService.getSelectedProjectObject();
      if (project.id === 'pid') {
        this.selectedJobsite = null;
        this.isSelectedJobsite = false;
        this.isSelectedProject = false;
        this.selectedProject = null;
      }
      else {
        this.selectedJobsite = null;
        this.isSelectedJobsite = false;
        this.selectedProject = project;
        if (this.selectedProject !== null) {
          this.isSelectedProject = true;
        }
        this.selectedFile.length = 0;
        this.uploadableFile.length = 0;
        this.onProjectChange();
        this.getAttachmentList();
      }
    }));
  }

  private setJobsite() {
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(data => {
      const jobsite = this._localStorageService.getSelectedJobsiteObject();
      if (jobsite) {
        if (jobsite.id === 'jid') {
          this.selectedJobsite = null;
          this.isSelectedJobsite = false;
          this.onProjectChange();
        }
        else {
          this.selectedJobsite = jobsite;
          if (this.selectedJobsite !== null) {
            this.isSelectedJobsite = true;
          }
          if (jobsite.id !== 'jid') {
            this.onProjectChange();
          }
          else {
            this.selectedJobsite = null;
            this.onProjectChange();
          }
        }
      }
    }));
  }

  selectFile(event) {

    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.pdf.upload'), '');
      }
      event.rejectedFiles = [];
    }

    const validFiles: File[] = [];
    this.files.push(...event.addedFiles);
    const chekcLength = this.uploadedFile.length + this.files.length + this.selectedFile.length;
    if (chekcLength <= 10) {
      this.files.forEach((file) => {
        if (file.size > 10000000) {
          this.notificationService.error('Size of ' + file.name + ' cannot be more than 10MB.', '');
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

      const fileNameChecking = [];
      if (this.uploadedFile.length > 0) {
        this.selectedFile.forEach(element1 => {
          fileNameChecking.push(element1);
        });
        this.uploadedFile.forEach(element => {
          const file = {
            createdBy: element.createdBy,
            createdDate: element.createdDate,
            name: element.fileName,
            id: element.id,
            path: element.path,
            updatedBy: element.updatedBy,
            updatedDate: element.updatedDate,
          };
          fileNameChecking.push(file);
        });
      }
      else {
        this.selectedFile.forEach(element1 => {
          fileNameChecking.push(element1);
        });
      }
      if (!this.groupByFileName(fileNameChecking)) {
        this.notificationService.error('You have selected same name files', '');
      }

    }
    else {
      this.notificationService.error('Maximum number of file should be 10.', '');
      this.files.splice(0, this.files.length);
    }
  }

  checkFileName() {
    const fileNameChecking = [];
    if (this.uploadedFile.length > 0) {
      this.selectedFile.forEach(element1 => {
        fileNameChecking.push(element1);
      });
      this.uploadedFile.forEach(element => {
        const file = {
          createdBy: element.createdBy,
          createdDate: element.createdDate,
          name: element.fileName,
          id: element.id,
          path: element.path,
          updatedBy: element.updatedBy,
          updatedDate: element.updatedDate,
        };
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


  groupByFileName(data) {
    const groupByStatusProject = [];
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

  openWarnigDialog(name, index1, file) {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Are you sure you want to delete?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        const remainingFile: File[] = [];
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
      message: 'Are you sure you want to delete?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.deleteAttachment(id);
      }
    });
  }

  deleteAttachment(id) {
    this.questionAnswerService.deleteAttachemnt(id).subscribe(
      data => {
        if (data) {
          this.getAttachmentList();
        }
      }
    );
  }

  onSelect(event) {
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === 'size') {
        this.notificationService.error(this.translator.instant('max.file.size.10.mb'), '');
      } else {
        this.notificationService.error(this.translator.instant('image.only.excel.upload'), '');
      }
      event.rejectedFiles = [];
    }

    this.excelFile.push(...event.addedFiles);
    if (this.excelFile[1] != null) {
      this.onRemove(this.excelFile[0]);
    }
    let ext = this.excelFile[0].name.split('.').pop();
    if (ext === 'xlsx') {
      this.excelFileToShow = [];
      this.selectedExcel = this.excelFile[0];
      this.excelFileToShow.push(this.selectedExcel);
    }
    else {
      this.notificationService.error('please select appropriate file', '');
    }
    this.excelFile = [];
  }

  onRemove(event) {
    this.excelFile.splice(this.excelFile.indexOf(event), 1);
  }

  openWarnigDialogForExcel(file) {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Are you sure you want to delete?',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.selectedExcel = null;
        this.excelFileToShow.length = 0;
      }
    });
  }

  customSort(event) {
    this.sorting = true;
    this.datatableParam = {
      offset: 0,
      size: 1000000,
      sortField: event.sortField ? event.sortField : this.sortField,
      sortOrder: event.sortOrder === -1 ? 0 : 1,
      searchText: this.setFilterToGetByClient()
    };
    this.loadQuestionAnswerList();
  }

  uploadExcel() {
    if (this.selectedExcel) {
      const uploadImageData = new FormData();
      uploadImageData.append('file', this.selectedExcel);
      this.questionAnswerService.uploadExcel(uploadImageData, this.loggedInUserId).subscribe(
        data => {
          if (data instanceof HttpResponse) {
            const response: any = data.body;
            if (response.statusCode === '200' && response.message === 'OK') {
              this.notificationService.success('Excel file uploaded successfully', '');
              this.selectedExcel = null;
              this.excelFileToShow.length = 0;
            }
            else {
              this.notificationService.error(response.message, '');
            }
          }
        },
        error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
        });
    }
    else {
      this.notificationService.error('Please select excel file', '');
    }
  }


  uploadFiles() {

    if (this.selectedFile.length !== 0) {
      if (this.checkFileName()) {
        this.uploadableFile.length = 0;
        const project = this.selectedProject;
        project.attachment = [];

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
                  const myFile = {
                    id: '',
                    createdBy: this.loggedInUserId,
                    updatedBy: this.loggedInUserId,
                    fileName: element.name,
                    project: project,
                    path: this.logoData[i]
                  };
                  this.uploadableFile.push(myFile);
                });
              }
              this.uploadAttachment();
            }
          },
          (error) => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          });
      }
      else {
        this.notificationService.error('You have selected same name files', '');
      }
    }
    else {
      this.notificationService.error('Please select at least one new document', '');
    }

  }

  uploadAttachment() {
    const attachmentList = {
      attachments: this.uploadableFile
    };
    this.questionAnswerService.uploadAttachmentList(attachmentList).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.notificationService.success(this.translator.instant('attachment.uploaded.successfully'), '');
          this.selectedFile.length = 0;
          this.uploadableFile.length = 0;
          this.getAttachmentList();
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


  getAttachmentList() {
    const datatableParam = {
      offset: 0,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.setFilterToGetByClient()
    };
    const queryParam = this.prepareQueryParam(datatableParam);
    this.questionAnswerService.getAttachmentList(queryParam).subscribe(
      data => {
        this.uploadedFile = data.data.result;
      }
    );
  }

  downloadExcel() {
    const datatableParam = {
      offset: 0,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.setFilterToGetByClient()
    };
    const queryParam = this.prepareQueryParam(datatableParam);
    this.questionAnswerService.exportToExcel(queryParam).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/vnd.ms-excel' });
        const fileName = 'question-answer';
        saveAs(blob, fileName);
      },
      error => {
      }
    );
  }

  private setColumnOfTable() {
    this.columns = [
      { label: this.translator.instant('subcontractor'), value: 'SUB_CONTRACTOR_NAME', sortable: true, isHidden: false },
      { label: this.translator.instant('jobsite'), value: 'JOB_SITE_TITLE', sortable: true, isHidden: false },
      { label: this.translator.instant('posted.date'), value: 'CREATED_DATE', sortable: true, isHidden: false },
      { label: this.translator.instant('question'), value: 'QUESTION', sortable: true, isHidden: false },
      { label: this.translator.instant('submit.answer'), value: 'submit_answer', sortable: false, isHidden: false }
    ];
  }

  private initializeQuestionAnswerForm(data) {
    const questionAndAnswerList = new FormArray([]);
    for (let i = 0; i < data.length; i++) {
      questionAndAnswerList.push(this._formBuilder.group({
        id: data[i].id,
        createdBy: data[i].createdBy,
        updatedBy: this.loggedInUserId,
        jobSite: data[i].jobSite,
        subcontractor: data[i].user,
        postedDate: data[i].createdDate,
        question: data[i].question,
        answer: [data[i].answer, Validators.maxLength(500)],
        user: data[i].user
      }));
    }

    this.questionAnswerForm = this._formBuilder.group({
      questionAndAnswerList
    });
  }

  submitAnswer() {
    if (!this.questionAnswerForm.valid) {
      CustomValidator.markFormGroupTouched(this.questionAnswerForm);
      return false;
    }

    if (this.questionAnswerForm.valid) {
      const questionAnwerDetails: any[] = [];
      const project = this.selectedProject;
      project.attachment = [];
      this.questionAnswerForm.value.questionAndAnswerList.forEach(element => {
        if (element.answer !== '') {
          const QuestionAnswerDetail = {
            id: element.id,
            createdBy: element.createdBy,
            updatedBy: element.updatedBy,
            repliedBy: this._localStorageService.getLoginUserObject(),
            question: element.question,
            answer: element.answer,
            project: project,
            jobSite: element.jobSite,
            user: element.user
          };
          questionAnwerDetails.push(QuestionAnswerDetail);
        }
      });
      const answerDetail = {
        questionAndAnswerList: questionAnwerDetails
      };
      this.questionAnswerService.submitAnswerOfQuestion(answerDetail).subscribe(
        data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('answer.submited.successfully'), '');
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
  }

  setFilterToGetByClient() {
    this.filterMap.clear();
    this.filterMap.set('PROJECT_ID', this.selectedProject.id);
    if (this._localStorageService.getSelectedJobsiteObject()) {
      const jobsite = this._localStorageService.getSelectedJobsiteObject();
      if (jobsite && jobsite.id !== 'jid') {
        this.filterMap.set('JOBSITE_ID', jobsite.id);
      }
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    const globalFilter = JSON.stringify(jsonObject);
    return globalFilter;
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  onProjectChange() {
    this.IsLazy = false;
    this.datatableParam = {
      offset: 0,
      size: 1000000,
      sortField: this.sortField ? this.sortField.toUpperCase() : 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.setFilterToGetByClient()
    };
    this.loadQuestionAnswerList();
  }


  loadQuestionAnswerList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.questionAnswerService.getQuestionAnswerList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            this.data = data.data.result;
            this.data.map(e => {

            });
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
            this.initializeQuestionAnswerForm(this.data);
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

  openDialog() {
    let options = null;
    options = {
      title: 'Warning',
      message: 'Please select at least one project',
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.router.navigate(['../']);
      }
      else {
        this.router.navigate(['../']);
      }
    });
  }

  redirectToSubcontractor(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_SUBCONTRACTOR_PROFILE + '?user=' + id);
  }

  redirectToJobsite(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_JOBSITE + '?jobsite=' + id);
  }

}
