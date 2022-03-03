import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Table } from 'primeng/table';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { JobBidService } from 'src/app/service/worker-services/job-bid.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { JobBidDetailDTO } from 'src/app/shared/vo/job-bid-detail-dto';

@Component({
  selector: 'app-review-and-offer',
  templateUrl: './review-and-offer.component.html',
  styleUrls: ['./review-and-offer.component.css']
})
export class ReviewAndOfferComponent implements OnInit {
  @ViewChild('dt') table: Table;
  selectedWorkers = [];
  columns = [];
  loading = false;
  offset = 0;
  totalRecords = 0;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  employementType: any;
  yearlySalary;
  _selectedColumns: any[];
  perDiem: any;
  mileage: any;
  jobBidId: any;
  certificates = [];
  displayCertificate = false;
  displayScreeningQuestions = false;
  screeningQuestions = [];
  certificateFilterMap = new Map();
  queryParam;
  dataTableParam: DataTableParam;
  globalFilter;
  myForm: FormGroup;
  submitted: boolean;
  certificatesList = [];
  jobDetailData: any;
  jobOfferData = [];
  jobBidDetailDTO: JobBidDetailDTO;
  count = 0;
  isPerDiem: any;
  isPayForMileage: any;
  constructor(
    private localStorageService: LocalStorageService,
    private translator: TranslateService,
    private jobBidService: JobBidService,
    private router: Router,
    private formBuilder: FormBuilder,
    private notificationService: UINotificationService,
    private captionChangeService: HeaderManagementService) {
    this.captionChangeService.hideSidebarSubject.next(true);
    this.dataTableParam = new DataTableParam();
  }

  ngOnInit(): void {
    this.captionChangeService.hideSidebarSubject.next(true);
    this.setColumnOfTable();
    this._selectedColumns = this.columns;
    this.selectedWorkers = this.localStorageService.getItem('selectedWorkers');
    this.totalRecords = this.selectedWorkers.length;
    this.selectedWorkers.forEach(element => {
      this.employementType = element.jobBidDetail.jobDetail.employmentType;
      this.yearlySalary = element.workerAnnualSalary;
      this.perDiem = element.jobBidDetail.jobDetail.perDiemRate;
      this.isPerDiem = element.jobBidDetail.jobDetail.isPerDiem;
      this.isPayForMileage = element.jobBidDetail.jobDetail.isPayForMilage;
      this.mileage = element.jobBidDetail.jobDetail.milageRate;
      this.jobBidId = element.jobBidDetail.id;
      this.jobDetailData = element.jobBidDetail.jobDetail;
    });
    this.setColumnOfTable();
    this._selectedColumns = this.columns.filter(x => x.selected == true);
    this.initializeForm();


  }
  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
  }
  initializeForm(): void {
    const jobBidDetail = new FormArray([]);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.selectedWorkers.length; i++) {
      if (this.employementType === 'FULL_TIME') {
        jobBidDetail.push(this.formBuilder.group({
          id: this.selectedWorkers[i].jobBidDetail.id,
          clientAnnualSalary: [''],
          clientSpecialNote: ['']
        }));
      }
      else {
        jobBidDetail.push(this.formBuilder.group({
          id: this.selectedWorkers[i].jobBidDetail.id,
          clientHourlyRate: [''],
          clientSpecialNote: [''],
          clientPerDiemRate: [this.perDiem],
          clientMilageRate: [this.mileage]
        }));
      }
      this.myForm = this.formBuilder.group({
        jobBidDetail,
        selectedColumns: this._selectedColumns
      });
    }
  }
  private setColumnOfTable(): void {
    if (this.employementType === 'FULL_TIME') {
      this.columns = [
        { label: this.translator.instant('worker'), value: 'jobBidDetail.worker.firstName', field: 'worker', sortable: true, selected: true },
        { label: this.translator.instant('job.title'), value: 'jobBidDetail.jobDetail.jobTitle.title', field: 'jobDetail', sortable: true, selected: false },
        // tslint:disable-next-line: max-line-length
        { label: this.translator.instant('yearly.rate'), value: 'jobBidDetail.workerAnnualSalary', field: 'workerAnnualSalary', sortable: true.valueOf, selected: true },
        { label: this.translator.instant('city'), value: 'jobBidDetail.jobDetail.city', field: 'workerCity', sortable: true, selected: false },
        { label: this.translator.instant('state'), value: 'jobBidDetail.jobDetail.state', field: 'workerState', sortable: true, selected: false },
        { label: this.translator.instant('total.experience'), value: 'workerTotalExperience', field: 'workerTotalExperience', sortable: true, selected: false },
        { label: this.translator.instant('job.average.rating'), value: 'workerAvgRating', field: 'workerAvgRating', sortable: true, selected: false },
        { label: this.translator.instant('job.success.ratio'), value: 'workerSuccessRatio', field: 'workerSuccessRatio', sortable: true, selected: false },
        // tslint:disable-next-line: max-line-length
        { label: this.translator.instant('tentative.start.date'), value: 'jobBidDetail.workerTentativeStartDate', field: 'workerTentativeStartDate', sortable: true, selected: false },
        { label: this.translator.instant('certificates'), value: 'certificates', field: 'certificates', sortable: false, selected: false },
        // tslint:disable-next-line: max-line-length
        { label: this.translator.instant('screening.questions'), value: 'screeningQuestions', field: 'screeningQuestions', sortable: false, selected: false },
        { label: this.translator.instant('offer.rate'), value: 'offerRate', field: 'offerRate', sortable: false, selected: true },
        { label: this.translator.instant('special.note'), value: '', field: 'clientSpecialNote', sortable: false, selected: true }
      ];
    }
    else {
      this.columns = [
        { label: this.translator.instant('worker'), value: 'jobBidDetail.worker.firstName', field: 'worker', sortable: true, selected: true },
        { label: this.translator.instant('job.title'), value: 'jobBidDetail.jobDetail.jobTitle.title', field: 'jobDetail', sortable: true, selected: false },
        // tslint:disable-next-line: max-line-length
        { label: this.translator.instant('hourly.rate'), value: 'jobBidDetail.workerHourlyRate', field: 'workerHourlyRate', sortable: true, selected: true },
        { label: this.translator.instant('city'), value: 'jobBidDetail.jobDetail.city', field: 'workerCity', sortable: true, selected: false },
        { label: this.translator.instant('state'), value: 'jobBidDetail.jobDetail.state', field: 'workerState', sortable: true, selected: false },
        { label: this.translator.instant('total.experience'), value: 'workerTotalExperience', field: 'workerTotalExperience', sortable: true, selected: false },
        { label: this.translator.instant('job.average.rating'), value: 'workerAvgRating', field: 'workerAvgRating', sortable: true, selected: false },
        { label: this.translator.instant('job.success.ratio'), value: 'workerSuccessRatio', field: 'workerSuccessRatio', sortable: true, selected: false },
        // tslint:disable-next-line: max-line-length
        { label: this.translator.instant('tentative.start.date'), value: 'jobBidDetail.workerTentativeStartDate', field: 'workerTentativeStartDate', sortable: true, selected: false },
        { label: this.translator.instant('certificates'), value: 'certificates', field: 'certificates', sortable: false, selected: false },
        // tslint:disable-next-line: max-line-length
        { label: this.translator.instant('screening.questions'), value: 'screeningQuestions', field: 'screeningQuestions', sortable: false, selected: false },
        { label: this.translator.instant('offer.rate'), value: 'offerRate', field: 'offerRate', sortable: false, selected: true },
        { label: this.translator.instant('special.note'), value: '', field: 'clientSpecialNote', sortable: false, selected: true }
      ];
    }


  }
  onLazyLoad(event): void {
    this.dataTableParam = {
      offset: 0,
      size: 10000,
      sortField: event.sortField,
      sortOrder: event.sortOrder === -1 ? 0 : 1,
      searchText: ''
    };
  }

  getJobBidCertificate(id): void {
    this.certificateFilterMap.set('JOB_BID_DETAIL_ID', id);
    const jsonObject = {};
    this.certificateFilterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: '',
      sortOrder: -1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobBidService.getJobBidCertificate(this.queryParam).subscribe(data => {
      this.certificates = data.data.result;
    });
  }
  getJobBidScreeningQuestions(id): void {
    this.certificateFilterMap.set('JOB_BID_DETAIL_ID', id);
    const jsonObject = {};
    this.certificateFilterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: this.offset,
      size: this.size,
      sortField: 'QUESTION_NO',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.jobBidService.getJobBidScreeningQuestions(this.queryParam).subscribe(data => {
      this.screeningQuestions = data.data.result;
    });
  }
  prepareQueryParam(paramObject): Params {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }
  showCertificateDialog(id): void {
    this.displayCertificate = true;
    this.getJobBidCertificate(id);
  }
  showScreeningQuestionsDialog(id): void {
    this.displayScreeningQuestions = true;
    this.getJobBidScreeningQuestions(id);
  }
  onCancel(): void {
    this.router.navigate([PATH_CONSTANTS.CLIENT_WORKER_COMPARISON]);
  }
  onOfferJob(): void {
    this.jobOfferData = this.myForm.value.jobBidDetail;
    this.jobBidDetailDTO = new JobBidDetailDTO();
    const offerJobList = [];
    let count = 0;
    let countDiem = 0;
    let countMileage = 0;
    this.jobOfferData.forEach(jobData => {
      if (this.employementType === 'FULL_TIME') {
        if (jobData.clientAnnualSalary > 0) {
          offerJobList.push(jobData);
          count++;
        }

      }
      else {
        if (this.isPerDiem) {
          if (jobData.clientPerDiemRate > 0) {
            countDiem++;
          }
          else {
            return false;

          }
        }
        if (this.isPayForMileage) {
          if (jobData.clientMilageRate > 0) {
            countMileage++;
          }
          else {
            return false;
          }
        }
        if (jobData.clientHourlyRate > 0) {
          offerJobList.push(jobData);
          count++;
        }
        else {
          return false;
        }
      }
    });
  
    if (offerJobList.length > 0) {
      offerJobList.forEach(element => {
        this.jobBidDetailDTO.id = element.id;
        this.jobBidDetailDTO.clientSpecialNote = element.clientSpecialNote;
        if (this.employementType === 'FULL_TIME') {
          this.jobBidDetailDTO.clientAnnualSalary = element.clientAnnualSalary;
        }
        else {
          this.jobBidDetailDTO.clientHourlyRate = element.clientHourlyRate;
          this.jobBidDetailDTO.clientPerDiemRate = element.clientPerDiemRate;
          this.jobBidDetailDTO.clientMilageRate = element.clientMilageRate;
        }
        this.jobBidService.offerJob(this.jobBidDetailDTO).subscribe(data => {
          if (data.statusCode === '200' && data.message === 'OK') {
            this.notificationService.success(this.translator.instant('job.offered'), '');
            this.router.navigate(['/client/worker-comparison']);
          }
        }, error => {
          this.notificationService.error(this.translator.instant('common.error'), '');
        });
      });
    }
    else {
      this.notificationService.error(this.translator.instant('Please fill atleast one offer rate'), '');
    }
  }
  redirectToWorker(id): void {
    CommonUtil.openWindow(PATH_CONSTANTS.PREVIEW_WORKER_PROFILE + '?user=' + id);
  }
  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
  hideCertificateDialog(): void {
    this.displayCertificate = false;
  }
  hideScreeningDialog(): void {
    this.displayScreeningQuestions = false;
  }
}
