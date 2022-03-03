import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Params } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { ProjectDetail } from 'src/app/module/client/Vos/projectDetailmodel';
import { ExperienceLevelService } from 'src/app/service/admin-services/experience/experience.service';
import { ProjectComparisonService } from 'src/app/service/client-services/bid-comparison/project-comparison.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-project-bidding-comparsion',
  templateUrl: './project-bidding-comparsion.component.html',
  styleUrls: ['./project-bidding-comparsion.component.css']
})
export class ProjectBiddingComparsionComponent implements OnInit {
  @ViewChild('dt') table: Table;
  subscription: Subscription;
  selectedProject: ProjectDetail = null;
  isSelectedProject = false;
  isFilterOpened = false;
  subcontractorNameParams;
  queryParam;
  filterSubcontractor = [];
  myForm: FormGroup;
  averageRatingList = [
    { label: '5', value: '5' },
    { label: 'Above 1', value: '1' },
    { label: 'Above 2', value: '2' },
    { label: 'Above 3', value: '3' },
    { label: 'Above 4', value: '4' },
  ];
  filteredAverageRating: any[];
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
    { label: this.translator.instant('bid.amount'), value: 'SUBCONTRACTOR_COST', sortable: true },
    { label: this.translator.instant('average.rating'), value: 'workerAvgRating', sortable: false },
    { label: this.translator.instant('total.experience'), value: 'TOTAL_EXPERIENCE', sortable: false },
    { label: this.translator.instant('success.ratio'), value: 'successRatio', sortable: false }
  ];

  filterMap = new Map();
  dataTableParam: DataTableParam;
  globalFilter;
  queryParamForProject;
  sortField;
  sortOrder;


  filterSubcontractorFromList = [];
  emptyArray = [];
  feedback: string;
  annualTo: any;
  annualFrom: any;
  errorFlag: boolean;
  dateErrorFlage = false;
  exceperience = [];
  filteredExceprience = [];
  totalExperienceForFilter = [];

  constructor(
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private _localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private translator: TranslateService,
    private notificationService: UINotificationService,
    private projectComparisonService: ProjectComparisonService,
    private exceperienceService: ExperienceLevelService,
    private dateHelperService: DateHelperService
  ) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.getExceprienceList();
    this.setProject();
    if (this._localStorageService.getItem('selectedSubcontractorForProject')) {
      this.selectedSubcontractor = this._localStorageService.getItem('selectedSubcontractorForProject');
    }
    this.initializeForm();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setProject() {
    this.subscription = this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      let project = this._localStorageService.getSelectedProjectObject();
      if (project.id === 'pid') {
        this.isSelectedProject = false;
        this.selectedProject = null;
      }
      else {
        this.selectedProject = project;
        if (this.selectedProject !== null) {
          this.isSelectedProject = true;
        }
      }
      this.onProjectChange();
      let bidDTO = this._localStorageService.getItem('selectedSubcontractorForProject');
      if (bidDTO !== undefined && bidDTO?.length) {
        if (bidDTO[0].projectBidDetailDTO.projectDetail.id !== this.selectedProject.id) {
          this._localStorageService.removeItem('selectedSubcontractorForProject');
        }
      }
      this._localStorageService.removeItem('awardProject');
    });
  }

  onFilterOpen() {
    this.isFilterOpened = !this.isFilterOpened;
  }

  prepareQueryParam(paramObject): Params {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  getSubcontractorByName(name): void {
    this.subcontractorNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.subcontractorNameParams);
    this.filterLeftPanelService.getSubcontractorByName(this.queryParam).subscribe(data => {
      this.filterSubcontractor = data.data;
      this.filterSubcontractor = this.filterSubcontractor.sort();
    });
  }

  filterAverageRating(event): void {
    const filtered: any[] = [];
    const query = event.query;
    for (let i = 0; i < this.averageRatingList.length; i++) {
      const averageRatingList = this.averageRatingList[i];
      if (averageRatingList.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(averageRatingList);
      }
    }
    this.filteredAverageRating = filtered;
    this.filteredAverageRating = this.filteredAverageRating.sort();


  }

  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      subcontractorName: [],
      minRate: [],
      maxRate: [],
      bidSubmittedFromDate: [],
      bidSubmittedToDate: [],
      avgRating: [],
      totalExperience: []
    });
  }

  onChangeAnnualTo(event): void {
    this.annualTo = event.target.value;
    this.annualFrom = this.myForm.value.minRate;
    if (this.myForm.value.minRate && this.myForm.value.maxRate) {
      if (parseInt(this.annualTo) <= parseInt(this.annualFrom)) {
        this.errorFlag = true;
        this.feedback = 'To cannot be smaller than from';
      }
      else {
        this.errorFlag = false;
      }
    }
  }
  onChangeAnnualFrom(event): void {
    this.annualFrom = event.target.value;
    this.annualTo = this.myForm.value.maxRate;
    if (this.myForm.value.minRate && this.myForm.value.maxRate) {
      if (parseInt(this.annualTo) <= parseInt(this.annualFrom)) {
        this.errorFlag = true;
        this.feedback = 'To cannot be smaller than from';
      }
      else {
        this.errorFlag = false;
      }
    }
  }

  onFilterProject() {
    this.dateErrorFlage = false;
    this.errorFlag = false;
    if ((this.myForm.value.minRate === null && this.myForm.value.maxRate !== null) ||
      (this.myForm.value.minRate !== null && this.myForm.value.maxRate === null)) {
      this.errorFlag = true;
    }

    if (!this.myForm.value.minRate && !this.myForm.value.maxRate) {
      this.errorFlag = false;
    }

    if (this.myForm.value.minRate && this.myForm.value.maxRate) {
      if (this.myForm.value.minRate > this.myForm.value.maxRate) {
        this.errorFlag = true;
      }
    }

    if (((this.myForm.value.bidSubmittedFromDate && !this.myForm.value.bidSubmittedToDate) ||
      (!this.myForm.value.bidSubmittedFromDate && this.myForm.value.bidSubmittedToDate))) {
      this.dateErrorFlage = true;
    }

    if (!this.myForm.value.bidSubmittedFromDate && !this.myForm.value.bidSubmittedToDate) {
      this.dateErrorFlage = false;
    }

    if (this.myForm.value.bidSubmittedFromDate && this.myForm.value.bidSubmittedToDate) {
      if (this.myForm.value.bidSubmittedFromDate > this.myForm.value.bidSubmittedToDate) {
        this.dateErrorFlage = true;
      }
    }

    this.filterMap.clear();
    this.filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
    this.filterMap.set('STATUS', 'APPLIED');
    this.filterMap.set('BIDDING_TYPE', 'BY_PROJECT');
    this.filterSubcontractorFromList.length = 0;
    this.totalExperienceForFilter.length = 0;

    if (this.myForm.value.subcontractorName) {
      this.myForm.value.subcontractorName.forEach(element => {
        this.filterSubcontractorFromList.push(element.id);
        this.filterMap.set('SUBCONTRACTOR_ID', this.filterSubcontractorFromList.toString());
      });
    }

    if (this.myForm.value.minRate && !this.errorFlag) {
      this.filterMap.set('MIN_BID_AMOUNT', this.myForm.value.minRate);
    }
    if (this.myForm.value.maxRate && !this.errorFlag) {
      this.filterMap.set('MAX_BID_AMOUNT', this.myForm.value.maxRate);
    }

    if (this.myForm.value.bidSubmittedFromDate) {
      this.dateHelperService.setStartDate(this.myForm.value.bidSubmittedFromDate);
      const datePipe = new DatePipe('en-US');
      const value = datePipe.transform(this.myForm.value.bidSubmittedFromDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('SUBMITTED_DATE_FROM', value);
    }
    if (this.myForm.value.bidSubmittedToDate) {
      this.dateHelperService.setEndDate(this.myForm.value.bidSubmittedToDate);
      const datePipe = new DatePipe('en-US');
      const valueEnd = datePipe.transform(this.myForm.value.bidSubmittedToDate, 'yyyy-MM-dd HH:mm:ss');
      this.filterMap.set('SUBMITTED_DATE_TO', valueEnd);
    }
    if (this.myForm.value.avgRating) {
      this.filterMap.set('AVG_RATING', this.myForm.value.avgRating.value);
    }

    if (this.myForm.value.totalExperience) {
      this.myForm.value.totalExperience.forEach(element => {
        this.totalExperienceForFilter.push(element.id);
        this.filterMap.set('TOTAL_EXPERIENCE', this.totalExperienceForFilter.toString());
      });
    }

    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    if (!this.errorFlag) {
      if (!this.dateErrorFlage) {
        this.globalFilter = JSON.stringify(jsonObject);
        this.dataTableParam = {
          offset: 0,
          size: 10000,
          sortField: 'CREATED_DATE',
          sortOrder: 0,
          searchText: this.globalFilter
        };
        this.loadBidDataForProject();
      }
      else {
        this.notificationService.error('Please select appropriate date range', '');
      }
    }
    else {
      this.notificationService.error('Please select appropriate amount range', '');
    }
  }

  onFormChanged(form: FormGroup) {
    if (form.value.bidSubmittedFromDate && form.value.bidSubmittedToDate) {
      if (form.value.bidSubmittedFromDate > form.value.bidSubmittedToDate) {
        this.dateErrorFlage = true;
      }
      else {
        this.dateErrorFlage = false;
      }
    }
  }

  onClearFilter() {
    this.myForm.reset();
    this.myForm.get('subcontractorName').patchValue(this.emptyArray);
    this.onFilterProject();
  }


  isSubcontractorSelected(id): boolean {
    let count = 0;
    this.selectedSubcontractor.forEach(
      function (subcontractor) {
        if (subcontractor.projectBidDetailDTO.subContractor.id === id) {
          count++;
        }
      }
    );
    if (count > 0) {
      return true;
    }
    else {
      return false;
    }
  }

  onSelectSubcontractor(subcontractor): void {
    let selectedSubcontractor = this._localStorageService.getItem('selectedSubcontractorForProject');
    if (selectedSubcontractor) {
      if (selectedSubcontractor.length < 10) {
        this.selectedSubcontractor.push(subcontractor);
      }
    }
    else {
      this.selectedSubcontractor.push(subcontractor);
    }
    this._localStorageService.setItem('selectedSubcontractorForProject', this.selectedSubcontractor);
  }

  removeFromSelectedSubcontractor(subcontractor): void {
    let selectedSubcontractor = this._localStorageService.getItem('selectedSubcontractorForProject');
    selectedSubcontractor.forEach((element, index) => {
      if (subcontractor.projectBidDetailDTO.subContractor.id === element.projectBidDetailDTO.subContractor.id) {
        this.selectedSubcontractor.splice(index, 1);
      }
    });
    this._localStorageService.setItem('selectedSubcontractorForProject', this.selectedSubcontractor);
  }

  //biding data loding...
  setFilter() {
    this.filterMap.clear();
    this.filterMap.set('PROJECT_DETAIL_ID', this.selectedProject.id);
    this.filterMap.set('STATUS', 'APPLIED');
    this.filterMap.set('BIDDING_TYPE', 'BY_PROJECT');
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    let globalFilter = JSON.stringify(jsonObject);
    return globalFilter;
  }

  onProjectChange() {
    if (this._localStorageService.getItem('selectedSubcontractorForProject')) {
      let data = this._localStorageService.getItem('selectedSubcontractorForProject');
      let selectedProject = this._localStorageService.getSelectedProjectObject();
      if (data !== undefined && data.length !== 0) {
        if (data[0].projectBidDetailDTO.projectDetail.id !== selectedProject.id) {
          this._localStorageService.removeItem('selectedSubcontractorForProject');
          this.selectedSubcontractor = [];
        }
      }

    }
    this.dataTableParam = {
      offset: 0,
      size: 10,
      sortField: 'CREATED_DATE',
      sortOrder: 0,
      searchText: this.setFilter()
    };
    this.loadBidDataForProject();
  }

  onLazyLoad(event): void {
    this.sortOrder = event.sortOrder === -1 ? 0 : 1;
    if (!this.myForm) {
      this.globalFilter = event.globalFilter ? event.globalFilter : this.setFilter();
    }
    this.sortField = event.sortField ? event.sortField : 'CREATED_DATE';
    this.offset = event.first / event.rows;
    this.dataTableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.loadBidDataForProject();
  }

  loadBidDataForProject() {
    this.loading = true;
    this.queryParamForProject = this.prepareQueryParam(this.dataTableParam);
    this.projectComparisonService.getProjectBidComparisonData(this.queryParamForProject).subscribe(
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

  private getExceprienceList() {
    let dataTableParam = {
      offset: 0,
      size: 100000,
      sortField: 'LEVEL',
      sortOrder: 1,
      searchText: null
    };
    this.queryParam = this.prepareQueryParam(dataTableParam);
    this.exceperienceService.getExperienceLevelList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.exceperience = data.data.result;
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  filterExperience(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.exceperience.length; i++) {
      let exceperience1 = this.exceperience[i];
      if (exceperience1.level.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(exceperience1);
      }
    }
    this.filteredExceprience = filtered;
    this.filteredExceprience = this.filteredExceprience.sort();
  }

}
