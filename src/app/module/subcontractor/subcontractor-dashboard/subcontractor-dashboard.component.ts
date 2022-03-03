import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ChartOptions, ChartType } from 'chart.js';
import { Label, SingleDataSet } from 'ng2-charts';
import { ReplaySubject, Subject } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { StateService } from 'src/app/service/admin-services/state/state.service';
import { ProjectDetailService } from 'src/app/service/client-services/project-detail.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { DashboardService } from 'src/app/service/dashboard-services/dashboard.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ProjectBidService } from 'src/app/service/subcontractor-services/project-bid/project-bid.service';
import { SubcontractorProfileService } from 'src/app/service/subcontractor-services/subcontractor-profile/subcontractor-profile.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-subcontractor-dashboard',
  templateUrl: './subcontractor-dashboard.component.html',
  styleUrls: ['./subcontractor-dashboard.component.css']
})
export class SubcontractorDashboardComponent implements OnInit, OnDestroy {

  todayDate = new Date();

  filterMapForFullDetail = new Map();

  totalProject = 0;
  totalJobsite = 0;
  totalInvoice = 0;
  totalPaidInvoice = 0;
  totalDueInvoice = 0;

  queryParam;
  lat = 40.730610;
  lng = -73.935242;
  datatableParam: DataTableParam = {
    offset: 0,
    size: 100000,
    sortField: '',
    sortOrder: 1,
    searchText: null
  };
  filteredState: any[];
  state = [];
  selectedType = 'project';

  selectedTypeForChart = {
    'type': 'Project',
    'value': 'project'
  };

  filteredType = [];

  defaultState = {
    'name': 'All'
  }

  typesForLocationDropdown = [
    {
      'type': 'Project',
      'value': 'project'
    },
    {
      'type': 'Jobsite',
      'value': 'jobsite'
    }
  ];

  subcontractorDetail;


  projects = [];
  jobsites = [];
  completedJobsites = [];
  acceptedJobsites = [];
  selectedState: any;

  completedProjects = [];
  acceptedProjects = [];

  //load jobsite bid detail
  filterMapForJobsite = new Map();
  globalFilterForJobsite;
  dataTableParamForJobsite: DataTableParam;
  queryParamForJobsite;

  //load jobsite bid detail
  filterMapForProject = new Map();
  globalFilterForProject;
  dataTableParamForProject: DataTableParam;
  queryParamForProject;

  pendingInvitation = [];

  favoriteProject = [];

  closeOutPackages = [];

  requiredCertificates = [];

  pieChartColorsForProject = [
    {
      backgroundColor: ['rgb(255,148,150)', 'rgb(246,214,82)', 'rgb(91,203,112)', 'rgb(136,145,160)', 'rgb(184,158,126)', 'rgb(175,201,240)'],
    },
  ];

  pieChartColorsForJobsite = [
    {
      backgroundColor: ['rgb(255,148,150)', 'rgb(246,214,82)', 'rgb(91,203,112)', 'rgb(136,145,160)'],
    },
  ];

  pieChartColorsForInvoice = [
    {
      backgroundColor: ['rgb(255,148,150)', 'rgb(91,203,112)'],
    },
  ];


  public pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'bottom',
      labels: {
        fontSize: 10,
        usePointStyle: true
      }
    }
  };
  public pieChartLabelsForProject: Label[] = ['Invited', 'Favorite', 'Bid Saved', 'Bid Submitted', 'Awarded', 'Work In Progress'];
  public pieChartLabelsForJobsite: Label[] = ['Bid Saved', 'Bid Submitted', 'Awarded', 'Work In Progress'];
  public pieChartLabelsForInvoice: Label[] = ['Due', 'Paid'];
  public pieChartDataForProject: SingleDataSet = [0, 0, 0, 0, 0, 0];
  public pieChartDataForJobsite: SingleDataSet = [0, 0, 0, 0];
  public pieChartDataForInvoice: SingleDataSet = [0, 0];
  public pieChartType: ChartType = 'pie';
  public pieChartTypeForInvoice: ChartType = 'doughnut';
  public pieChartLegend = true;
  public pieChartPlugins = [];

  //data for project variable
  groupByStatusProject = [];
  numberOfInvitedProject = 0;
  numberOfFavoriteProject: number = 0;
  numberOfInProcessProject = 0;
  numberOfBidSavedProject = 0;
  numberOfBidSubmittedProject = 0;
  numberOfAwardedProject = 0;

  //data for jobsite variable
  groupByStatusJobsite = [];
  numberOfInProcessJobsite = 0;
  numberOfBidSavedJobsite = 0;
  numberOfBidSubmittedJobsite = 0;
  numberOfAwardedJobsite = 0;

  //data for invoices variable
  groupByStatusInvoices = [];
  numberOfDueInvoices = 0;
  numberOfPaidInvoices: number = 0;
  upToDateCertificates = [];

  constructor(
    private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStrorageService: LocalStorageService,
    private projectService: ProjectDetailService,
    private projectBidService: ProjectBidService,
    private dashboardService: DashboardService,
    private _subcontractorProfileDetail: SubcontractorProfileService,
    private router: Router,
    private stateService: StateService
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.DASHBOARD);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.projectJobSelectionService.showSubcontractorSidebarList.next(true);
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  ngOnInit(): void {
    this.getStateList();
    this.loadDataForDashboard();
    this.setParamForJobsiteBidDetail();
    this.setParamForProjectBidDetail();
    this.getSubcontractorDetailByUserId();
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.DASHBOARD);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.projectJobSelectionService.showSubcontractorSidebarList.next(true);
  }

  getSubcontractorDetailByUserId(): void {
    let id = this.localStrorageService.getLoginUserId();
    this._subcontractorProfileDetail.getSubcontractorProfileDetailById(id).subscribe(
      data => {

        if (data.statusCode === '200' && data.message === 'OK') {
          this.subcontractorDetail = data.data;
          if (this.subcontractorDetail.basicProfile) {

            if (this.subcontractorDetail.basicProfile.latitude !== 0 && this.subcontractorDetail.basicProfile.longitude !== 0) {
              this.lat = this.subcontractorDetail.basicProfile.latitude;
              this.lng = this.subcontractorDetail.basicProfile.longitude;
            }
          }
        }
      });
  }

  filterType(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.typesForLocationDropdown.length; i++) {
      let type = this.typesForLocationDropdown[i];
      if (type.type.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(type);
      }
    }
    this.filteredType = filtered;
    this.filteredType = this.filteredType.sort();
  }

  filterState(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.state.length; i++) {
      let state = this.state[i];
      if (state.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(state);
      }
    }
    this.filteredState = filtered;
    this.filteredState = this.filteredState.sort();

  }

  private prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  private getStateList() {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.stateService.getStateList(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.message == 'OK') {
            this.state = data.data.result;
            this.state.splice(0, 0, this.defaultState)
          }
        } else {
        }
      },
      error => {
      }
    );
  }

  getGapBetweenTwoDates(date1, date2): number {

    const datePipe = new DatePipe('en-US');
    const value1 = datePipe.transform(date1, 'yyyy-MM-dd');
    const value2 = datePipe.transform(date2, 'yyyy-MM-dd');

    let date11 = new Date(value1);
    let date22 = new Date(value2);
    var Difference_In_Time = date11.getTime() - date22.getTime();

    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    return Difference_In_Days;
  }

  //load data for dashboard
  loadDataForDashboard() {
    const userId = this.localStrorageService.getLoginUserId();
    this.dashboardService.getDashboardDetailOfSubcontractor(userId).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {


        //set data for project chart
        this.groupByStatusProjectMethod(data.data.lstProjectBidDetail);
        this.numberOfFavoriteProject = data.data.lstFavouriteProject.length;
        this.numberOfInvitedProject = data.data.lstProjectInvitee.length;
        this.totalProject = this.numberOfFavoriteProject + data.data.lstProjectInvitee.length + data.data.lstProjectBidDetail.length - this.countInvitedProjectinBidProject(data.data.lstProjectBidDetail, data.data.lstProjectInvitee);

        this.setProjectChartData();

        //set data for jobsite chart
        this.groupByStatusJobsiteMethod(data.data.lstJobsiteBidDetail);
        this.totalJobsite = data.data.lstJobsiteBidDetail.length;
        this.setJobsiteChartData();

        //set closeout package
        this.closeOutPackages = data.data.lstRecentCloseOutpackageDetail;


        //Pending invitation
        this.pendingInvitation = data.data.lstRecentPendingProjectInvitee;


        //Favorite Project
        this.favoriteProject = data.data.lstRecentFavouriteProject;


        //licences
        this.requiredCertificates = data.data.lstLicenses;


        if (data.data.lstUpToDateLicenses) {
          this.upToDateCertificates = data.data.lstUpToDateLicenses;
        }

        //set data for invoices
        this.groupByStatusInvoiceMethod(data.data.lstInvoiceDetail);
        this.setInvoiceChartData();
        this.setTotalInvoice(data.data.lstInvoiceDetail);
      }
    });
  }

  validateProjectChart() {
    let count = 0;
    this.pieChartDataForProject.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 6) {
      return false;
    }
    else {
      return true;
    }
  }

  validateJobsiteChart() {
    let count = 0;
    this.pieChartDataForJobsite.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 4) {
      return false;
    }
    else {
      return true;
    }
  }

  validateInvoiceChart() {
    let count = 0;
    this.pieChartDataForInvoice.forEach(element => {
      if (element === 0) {
        count++;
      }
    });
    if (count === 2) {
      return false;
    }
    else {
      return true;
    }
  }


  setTotalInvoice(data) {
    let total = 0;
    data.forEach(element => {
      total += element.invoiceAmount;
    });
    this.totalInvoice = total;
  }

  returnFirstCharacterFromString(data) {
    return data.charAt(0);
  }

  countInvitedProjectinBidProject(lstProjectBidDetail, lstProjectInvitee) {
    let count = 0;
    lstProjectInvitee.forEach(element => {
      lstProjectBidDetail.forEach(element1 => {
        if (element1.projectDetail.id === element.projectDetail.id) {
          count++;
        }
      });
    });

    return count;
  }


  //data for jobsite
  groupByStatusJobsiteMethod(data) {
    this.groupByStatusJobsite = [];
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.status,
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
      this.groupByStatusJobsite.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();

  }

  setJobsiteChartData() {
    this.groupByStatusJobsite.forEach(element => {
      if (element.key === 'STARTED') {
        this.numberOfBidSavedJobsite = element.value.length;
      }
      if (element.key === 'ACCEPTED') {
        this.numberOfInProcessJobsite = element.value.length;
      }
      if (element.key === 'APPLIED') {
        this.numberOfBidSubmittedJobsite = element.value.length;
      }
      if (element.key === 'OFFERED') {
        this.numberOfAwardedJobsite = element.value.length;
      }
    });
    this.pieChartDataForJobsite = [
      this.numberOfBidSavedJobsite,
      this.numberOfBidSubmittedJobsite,
      this.numberOfAwardedJobsite,
      this.numberOfInProcessJobsite
    ];
  }


  //data for invoices
  groupByStatusInvoiceMethod(data) {
    this.groupByStatusInvoices = [];
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.status,
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
      this.groupByStatusInvoices.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();

  }

  setInvoiceChartData() {
    let totalPaid = 0;
    let totalDue = 0;
    this.groupByStatusInvoices.forEach(element => {
      if (element.key === 'DUE') {
        element.value.forEach(element => {
          totalDue += element.invoiceAmount;
        });
        this.totalDueInvoice = totalDue;
        this.numberOfDueInvoices = element.value.length;
      }
      if (element.key === 'PAID') {
        element.value.forEach(element => {
          totalPaid += element.invoiceAmount;
        });
        this.totalPaidInvoice = totalPaid;
        this.numberOfPaidInvoices = element.value.length;
      }
    });
    this.pieChartDataForInvoice = [this.numberOfDueInvoices, this.numberOfPaidInvoices];
  }


  groupByStatusProjectMethod(data) {
    this.groupByStatusProject = [];
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.status,
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
      this.groupByStatusProject.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();

  }

  setProjectChartData() {
    this.groupByStatusProject.forEach(element => {
      if (element.key === 'STARTED') {
        this.numberOfBidSavedProject = element.value.length;
      }
      if (element.key === 'ACCEPTED') {
        this.numberOfInProcessProject = element.value.length;
      }
      if (element.key === 'APPLIED') {
        this.numberOfBidSubmittedProject = element.value.length;
      }
      if (element.key === 'OFFERED') {
        this.numberOfAwardedProject = element.value.length;
      }
    });
    this.pieChartDataForProject = [
      this.numberOfInvitedProject,
      this.numberOfFavoriteProject,
      this.numberOfBidSavedProject,
      this.numberOfBidSubmittedProject,
      this.numberOfAwardedProject,
      this.numberOfInProcessProject
    ];
  }

  setParamForJobsiteBidDetail() {
    this.filterMapForJobsite.clear();
    const loggedInUserId = this.localStrorageService.getLoginUserId();
    this.filterMapForJobsite.set('SUBCONTRACTOR_ID', loggedInUserId);
    if (this.selectedState) {
      this.filterMapForJobsite.set('STATE_NAME', this.selectedState.name);
    }
    const jsonObject = {};
    this.filterMapForJobsite.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilterForJobsite = JSON.stringify(jsonObject);
    this.dataTableParamForJobsite = {
      offset: 0,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: 0,
      searchText: this.globalFilterForJobsite
    };
    this.getJobsiteBidDetail();
  }

  getJobsiteBidDetail(): void {
    this.queryParamForJobsite = this.prepareQueryParam(this.dataTableParamForJobsite);
    this.projectBidService.getAllJobsitetBidDetail(this.queryParamForJobsite).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {

        this.groupByStatusJobsiteMapMethod(data.data.result);
        this.setJobsiteMapData();
      }
    });
  }

  groupByStatusJobsiteMapMethod(data) {
    this.jobsites = [];
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.status,
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
      this.jobsites.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();

  }

  setJobsiteMapData() {
    this.acceptedJobsites = [];
    this.completedJobsites = [];
    this.jobsites.forEach(element => {
      if (element.key === 'ACCEPTED') {
        this.acceptedJobsites = element.value;
      }
      else {
        this.completedJobsites.length = 0;
        element.value.forEach(element1 => {
          if (element1.jobSiteDetail.status === 'COMPLETED') {
            this.completedJobsites.push(element1);
          }
        });
      }
    });


  }


  //LOAD DATA FOR PROJECT MAP
  setParamForProjectBidDetail() {
    this.filterMapForProject.clear();
    const loggedInUserId = this.localStrorageService.getLoginUserId();
    this.filterMapForProject.set('SUBCONTRACTOR_ID', loggedInUserId);
    if (this.selectedState) {
      this.filterMapForProject.set('STATE_NAME', this.selectedState.name);
    }
    const jsonObject = {};
    this.filterMapForProject.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilterForProject = JSON.stringify(jsonObject);
    this.dataTableParamForProject = {
      offset: 0,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: 0,
      searchText: this.globalFilterForProject
    };
    this.getProjectBidDetail();
  }

  getProjectBidDetail(): void {
    this.queryParamForProject = this.prepareQueryParam(this.dataTableParamForProject);
    this.projectBidService.getAllProjectBidDetail(this.queryParamForProject).subscribe(data => {
      if (data.statusCode === '200' && data.message === 'OK') {

        this.groupByStatusProjectMapMethod(data.data.result);
        this.setProjectMapData();
      }
    });
  }

  groupByStatusProjectMapMethod(data) {
    this.projects = [];
    const records = data;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.status,
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
      this.projects.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();

  }

  setProjectMapData() {
    this.acceptedProjects = [];
    this.completedProjects = [];
    this.projects.forEach(element => {
      if (element.key === 'ACCEPTED') {
        this.acceptedProjects = element.value;
      }
      else {
        this.completedProjects.length = 0;
        element.value.forEach(element1 => {
          if (element1.projectDetail.status === 'COMPLETED') {
            this.completedProjects.push(element1);
          }
        });
      }
    });


  }

  onStateSelect(event) {
    if (this.selectedState.name === 'All') {
      this.selectedState = null;
    }

    this.setParamForProjectBidDetail();
    this.setParamForJobsiteBidDetail();
  }

  onStateUnselect(event) {
    this.setParamForProjectBidDetail();
    this.setParamForJobsiteBidDetail();
  }

  reditectToBidAndApply(project) {
    this.getProjectFullDetail(project);
  }


  getProjectFullDetail(project) {
    this.filterMapForFullDetail.clear();
    this.filterMapForFullDetail.set('PROJECT_ID', project.id);
    const jsonObject = {};
    this.filterMapForFullDetail.forEach((value, key) => {
      jsonObject[key] = value;
    });

    let globalFilter = JSON.stringify(jsonObject);
    let dataTableParam = {
      offset: 0,
      size: 100000,
      sortField: 'CREATED_DATE',
      sortOrder: 0,
      searchText: globalFilter
    }

    let queryParam = this.prepareQueryParam(dataTableParam);
    this.projectService.getProjectForSubContractor(queryParam).subscribe(data => {

      if (data.statusCode === '200' && data.message === 'OK') {
        this.localStrorageService.setItem('selectedFullProjectDetail', data.data.result[0]);
        this.localStrorageService.setItem('selectedProject', data.data.result[0].projectDetail);
        this.router.navigate(['/subcontractor/select-jobsite']);
      }
    });

  }


}
