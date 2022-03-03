import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
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
  selector: 'app-subcontractor-payout-aging-report',
  templateUrl: './subcontractor-payout-aging-report.component.html',
  styleUrls: ['./subcontractor-payout-aging-report.component.css']
})
export class SubcontractorPayoutAgingReportComponent implements OnInit {

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
  filterMap = new Map();
  globalFilter;
  datatableParam: DataTableParam;
  queryParam;

  data = [];

  subcontractorNameParams: { name: any; };
  filterSubcontractors: any;

  dateErrorFlag = false;
  isFilterOpened = false;

  _selectedColumns: any[];

  constructor(
    private captionChangeService: HeaderManagementService,
    private invoiceService: InvoiceService,
    private dateHelperService: DateHelperService,
    private notificationService: UINotificationService,
    private filterLeftPanelService: FilterLeftPanelDataService,
    private formBuilder: FormBuilder
  ) {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(false);
    this.captionChangeService.captionchangerSubject.next(CaptionConstants.SUBCONTRSCTOR_PAYOUT_AGING);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.setColumnOfTable();
    this.initializeForm();
    this.setFilterCriteria();
    this._selectedColumns = this.columns.filter(a => a.selected == true);
  }

  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
  }
  setColumnOfTable(): void {
    this.columns = [
      { label: 'Subcontractor Name', value: 'client.firstName', sortable: true, isHidden: false, field: 'name', selected: true },
      { label: 'Subcontractor Invoice Number', value: 'invoiceNumber', sortable: true, isHidden: false, field: 'invoiceNumber', selected: true },
      { label: 'Subcontractor Invoice Date', value: 'invoiceDate', sortable: true, isHidden: false, field: 'invoiceDate', selected: true },
      { label: 'Subcontractor Invoice Amount', value: 'invoiceAmount', sortable: true, isHidden: false, field: 'invoiceAmount', selected: true },
      { label: 'Payment Expected Date', value: 'paymentExpectedDate', sortable: true, isHidden: false, field: 'paymentDate', selected: false },
      { label: 'Overdue by', value: 'overdueDate', sortable: false, isHidden: false, field: 'overdueDate', selected: false },
    ]
  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      agingDays: [],
      subcontractorName: [],
      startDate: [],
      endDate: []
    });
  }

  onFilterOpen() {
    this.isFilterOpened = !this.isFilterOpened;
  }

  filter(): void {

    const filterMap = new Map();
    const date = new Date();
    const datePipe = new DatePipe('en-US');
    const valueOfDate = datePipe.transform(date, 'yyyy-MM-dd 00:00:00');
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

    filterMap.set('TO_TYPE', 'SUBCONTRACTOR_TO_PLATFORM');
    filterMap.set('STATUS', 'DUE');
    filterMap.set('DUE_DATE_LESS_THAN_EQUAL', valueOfDate);

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

    if (this.myForm.value.subcontractorName) {
      filterMap.set('SUBCONTRACTOR_ID', this.myForm.value.subcontractorName.id);
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
    const date = new Date();
    const datePipe = new DatePipe('en-US');
    const valueOfDate = datePipe.transform(date, 'yyyy-MM-dd 00:00:00');
    this.filterMap.set('DUE_DATE_LESS_THAN_EQUAL', valueOfDate);
    this.filterMap.set('TO_TYPE', 'SUBCONTRACTOR_TO_PLATFORM');
    this.filterMap.set('STATUS', 'DUE');

    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: 0,
      size: 100000,
      sortField: 'SUBCONTRACTOR_NAME',
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


  getSubcontractorByName(name): void {
    this.subcontractorNameParams = {
      name: name.query
    };
    this.queryParam = this.prepareQueryParam(this.subcontractorNameParams);
    this.filterLeftPanelService.getSubcontractorByName(this.queryParam).subscribe(data => {
      this.filterSubcontractors = data.data;
      this.filterSubcontractors = this.filterSubcontractors.sort();
    });
  }
  exportExcelSubcontractorPaymentReport() {
    const datePipe = new DatePipe('en-US');
    let excelData = [];
    this.data.forEach(element => {
      const invoiceDate = datePipe.transform(element.invoiceDate, 'MM-dd-yyyy');
      const paymentExpectedDate = datePipe.transform(element.paymentExpectedDate, 'MM-dd-yyyy');
      let JSON = {
        'Subcontractor Name': element.subContractor.firstName + ' ' + element.subContractor.lastName,
        'Subcontractor Invoice Number': element.invoiceNumber,
        'Subcontractor Invoice Date': invoiceDate,
        'Subcontractor Invoice Amount': element.invoiceAmount,
        'Payment Expected Date': paymentExpectedDate,
        'Overdue by': this.countOverdueBy(element.paymentExpectedDate) > 0 ? this.countOverdueBy(element.paymentExpectedDate) : '0'
      }
      excelData.push(JSON);
    });

    import("xlsx").then(xlsx => {
      const worksheet = xlsx.utils.json_to_sheet(excelData);
      const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
      const excelBuffer: any = xlsx.write(workbook, { bookType: 'xlsx', type: 'array' });
      this.saveAsExcelFile(excelBuffer, "subcontractor-payment");
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

  @Input() get selectedColumns(): any[] {
    return this._selectedColumns;
  }

  set selectedColumns(val: any[]) {
    this._selectedColumns = this.columns.filter(col => val.includes(col));
  }
}
