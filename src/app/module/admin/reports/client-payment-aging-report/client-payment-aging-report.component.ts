import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateHelperService } from 'src/app/service/date-helper.service';
import { FilterLeftPanelDataService } from 'src/app/service/filter-left-panel-data.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { InvoiceService } from 'src/app/service/subcontractor-services/invoice.service';
import { CaptionConstants } from 'src/app/shared/CaptionConstants';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';

@Component({
  selector: 'app-client-payment-aging-report',
  templateUrl: './client-payment-aging-report.component.html',
  styleUrls: ['./client-payment-aging-report.component.css']
})
export class ClientPaymentAgingReportComponent implements OnInit {

  columns;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  myForm: FormGroup;
  agingDays = [
    { label: '1-30', value: 'ONE_TO_THIRTY' },
    { label: '31-60', value: 'THIRTY_ONE_TO_SIXTY' },
    { label: 'Above 60', value: 'ABOVE_SIXTY' },
  ]
  filteredAgingDays: any[];
  startDate;

  isFilterOpened = false;

  filterMap = new Map();
  globalFilter;
  datatableParam: DataTableParam;
  queryParam;
  clientNameParams: { name: any; };
  clients: any;

  data = [];
  dateErrorFlag = false;

  constructor(
    private captionChangeService: HeaderManagementService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private dateHelperService: DateHelperService,
    private notificationService: UINotificationService,
    private invoiceService: InvoiceService,
    private formBuilder: FormBuilder
  ) {
    this.captionChangeService.hideSidebarSubject.next(false);
    this.captionChangeService.hideHeaderSubject.next(true);

  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.CLIENT_PAYMENT_AGING);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.setColumnOfTable();
    this.initializeForm();
    this.setFilterCriteria();
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
  }

  onFilterOpen() {
    this.isFilterOpened = !this.isFilterOpened;
  }

  setColumnOfTable(): void {
    this.columns = [
      { label: 'Client Name', value: 'client.firstName', sortable: true, isHidden: false, field: 'name' },
      { label: 'Client Invoice Number', value: 'invoiceNumber', sortable: true, isHidden: false, field: 'invoiceNumber' },
      { label: 'Client Invoice Date', value: 'invoiceDate', sortable: true, isHidden: false, field: 'invoiceDate' },
      { label: 'Client Invoice Amount', value: 'invoiceAmount', sortable: true, isHidden: false, field: 'invoiceAmount' },
      { label: 'Payment Expected Date', value: 'paymentExpectedDate', sortable: true, isHidden: false, field: 'paymentDate' },
      { label: 'Overdue by', value: 'overdueDate', sortable: false, isHidden: false, field: 'overdueDate' },
    ]
  }

  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      agingDays: [],
      clientName: [],
      startDate: [],
      endDate: []
    });
  }


  filter(): void {

    const filterMap = new Map();
    const datePipe = new DatePipe('en-US');
    this.dateErrorFlag = false;

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

    filterMap.set('TO_TYPE', 'PLATFORM_TO_CLIENT');
    filterMap.set('STATUS', 'DUE');

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

    if (this.myForm.value.agingDays) {
      filterMap.set('AGING_DAYS', this.myForm.value.agingDays.value);
    }

    if (this.myForm.value.clientName) {
      filterMap.set('CLIENT_ID', this.myForm.value.clientName.id);
    }

    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    if (!this.dateErrorFlag) {
      this.globalFilter = JSON.stringify(jsonObject);
      this.datatableParam = {
        offset: 0,
        size: 1000000,
        sortField: '',
        sortOrder: 1,
        searchText: this.globalFilter
      };

      this.queryParam = this.prepareQueryParam(this.datatableParam);
      this.invoiceService.getAllInvoices(this.queryParam).subscribe(data => {

        this.data = data.data.result;
      });
    }
    else {
      this.notificationService.error('Enter appropriate Date Range', '');
    }
  }

  clear(): void {
    this.myForm.reset();
    this.filter();
  }



  filterAgingDays(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.agingDays.length; i++) {
      const agingDays = this.agingDays[i];
      if (agingDays.label.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(agingDays);
      }
    }
    this.filteredAgingDays = filtered;
    this.filteredAgingDays = this.filteredAgingDays.sort();
  }


  setFilterCriteria() {
    this.filterMap.clear();
    this.filterMap.set('TO_TYPE', 'PLATFORM_TO_CLIENT');
    this.filterMap.set('STATUS', 'DUE');
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: 0,
      size: 100000,
      sortField: 'CLIENT_NAME',
      sortOrder: 1,
      searchText: this.globalFilter
    };

    this.loadDataForInvoices();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams;
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadDataForInvoices() {
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.invoiceService.getAllInvoices(this.queryParam).subscribe(data => {
      console.log(data);

      this.data = data.data.result;
    });
  }


  countOverdueBy(paymentExpectedDate) {
    const datePipe = new DatePipe('en-US');
    const value1 = datePipe.transform(paymentExpectedDate, 'yyyy-MM-dd');

    let date11 = new Date(value1);
    let date22 = new Date();

    var Difference_In_Time = date22.getTime() - date11.getTime();

    var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    return Math.floor(Difference_In_Days);
  }

  getClientByName(name): void {
    this.clientNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.clientNameParams);
    this.filterLeftPanelService.getClientByName(this.queryParam).subscribe(data => {
      this.clients = data.data;
      this.clients = this.clients.sort();
    });
  }
  exportExcelClientPaymentReport() {
    const datePipe = new DatePipe('en-US');
    let excelData = [];
    this.data.forEach(element => {
      const invoiceDate = datePipe.transform(element.invoiceDate, 'MM-dd-yyyy');
      const paymentExpectedDate = datePipe.transform(element.paymentExpectedDate, 'MM-dd-yyyy');
      let JSON = {
        'Client Name': element.client.firstName + ' ' + element.client.lastName,
        'Client Invoice Number': element.invoiceNumber,
        'Client Invoice Date': invoiceDate,
        'Client Invoice Amount': element.invoiceAmount,
        'Payment Expected Date': paymentExpectedDate,
        'Overdue by': this.countOverdueBy(element.paymentExpectedDate) > 0 ? this.countOverdueBy(element.paymentExpectedDate) : '0'
      }
      excelData.push(JSON);
    });

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(excelData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "client-payment");
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
