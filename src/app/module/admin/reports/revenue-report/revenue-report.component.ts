import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, Subject } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { InvoiceService } from 'src/app/service/subcontractor-services/invoice.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { InvoiceDTO } from '../../vos/InvoiceDTO';
import { RevenueReportDTO } from '../../vos/revenueReportDTO';

@Component({
  selector: 'app-revenue-report',
  templateUrl: './revenue-report.component.html',
  styleUrls: ['./revenue-report.component.css']
})
export class RevenueReportComponent implements OnInit {


  columns;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  myForm: FormGroup;
  revenueSource = [
    { label: 'All', value: 'All' },
    { label: 'Projects', value: 'PROJECT' },
    { label: 'Jobs ', value: 'JOB' },
  ];
  reportPeriod = [
    { label: 'Current month', value: 'Current month' },
    { label: 'Last Month', value: 'Last Month' },
    { label: 'Last 3 Months', value: 'Last 3 Months' },
    { label: 'Last 6 Months', value: 'Last 6 Months' },
    { label: 'Last 12 Months', value: 'Last 12 Months' },
    { label: 'Specify Date Range', value: 'Specify Date Range' },
    { label: 'All', value: 'All' },
  ];
  filteredRevenueSource: any[];
  filteredReportPeriod: any[];
  startDate;
  dataTableParam = new DataTableParam();
  queryParam;
  invoicesList = [];
  groupedInvoices: any[];
  invoiceDTOList: InvoiceDTO[] = [];
  revenueReportDTOList: RevenueReportDTO[] = [];
  groupedInvoicesForCloseout: any[];
  groupedInvoicesForJob: any[];
  globalFilter: string;
  revenueResourceData;
  dateErrorFlag: boolean;
  reportPeriodData;
  isFilterOpened: boolean;

  constructor(
    private captionChangeService: HeaderManagementService,
    private formBuilder: FormBuilder,
    private invoiceService: InvoiceService,
    private dateHelperService: DateHelperService,
    private notificationService: UINotificationService,
    private translator: TranslateService) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.REVENUE_REPORT);
  }

  ngOnInit(): void {
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.REVENUE_REPORT);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.setColumnOfTable();
    this.initializeForm();
    this.setDefaultCriteria();
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
  }
  setColumnOfTable(): void {
    this.columns = [
      { label: 'Month', value: 'month', sortable: true, isHidden: false, field: 'month' },
      { label: 'Transactions', value: 'transactions', sortable: true, isHidden: false, field: 'transactions' },
      { label: 'Payment Received', value: 'paymentReceived', sortable: true, isHidden: false, field: 'paymentReceived' },
      { label: 'Payment Sent', value: 'paymentSent', sortable: true, isHidden: false, field: 'paymentSent' },
      { label: 'Net Revenue', value: 'netRevenue', sortable: false, isHidden: false, field: 'netRevenue' },
    ];
  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      revenueSource: [],
      clientProjectName: [],
      jobWorkerName: [],
      reportPeriod: [],
      startDate: [],
      endDate: []
    });
  }
  filter(): void {
    this.dateErrorFlag = false;
    const filterMap = new Map();
    const datePipe = new DatePipe('en-US');
    if (((this.myForm.value.startDate && !this.myForm.value.endDate) ||
      (!this.myForm.value.startDate && this.myForm.value.endDate))) {
      this.dateErrorFlag = true;
    }
    if (!this.myForm.value.startDate && !this.myForm.value.endDate) {
      this.dateErrorFlag = false;
    }

    if (this.myForm.value.startDate > this.myForm.value.endDate) {
      this.dateErrorFlag = true;
    }

    if (this.myForm.value.revenueSource) {
      if (this.myForm.value.revenueSource.value === 'All') {
      }
      else if (this.myForm.value.revenueSource.value === 'PROJECT') {
        filterMap.set('TYPE', 'PROJECT');
      }
      else if (this.myForm.value.revenueSource.value === 'JOB') {
        filterMap.set('TYPE', 'JOB');
      }
    }
    if (this.myForm.value.startDate) {
      this.dateHelperService.setStartDate(this.myForm.value.startDate);
      const value = datePipe.transform(this.myForm.value.startDate, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('INVOICE_DATE_FROM', value);
    }
    if (this.myForm.value.endDate) {
      this.dateHelperService.setEndDate(this.myForm.value.endDate);
      const valueEnd = datePipe.transform(this.myForm.value.endDate, 'yyyy-MM-dd HH:mm:ss');
      filterMap.set('INVOICE_DATE_TO', valueEnd);
    }
    if (this.myForm.value.reportPeriod) {
      if (this.myForm.value.reportPeriod === 'Last Month') {
        filterMap.set('LAST_MONTH', 'LAST_MONTH');
      }
      if (this.myForm.value.reportPeriod === 'Current month') {
        filterMap.set('CURRENT_MONTH', '');
      }
      if (this.myForm.value.reportPeriod === 'Last 3 Months') {
        filterMap.set('LAST_3_MONTHS', 'LAST_3_MONTHS');
      }
      if (this.myForm.value.reportPeriod === 'Last 6 Months') {
        filterMap.set('LAST_6_MONTHS', 'LAST_6_MONTHS');
      }
      if (this.myForm.value.reportPeriod === 'Last 12 Months') {
        filterMap.set('LAST_YEAR', 'LAST_YEAR');
      }
      if (this.myForm.value.reportPeriod === 'All') {

      }
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    if (!this.dateErrorFlag) {
      this.globalFilter = JSON.stringify(jsonObject);
      this.dataTableParam = {
        offset: 0,
        size: 10000,
        sortField: '',
        sortOrder: 1,
        searchText: this.globalFilter
      };

      this.getInvoiceList();
    }
    else {
      this.notificationService.error(this.translator.instant('please.enter.appropriate.date.range'), '');

    }

  }
  clear(): void {
    this.myForm.reset();
    this.setDefaultCriteria();
  }
  filterReportPeriod(event): void {
    const filtered: any[] = [];
    const query = event.query;

    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.reportPeriod.length; i++) {
      const reportPeriod = this.reportPeriod[i];
      if (reportPeriod.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(reportPeriod);
      }
    }
    this.filteredReportPeriod = filtered;
    this.filteredReportPeriod = this.filteredReportPeriod.sort();
  }
  setDefaultCriteria() {
    let filterMap = new Map();
    // filterMap.set('STATUS', 'PAID');
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParam = {
      offset: 0,
      size: 1000,
      sortField: '',
      sortOrder: 1,
      searchText: null
    };
    this.getInvoiceList();
  }
  getInvoiceList(): void {
    this.invoicesList = [];
    this.queryParam = this.prepareQueryParam(this.dataTableParam);
    this.invoiceService.getAllInvoices(this.queryParam).subscribe(data => {

      this.invoicesList = data.data.result;
      this.invoiceDTOList = [];
      this.invoicesList.forEach(element => {
        const invoiceDTO = new InvoiceDTO();
        const datePipe = new DatePipe('en-US');
        // const value = datePipe.transform(element.invoiceDate, 'MM-yyyy');
        const value = new Date(element.invoiceDate).toLocaleString('en-us', { month: 'long', year: 'numeric' });
        invoiceDTO.closeOutPackageRequest = element.closeOutPackageRequest;
        invoiceDTO.subContractor = element.subContractor;
        invoiceDTO.client = element.client;
        invoiceDTO.worker = element.worker;
        invoiceDTO.type = element.type;
        invoiceDTO.toType = element.toType;
        invoiceDTO.status = element.status;
        invoiceDTO.invoiceNumber = element.invoiceNumber;
        invoiceDTO.invoiceAmount = element.invoiceAmount;
        invoiceDTO.invoiceDocName = element.invoiceDocName;
        invoiceDTO.invoiceDocPath = element.invoiceDocPath;
        invoiceDTO.invoiceDate = value;
        invoiceDTO.invoicePaidDate = element.invoicePaidDate;
        invoiceDTO.platformMarginCost = element.platformMarginCost;
        invoiceDTO.weekStart = element.weekStart;
        invoiceDTO.weekEnd = element.weekEnd;
        invoiceDTO.jobBidDetail = element.jobBidDetail;

        this.invoiceDTOList.push(invoiceDTO);
      });

      this.groupByInvoices();
    });
  }
  // tslint:disable-next-line: typedef
  prepareQueryParam(paramObject) {
    // tslint:disable-next-line: new-parens
    const params = new URLSearchParams;
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  groupByInvoices(): void {
    this.groupedInvoices = [];
    const records = this.invoiceDTOList;

    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: any) => x.invoiceDate,
        null,
        null,
        () => new ReplaySubject()
      ),
      concatMap(
        object => object.pipe(
          toArray(),
          map((obj: any) =>
            ({ key: object.key, value: obj })
          ))
      )
    );
    // tslint:disable-next-line: deprecation
    result.subscribe(x => {
      this.groupedInvoices.push(x);
    });
    records.forEach(x => { pipedRecords.next(x); });
    pipedRecords.complete();

    this.setInvoiceData(this.groupedInvoices);
  }
  setInvoiceData(groupedInvoices) {
    this.revenueReportDTOList = [];
    const datePipe = new DatePipe('en-US');
    groupedInvoices.forEach(element => {
      const revenueReportDTO = new RevenueReportDTO();
      const value = new Date(element.key);
      // const value = datePipe.transform(element.key, 'MM-yyyy');
      revenueReportDTO.month = element.key;
      revenueReportDTO.transactions = Math.ceil((element.value.length) / 2);
      revenueReportDTO.paymentReceived = 0;
      revenueReportDTO.paymentSent = 0;
      element.value.forEach(elementData => {
        switch (elementData.toType) {
          case 'WORKER_TO_PLATFORM':
            revenueReportDTO.paymentReceived += elementData.invoiceAmount;
            break;
          case 'SUBCONTRACTOR_TO_PLATFORM':
            revenueReportDTO.paymentReceived += elementData.invoiceAmount;
            break;

          case 'PLATFORM_TO_CLIENT':
            revenueReportDTO.paymentSent += elementData.invoiceAmount;
            break;
          default:
            break;
        }
      });
      this.revenueReportDTOList.push(revenueReportDTO);
    });

  }
  get sortData() {
    return this.revenueReportDTOList.sort((a, b) => {
      return <any>new Date(b.month) - <any>new Date(a.month);
    });
  }
  calculateNetRevenue(paymentReceived, paymentSent) {
    return Math.abs(paymentReceived - paymentSent);
  }
  onSelectRevenueSource(event) {


    if (event.value === 'PROJECT') {
      this.myForm.removeControl('jobWorkerName');
      this.myForm.addControl('clientProjectName', new FormControl());
    }
    if (event.value === 'JOB') {
      this.myForm.removeControl('clientProjectName');
      this.myForm.addControl('jobWorkerName', new FormControl());

    }
  }
  onSelectReportPeriod(event) {
    if (event.value === 'Specify Date Range') {
      this.myForm.addControl('startDate', new FormControl());
      this.myForm.addControl('endDate', new FormControl());
    }
    else {
      this.myForm.removeControl('startDate');
      this.myForm.removeControl('endDate');
    }
  }
  onFilterOpen() {
    this.isFilterOpened = !this.isFilterOpened;
  }
  exportExcelRevenue() {

    let excelData = [];
    this.sortData.forEach(element => {
      let JSON = {
        'Month': element.month,
        'Transactions': element.transactions,
        'Payment Received': element.paymentReceived,
        'Payment Sent': element.paymentSent,
        'Net Revenue': this.calculateNetRevenue(element.paymentReceived, element.paymentSent),
      }
      excelData.push(JSON);
    });

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(excelData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "revenue-report");
    });
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    import("file-saver").then(FileSaver => {
      let EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
      let EXCEL_EXTENSION = '.xlsx';
      const data: Blob = new Blob([buffer], {
        type: EXCEL_TYPE
      });
      FileSaver.saveAs(data, fileName + EXCEL_EXTENSION);
    });
  }
}
