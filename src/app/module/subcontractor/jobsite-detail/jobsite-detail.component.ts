import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Paginator } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-jobsite-detail',
  templateUrl: './jobsite-detail.component.html',
  styleUrls: ['./jobsite-detail.component.css']
})
export class JobsiteDetailComponent implements OnInit {

  _selectedColumns: any[];
  showMore = false;

  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  subscription = new Subscription();
  isSelectedJobSite: boolean = false;
  JobSiteDetail: any;
  projectDetail: ProjectDetail;
  isSelectedProject: boolean;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;
  first = 0;
  page = 0;
  @ViewChild('paginator', { static: true }) paginator: Paginator

  columns = [
    { label: this.translator.instant('work.type'), value: 'workType', selected: true },
    { label: this.translator.instant('line.item.id'), value: 'lineItemId', selected: true },
    { label: this.translator.instant('line.item.name'), value: 'lineItemName', selected: true },
    { label: this.translator.instant('cost'), value: 'cost', selected: true },
    { label: this.translator.instant('description'), value: 'description', selected: true },
    { label: this.translator.instant('inclusion'), value: 'inclusions', selected: false },
    { label: this.translator.instant('exclusion'), value: 'exclusions', selected: false },
    { label: this.translator.instant('unit'), value: 'unit.name', selected: false },
    { label: this.translator.instant('quantity'), value: 'quantity', selected: false },
    { label: this.translator.instant('dynamic.label1'), value: 'dynamicLabel1', selected: false },
    { label: this.translator.instant('dynamic.label2'), value: 'dynamicLabel2', selected: false },
    { label: this.translator.instant('dynamic.label3'), value: 'dynamicLabel3', selected: false }
  ];

  constructor(private captionChangeService: HeaderManagementService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private localStorageService: LocalStorageService,
    private translator: TranslateService) {

    this.captionChangeService.hideHeaderSubject.next(true);
    //this.projectJobSelectionService.addHideAllLabelSubject.next(false);

  }

  ngOnInit(): void {

    this.getSelectedProjectDetails();
    this.getSelectedJobsiteDetail();
    this.captionChangeService.hideHeaderSubject.next(true);
    //this.projectJobSelectionService.addHideAllLabelSubject.next(false);
    this._selectedColumns = this.columns.filter(x => x.selected == true);
  }

  ngOnDestroy() {
    this.projectJobSelectionService.addHideAllLabelSubject.next(true);
    this.subscription.unsubscribe();
  }

  getSelectedJobsiteDetail() {
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(data => {
      const jobSite = this.localStorageService.getSelectedJobsiteObject();
      const project = this.localStorageService.getSelectedProjectObject();
      if (project && jobSite) {
        if (jobSite.id === 'jid') {
          this.isSelectedJobSite = false;
          this.JobSiteDetail = null;
        }
        else {
          this.showMore = false;
          this.JobSiteDetail = jobSite;
          if (this.JobSiteDetail !== null) {
            this.isSelectedJobSite = true;
          }
        }
      }
      else {
        this.isSelectedJobSite = false;
        this.JobSiteDetail = null;
      }
    }));
  }

  getSelectedProjectDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      const project = this.localStorageService.getSelectedProjectObject();
      if (project) {
        if (project.id === 'pid') {
          this.isSelectedProject = false;
          this.projectDetail = null;
        }
        else {
          this.projectDetail = project;
          if (this.projectDetail !== null) {
            this.isSelectedProject = true;
          }
        }
      } else {
        this.isSelectedProject = false;
        this.projectDetail = null;
      }
    }));
  }

  paginate(event) {
    this.first = event.first;
    this.size = event.rows;
    setTimeout(() => this.paginator.changePage(event.page));
  }

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }

}
