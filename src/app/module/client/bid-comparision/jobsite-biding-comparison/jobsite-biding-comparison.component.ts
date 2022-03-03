import { HttpResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { ChatMessageServiceService } from 'src/app/service/chat-message-service.service';
import { ProjectComparisonService } from 'src/app/service/client-services/bid-comparison/project-comparison.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ChatMessageAttachmentDTO } from 'src/app/shared/chat-message-attachment-dto';
import { ChatMessageDTO } from 'src/app/shared/chat-message-dto';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobsiteDetail } from '../../Vos/jobsitemodel';
import { ProjectDetail } from '../../Vos/projectDetailmodel';

@Component({
  selector: 'app-jobsite-biding-comparison',
  templateUrl: './jobsite-biding-comparison.component.html',
  styleUrls: ['./jobsite-biding-comparison.component.css']
})
export class JobsiteBidingComparisonComponent implements OnInit {

  @ViewChild('dt') table: Table;
  subscription: Subscription;
  isLineItemMenuOpen = 'openJobsite';
  selectedProject: ProjectDetail = null;
  isSelectedProject = false;
  selectedJobsite: JobsiteDetail;
  jobsite: JobsiteDetail[];
  filteredJobsite: JobsiteDetail[];
  loading = false;
  offset = 0;
  totalRecords = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  subcontractors = [];
  selectedSubcontractor = [];

  subcontractorColumns = [
    { label: this.translator.instant('sortlist'), value: 'sortlist', sortable: false },
    { label: this.translator.instant('subcontractor'), value: 'SUB_CONTRACTOR_NAME', sortable: true },
    { label: this.translator.instant('bid.amount'), value: 'SUB_CONTRACTOR_COST', sortable: true }
  ];

  columns = [
    { label: this.translator.instant('jobsite.title'), value: 'title', sortable: true },
    { label: this.translator.instant('description'), value: 'description', sortable: true },
    { label: this.translator.instant('bid.amount'), value: 'subContractorCost', sortable: true },

  ];

  jobsiteDialog = false;
  dialogSubcontractor: any;
  subcontractorJobsite: any[] = [];

  //loading data..
  filterMap = new Map();
  dataTableParam: DataTableParam;
  globalFilter;
  queryParam;
  sortField;
  sortOrder;

  //send message to subcontractor....
  myChatForm: FormGroup;
  FileName: any;
  files: File[] = [];
  logoBody: any;
  logoData: any;
  dialog = false;
  dialogHeader = this.translator.instant('send.message');
  attachment: ChatMessageAttachmentDTO;
  attachmentList: ChatMessageAttachmentDTO[] = [];
  submitted = false;
  chatMessageDTO = new ChatMessageDTO();
  subcontractor: any;
  selectedSubcontractorDetail: any[] = [];

  constructor(
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private _localStorageService: LocalStorageService,
    private translator: TranslateService,
    private projectComparisonService: ProjectComparisonService,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private confirmDialogService: ConfirmDialogueService,
    private chatMessageService: ChatMessageServiceService,
    private _fileService: FileDownloadService,
    private router: Router) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.setProject();
    if (this._localStorageService.getItem('selectedSubcontractorForJobsite')) {
      this.selectedSubcontractorDetail = this._localStorageService.getItem('selectedSubcontractorDetail');
      this.selectedSubcontractor = this._localStorageService.getItem('selectedSubcontractorForJobsite');
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  openJobsiteDialog(subcontractor): void {
    this.subcontractorJobsite = [];
    this.dialogSubcontractor = subcontractor;
    let id = subcontractor.jobsiteBidDetailDTO.subContractor.id;
    this.selectedSubcontractorDetail.forEach(element => {
      if (element.subcontractorId === id) {
        element.jobsiteBidDetail.forEach(element => {
          let temp = {
            'title': element.jobSiteDetail.title,
            'description': element.jobSiteDetail.description,
            'subContractorCost': element.subContractorCost,
            'fullDetail': element
          }
          this.subcontractorJobsite.push(temp);
        });
      }
    });
    this.jobsiteDialog = true;
  }

  private setProject() {
    this.subscription = this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      let project = this._localStorageService.getSelectedProjectObject();
      if (project.id === 'pid') {
        this.isSelectedProject = false;
        this.selectedProject = null;
      }
      else {
        this.isSelectedProject = true;
        this.selectedProject = project;
        let jobsite = this.selectedProject.jobsite;
        if (jobsite) {
          this.jobsite = jobsite;
          for (let i = 0; i < jobsite.length; i++) {
            if (jobsite[i].id === 'jid') {
              this.jobsite.splice(i, 1);
            }
          }
        }
      }
      this.selectedJobsite = this.jobsite[0];
      this.selectedSubcontractorDetail = [];
      this.selectedSubcontractor = [];
      let bidDTO = this._localStorageService.getItem('selectedSubcontractorForJobsite');
      if (bidDTO !== undefined && bidDTO?.length !== 0) {
        this.selectedSubcontractor = this._localStorageService.getItem('selectedSubcontractorForJobsite');
        this.selectedSubcontractorDetail = this._localStorageService.getItem('selectedSubcontractorDetail');
      }
      if (bidDTO !== undefined && bidDTO?.length !== 0) {
        if (bidDTO[0].jobsiteBidDetailDTO.projectDetail.id !== this.selectedProject.id) {
          this._localStorageService.removeItem('selectedSubcontractorDetail');
          this._localStorageService.removeItem('selectedSubcontractorForJobsite');
          this.selectedSubcontractorDetail = [];
          this.selectedSubcontractor = [];
        }
      }

      this.onJobsiteChange();
    });
  }

  filterJobsite(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.jobsite.length; i++) {
      let jobsite = this.jobsite[i];
      if (jobsite.title.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(jobsite);
      }
    }
    this.filteredJobsite = filtered;
    this.filteredJobsite = this.filteredJobsite.sort();
  }

  isSubcontractorSelected(id): boolean {
    let count = 0;
    let count1 = 0;
    let selected = this._localStorageService.getItem('selectedSubcontractorDetail');
    let selectedJobsite = this.selectedJobsite;
    let selectedSubcontractor = this._localStorageService.getItem('selectedSubcontractorForJobsite');

    if (selected) {
      selected.forEach(element => {
        if (element.subcontractorId === id) {
          element.jobsites.forEach(element => {
            if (element.id === selectedJobsite.id) {
              count++;
            }
          });
        }
      });
    }

    if (selectedSubcontractor) {
      selectedSubcontractor.forEach(subcontractor => {
        if (subcontractor.jobsiteBidDetailDTO.subContractor.id === id) {
          count1++;
        }
      });
    }

    if (count > 0 && count1 > 0) {
      return true;
    }
    else {
      return false;
    }

  }

  onSelectJobsite(event) {
    this.onJobsiteChange();
  }

  hasSortlistedSubcontractor() {
    let count = 0;
    let selectedJobsite = this.selectedJobsite;
    let selectedSubcontractorDetail = this._localStorageService.getItem('selectedSubcontractorDetail');
    if (selectedSubcontractorDetail !== undefined) {
      selectedSubcontractorDetail.forEach(element => {
        element.jobsites.forEach(jobsite => {
          if (jobsite.id === selectedJobsite.id) {
            count++;
          }
        });
      });
    }

    if (count > 0) {
      return true;
    }
    else {
      return false;
    }
  }

  onSortListSubcontractor(subcontractor) {
    let count = 0;
    let matchedSubcontractorIndex = 0;
    let selectedSubcontractor = this._localStorageService.getItem('selectedSubcontractorDetail');
    if (selectedSubcontractor) {
      selectedSubcontractor.forEach((element, index) => {
        element.jobsites.forEach(jobsite => {
          if (jobsite.id === subcontractor.jobsiteBidDetailDTO.jobSiteDetail.id) {
            count++;
            matchedSubcontractorIndex = index;
          }
        });
      });

      if (count > 0) {
        let bidDTO = this._localStorageService.getItem('selectedSubcontractorForJobsite');
        this.openJobsiteErrorDialog(bidDTO[matchedSubcontractorIndex], subcontractor);
      }
      else {
        this.onSelectSubcontractor(subcontractor);
      }
    }
    else {
      this.onSelectSubcontractor(subcontractor);
    }
  }

  openJobsiteErrorDialog(subcontractor, subcontractor2) {
    let options = null;
    const message = "Are you sure you want to remove selected subcontractor?";
    options = {
      title: this.translator.instant('warning'),
      message: message,
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.removeSubcontractorForSingleJobsite(subcontractor, subcontractor2.jobsiteBidDetailDTO.jobSiteDetail);
        this.onSelectSubcontractor(subcontractor2);
      }
      else {
        this.onJobsiteChange();
      }
    });
  }

  onSelectSubcontractor(subcontractor): void {
    let count = 0;
    let count1 = 0;
    this.selectedSubcontractorDetail.forEach(element => {
      if (element.subcontractorId === subcontractor.jobsiteBidDetailDTO.subContractor.id) {
        count++;
        element.jobsites.push(subcontractor.jobsiteBidDetailDTO.jobSiteDetail);
        element.jobsiteBidDetail.push(subcontractor.jobsiteBidDetailDTO);
        element.fullDetail.push(subcontractor);
      }
    });

    if (count === 0) {
      let subcontractorDetail = {
        subcontractorId: subcontractor.jobsiteBidDetailDTO.subContractor.id,
        jobsites: [subcontractor.jobsiteBidDetailDTO.jobSiteDetail],
        jobsiteBidDetail: [subcontractor.jobsiteBidDetailDTO],
        fullDetail: [subcontractor]
      }
      if (this.selectedSubcontractorDetail.length < 10) {
        this.selectedSubcontractorDetail.push(subcontractorDetail);
      }
    }

    this.selectedSubcontractor.forEach(element => {
      if (element.jobsiteBidDetailDTO.subContractor.id === subcontractor.jobsiteBidDetailDTO.subContractor.id) {
        count1++;
      }
    });

    if (count1 === 0) {
      if (this.selectedSubcontractor.length < 10) {
        this.selectedSubcontractor.push(subcontractor);
      }
    }

    this._localStorageService.setItem('selectedSubcontractorDetail', this.selectedSubcontractorDetail);
    this._localStorageService.setItem('selectedSubcontractorForJobsite', this.selectedSubcontractor);
  }

  removeFromSelectedSubcontractor(subcontractor): void {
    const index = this.selectedSubcontractor.indexOf(subcontractor);
    if (index !== -1) {
      this.selectedSubcontractor.splice(index, 1);
    }

    this.selectedSubcontractorDetail.forEach((element, index) => {
      if (element.subcontractorId === subcontractor.jobsiteBidDetailDTO.subContractor.id) {
        this.selectedSubcontractorDetail.splice(index, 1);
      }
    });
    this._localStorageService.setItem('selectedSubcontractorDetail', this.selectedSubcontractorDetail);
    this._localStorageService.setItem('selectedSubcontractorForJobsite', this.selectedSubcontractor);
  }

  removeSubcontractorForSingleJobsite(subcontractor, jobsiteDetail) {
    this.selectedSubcontractorDetail.forEach((element, index) => {
      if (subcontractor.jobsiteBidDetailDTO.subContractor.id === element.subcontractorId) {
        if (element.jobsites.length === 1) {
          this.selectedSubcontractorDetail.splice(index, 1);
          this.selectedSubcontractor.forEach((element, index) => {
            if (element.jobsiteBidDetailDTO.subContractor.id === subcontractor.jobsiteBidDetailDTO.subContractor.id) {
              this.selectedSubcontractor.splice(index, 1);
            }
          });
        }
        else {
          element.jobsites.forEach((item, index) => {
            if (item.id === jobsiteDetail.id) {
              element.jobsites.splice(index, 1);
              element.jobsiteBidDetail.splice(index, 1);
              element.fullDetail.splice(index, 1);
            }
          });
        }
      }
    });

    this._localStorageService.setItem('selectedSubcontractorDetail', this.selectedSubcontractorDetail);
    this._localStorageService.setItem('selectedSubcontractorForJobsite', this.selectedSubcontractor);
  }

  removeJobsiteFromDropDown(id, jobsiteDetail) {
    this.selectedSubcontractorDetail.forEach((element, index) => {
      if (id === element.subcontractorId) {
        if (element.jobsites.length === 1) {
          this.selectedSubcontractorDetail.splice(index, 1);
          this.selectedSubcontractor.forEach((element, index) => {
            if (element.jobsiteBidDetailDTO.subContractor.id === id) {
              this.selectedSubcontractor.splice(index, 1);
            }
          });
        }
        else {
          element.jobsites.forEach((item, index) => {
            if (item.id === jobsiteDetail.id) {
              element.jobsites.splice(index, 1);
              element.jobsiteBidDetail.splice(index, 1);
            }
          });
        }
      }
    });
    this.jobsiteDialog = false;
    this._localStorageService.setItem('selectedSubcontractorDetail', this.selectedSubcontractorDetail);
    this._localStorageService.setItem('selectedSubcontractorForJobsite', this.selectedSubcontractor);
  }


  hasSortlistedSubcontractorDropdown(id) {
    let count = 0;
    let selectedSubcontractorDetail = this._localStorageService.getItem('selectedSubcontractorDetail');
    if (selectedSubcontractorDetail) {
      selectedSubcontractorDetail.forEach(element => {
        element.jobsites.forEach(jobsite => {
          if (jobsite.id === id) {
            count++;
          }
        });
      });
    }

    if (count > 0) {
      return true;
    }
    else {
      return false;
    }
  }

  getNumberOfJobsite(id) {
    let length = 0;
    this.selectedSubcontractorDetail.forEach((element) => {
      if (element.subcontractorId === id) {
        length = element.jobsites.length;
      }
    });

    if (length > 0) {
      return length;
    }
    else {
      return 0;
    }
  }

  redirectToAwardJobsite(id) {

    let selectedSubcontractorDetail = this._localStorageService.getItem('selectedSubcontractorDetail');

    selectedSubcontractorDetail.forEach(element => {
      if (element.subcontractorId === id) {
        this._localStorageService.setItem('awardJobsite', element);
      }
    });
    this.router.navigate([PATH_CONSTANTS.REVIEW_AND_AWARD_JOBSITE]);
  }

  //biding data loding.....

  prepareQueryParam(paramObject): Params {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  setFilter() {
    this.filterMap.clear();
    this.filterMap.set('JOBSITE_ID', this.selectedJobsite.id);
    this.filterMap.set('STATUS', 'APPLIED');
    this.filterMap.set('BIDDING_TYPE', 'BY_JOBSITE');
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    let globalFilter = JSON.stringify(jsonObject);
    return globalFilter;
  }

  onJobsiteChange() {
    this.dataTableParam = {
      offset: 0,
      size: 10,
      sortField: 'CREATED_DATE',
      sortOrder: -1,
      searchText: this.setFilter()
    };
    this.loadBidDataForJobsite();
  }

  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    this.globalFilter = event.globalFilter ? event.globalFilter : this.setFilter();
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.dataTableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadBidDataForJobsite();
  }

  loadBidDataForJobsite() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.projectComparisonService.getJobsiteBidComparisonData(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            this.subcontractors = data.data.result;
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
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

  redirectToSubcontractor(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_SUBCONTRACTOR_PROFILE + "?user=" + id);
  }


  //send message to subcontractor....
  initializeChatMessageForm(): void {
    this.myChatForm = this.formBuilder.group({
      message: [, CustomValidator.required],
      document: []
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

  sendMessage(): boolean {
    this.submitted = true;
    if (!this.myChatForm.valid) {
      CustomValidator.markFormGroupTouched(this.myChatForm);
      this.submitted = true;
      return false;
    }

    this.chatMessageDTO.message = this.myChatForm.value.message;

    if (this.attachmentList[0]) {
      this.chatMessageDTO.documentName1 = this.attachmentList[0].fileName;
      this.chatMessageDTO.documentPath1 = this.attachmentList[0].path;
    }
    if (this.attachmentList[1]) {
      this.chatMessageDTO.documentName2 = this.attachmentList[1].fileName;
      this.chatMessageDTO.documentPath2 = this.attachmentList[1].path;
    }
    if (this.attachmentList[2]) {
      this.chatMessageDTO.documentName3 = this.attachmentList[2].fileName;
      this.chatMessageDTO.documentPath3 = this.attachmentList[2].path;
    }

    let loggedInUser = this._localStorageService.getLoginUserObject();

    this.chatMessageDTO.postedTo = this.subcontractor;
    this.chatMessageDTO.postedBy = loggedInUser;
    this.chatMessageDTO.type = 'JOBSITE';

    this.chatMessageDTO.jobSite = this.selectedJobsite;
    this.chatMessageDTO.project = this.selectedProject;

    if (this.attachmentList[3]) {
      this.notificationService.error(this.translator.instant('you.can.attach.maximum.three.files'), '');
      this.attachmentList.length = 0;
    } else {
      this.chatMessageService.create(this.chatMessageDTO).subscribe(data => {
        if (data.message === 'OK' && data.statusCode === '200') {
          this.notificationService.success(this.translator.instant('message.sent'), '');
          this.hideDialog();
        }
        else {
          this.notificationService.error(data.message, '');
        }
      });
    }
  }

  uploadFile(): void {
    if (this.files.length !== 0) {
      if (this.groupByFileName(this.files)) {
        const uploadFileData = new FormData();
        this.files.forEach((file) => {
          uploadFileData.append('file', file);
        });

        this._fileService.uploadMultipleFile(uploadFileData).subscribe(
          event => {
            if (event instanceof HttpResponse) {
              this.logoBody = event.body;
              this.logoData = this.logoBody.data;
              if (this.logoData.length === this.files.length) {
                this.files.forEach((element, i) => {
                  this.attachment = new ChatMessageAttachmentDTO(element.name, this.logoData[i]);
                  this.attachmentList.push(this.attachment);
                });
              }
              this.sendMessage();
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
      this.sendMessage();
    }
  }

  showMessageDialog(subcontractor): void {
    this.dialog = true;
    this.subcontractor = subcontractor;
    this.initializeChatMessageForm();
  }

  hideDialog(): void {
    this.dialog = false;
    this.files.length = 0;
    this.attachmentList.length = 0;
    this.submitted = false;
  }

  openDeleteDialogForTemp(index, title): void {
    let options = null;
    const message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message} ${title}?`),
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
    this.notificationService.success(this.translator.instant('message.file.deleted'), '');
  }

  onSelect(event): void {
    this.files.splice(2, 0, ...event.addedFiles);


    if (!this.groupByFileName(this.files)) {
      this.notificationService.error('You have selected same name files', '');
    }
  }
}
