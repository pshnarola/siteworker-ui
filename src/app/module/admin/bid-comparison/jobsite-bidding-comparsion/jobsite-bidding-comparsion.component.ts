import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { JobsiteDetail } from 'src/app/module/client/Vos/jobsitemodel';
import { ProjectDetail } from 'src/app/module/client/Vos/projectDetailmodel';
import { ProjectComparisonService } from 'src/app/service/client-services/bid-comparison/project-comparison.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ChatMessageAttachmentDTO } from 'src/app/shared/chat-message-attachment-dto';
import { ChatMessageDTO } from 'src/app/shared/chat-message-dto';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-jobsite-bidding-comparsion',
  templateUrl: './jobsite-bidding-comparsion.component.html',
  styleUrls: ['./jobsite-bidding-comparsion.component.css']
})
export class JobsiteBiddingComparsionComponent implements OnInit {
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
    { label: this.translator.instant('select'), value: 'sortlist', sortable: false },
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

  constructor(private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private _localStorageService: LocalStorageService,
    private translator: TranslateService,
    private projectComparisonService: ProjectComparisonService,
    private confirmDialogService: ConfirmDialogueService,) {
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
      if (bidDTO) {
        this.selectedSubcontractor = this._localStorageService.getItem('selectedSubcontractorForJobsite');
        this.selectedSubcontractorDetail = this._localStorageService.getItem('selectedSubcontractorDetail');
      }
      if (bidDTO !== undefined) {
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

}
