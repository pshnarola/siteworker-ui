import { Component, OnInit, ViewChild } from '@angular/core';
import { Params } from '@angular/router';
import { Table } from 'primeng/table';
import { ReplaySubject, Subject, Subscription } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { JobsiteDetail } from 'src/app/module/client/Vos/jobsitemodel';
import { ProjectDetail } from 'src/app/module/client/Vos/projectDetailmodel';
import { LineItemBidDetailDTO } from 'src/app/module/subcontractor/vos/lineItemBidDetailDTO';
import { ProjectComparisonService } from 'src/app/service/client-services/bid-comparison/project-comparison.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-compare-line-item',
  templateUrl: './compare-line-item.component.html',
  styleUrls: ['./compare-line-item.component.css']
})
export class CompareLineItemComponent implements OnInit {

  @ViewChild('dt') table: Table;
  subscription: Subscription;
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

  filterMap = new Map();
  dataTableParam: DataTableParam;
  globalFilter;
  queryParam;
  sortField;
  sortOrder;

  data: LineItemBidDetailDTO[] = [];

  groupedLineItem = [];
  groupedSubcontractor = [];

  selectedSubcontractor: any[] = [];
  selectedFilterdSubcontractor = [];

  constructor(private projectJobSelectionService: ProjectJobSelectionService,
    private _localStorageService: LocalStorageService,
    private projectComparisonService: ProjectComparisonService) { }

  ngOnInit(): void {
    this.setProject();
    this.selectedSubcontractor = this._localStorageService.getItem('selectedSubcontractorDetail');
    this.onJobsiteChange();
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
    });
  }

  onJobsiteChange() {
    this.dataTableParam = {
      offset: 0,
      size: 100,
      sortField: 'CREATED_DATE',
      sortOrder: 0,
      searchText: this.setFilter()
    };
    if (this.selectedSubcontractor.length !== 0) {
      this.loadBidDataForLineItem();
    }
  }

  prepareQueryParam(paramObject): Params {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  redirectToSubcontractor(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_SUBCONTRACTOR_PROFILE + "?user=" + id);
  }

  onSelectJobsite(event) {
    this.onJobsiteChange();
  }

  setFilter() {
    this.selectedFilterdSubcontractor = [];
    this.filterMap.clear();
    this.filterMap.set('JOBSITE_ID', this.selectedJobsite.id);
    if (this.selectedSubcontractor) {
      this.selectedSubcontractor.forEach(element => {
        this.selectedFilterdSubcontractor.push(element.subcontractorId);
        this.filterMap.set('SUBCONTRACTOR_ID', this.selectedFilterdSubcontractor.toString());
      });
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    let globalFilter = JSON.stringify(jsonObject);
    return globalFilter;
  }

  loadBidDataForLineItem() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.projectComparisonService.getLineItemBidComparisonData(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message === 'OK') {
            this.loading = false;
            this.data = data.data.result;
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
            this.groupByLineItem();
            this.groupBySubcontractor();
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

  groupByLineItem() {
    this.groupedLineItem = [];
    const records = this.data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.lineItemBidDetailDTO.lineItem.id,
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
      this.groupedLineItem.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }

  groupBySubcontractor() {
    this.groupedSubcontractor = [];
    const records = this.data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.lineItemBidDetailDTO.subContractor.id,
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
      this.groupedSubcontractor.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }

  countSubcontractorTotalCost(subcontractorId) {
    let total = 0;
    this.groupedSubcontractor.forEach((subcontractor) => {
      if (subcontractor.key === subcontractorId) {
        subcontractor.value.forEach(element => {
          total += element.lineItemBidDetailDTO.subContractorBidAmount;
        });
      }
    });

    return total;
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

}
