import { DatePipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { ApproveClientService } from 'src/app/service/admin-services/approve-client.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ReimbursementService } from 'src/app/service/worker-services/reimbursement.service';
import { TimesheetService } from 'src/app/service/worker-services/timesheet.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { ApproveRejectTimeSheetDTO } from '../../client/Vos/ApproveRejectTimeSheetDTO';
import { ApproveClientDetailDTO } from '../approve-client/ApproveClientDetailDTO';
import { TimesheetPaySummaryDTO } from '../vos/TimesheetPaySummaryDTO';
@Component({
  selector: 'app-view-timesheet-details',
  templateUrl: './view-timesheet-details.component.html',
  styleUrls: ['./view-timesheet-details.component.css']
})
export class ViewTimesheetDetailsComponent implements OnInit {

  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  userId: any;
  jobTitle: any;
  jobID: any;
  workWeekStartDate;
  myForm: FormGroup;
  maxEndDate;
  dayWiseColumns = [{ label: 'Work Date', value: 'workDate', sortable: true, isHidden: false, field: 'workDate', selected: true },
  { label: 'Hours Worked', value: 'workHour', sortable: false, isHidden: false, field: 'workHour', selected: true },
  { label: 'Work Description', value: 'workDescription', sortable: false, isHidden: false, field: 'workDescription', selected: true },
  { label: 'Total Miles Travelled', value: 'totalMilesTravelled', sortable: true, isHidden: false, field: 'totalMilesTravelled', selected: true },
  { label: 'Non Billable Miles', value: 'nonBillableMiles', sortable: true, isHidden: false, field: 'nonBillableMiles', selected: false },
  { label: 'Billable Miles', value: 'billableMiles', sortable: false, isHidden: false, field: 'billableMiles', selected: true },
  { label: 'Mileage Description', value: 'milageDescription', sortable: false, isHidden: false, field: 'milageDescription', selected: false },
  { label: 'File Attachment', value: 'attachment', sortable: false, isHidden: false, field: 'attachment', selected: false },
  { label: 'Status', value: 'status', sortable: false, isHidden: false, field: 'status', selected: false }
  ];
  reimbursementColumns = [
    { label: 'Reimbursement Raised Date', value: 'CREATED_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE', selected: false },
    { label: 'Reimbursements Title', value: 'title', sortable: true, isHidden: false, field: 'title', selected: true },
    { label: 'Description', value: 'description', sortable: true, isHidden: false, field: 'description', selected: true },
    { label: 'Amount', value: 'amount', sortable: true, isHidden: false, field: 'amount', selected: false },
    { label: 'Off Cycle', value: 'offCycle', sortable: false, isHidden: false, field: 'offCycle', selected: false },
    { label: 'Attachment', value: 'attachment', sortable: false, isHidden: false, field: 'attachment', selected: false }
  ];
  paySummaryColumns = [
    { label: 'Specifications', value: 'specifications', sortable: true, isHidden: false, field: 'specifications' },
    { label: 'Quantity', value: 'quantity', sortable: true, isHidden: false, field: 'quantity' },
    { label: 'Rate', value: 'rate', sortable: true, isHidden: false, field: 'rate' },
    { label: 'Amount', value: 'amount', sortable: true, isHidden: false, field: 'amount' },
  ];
  workWeekEndDate = new Date();
  date1: Date;
  reimbursementList: any;
  queryParamReimbursement: any;
  dataTableParamForReimbursement = new DataTableParam();
  globalFilter: string;
  timesheetList = [];
  queryParamForTimesheet: URLSearchParams;
  datatableParamForTimesheet = new DataTableParam();
  totalWorkHours: number;
  totalBillableMiles: number;
  timesheetPaySummaryList: TimesheetPaySummaryDTO[] = [];
  billMilesForPayment: number;
  workHoursForPayment: number;
  totalOvertimeHours: number;
  amountWorkHours: number;
  amountOverTimeHours: number;
  amountDiem: number;
  amountMilage: number;
  amountReimbursement: number;
  totalAmount: number;
  filterFlag = false;
  totalFlag = true;
  myRejectForm: FormGroup;
  rejectDialog: boolean;
  isFilterOpened = false;
  approvedRejectedFlag: boolean;
  _selectedReimbursementColumns: any[];
  _selectedDayWiseColumns: any[];
  dataTableParamForReimbursementAttachment = new DataTableParam();
  queryParam;
  timesheetData: any;
  overTimeHours = 0;
  approveClientDTO: ApproveClientDetailDTO;
  hasOvertimePayRateApplied = false;
  totalWorkHoursForCalculation: number;
  constructor(private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService,
    private router: Router,
    private route: ActivatedRoute,
    private reimbursementService: ReimbursementService,
    private localStorageService: LocalStorageService,
    private timesheetService: TimesheetService,
    private notificationService: UINotificationService,
    private translator: TranslateService,
    private approveClientService: ApproveClientService) {
    this.captionChangeService.hideHeaderSubject.next(true);
    // this.captionChangeService.captionchangerSubject.next(CaptionConstants.TIMESHEET_DETAILS);
    this.captionChangeService.hideSidebarSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.captionChangeService.hideSidebarSubject.next(true);
    this.getOvertimeClientDetiail();
    this.timesheetData = this.localStorageService.getItem('timesheetData');
    // this.captionChangeService.captionchangerSubject.next(CaptionConstants.TIMESHEET_DETAILS);
    this.initializeForm();
    this.setDefaultCriteriaForTimeSheet();
    this.setDefaultCriteriaForReimbursement();
    this._selectedReimbursementColumns = this.reimbursementColumns.filter(a => a.selected == true);
    this._selectedDayWiseColumns = this.dayWiseColumns.filter(a => a.selected == true);
    this.myForm.get('workerWeekStart').valueChanges.subscribe(data => {
      this.workWeekEndDate = new Date(data);
      this.workWeekEndDate.setDate(this.workWeekEndDate.getDate() + 6);
      if (data === undefined) {
        this.myForm.get('workerWeekEnd').patchValue(null);
      }
      else {
        this.myForm.get('workerWeekEnd').patchValue(this.workWeekEndDate);
      }

    });
  }
  ngOnDestroy(): void {
    this.captionChangeService.hideSidebarSubject.next(false);
    this.captionChangeService.hideHeaderSubject.next(false);
    this.localStorageService.removeItem('timesheetData');
  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      workerWeekStart: [],
      workerWeekEnd: [],
    });
  }
  filter(): void {
    this.filterFlag = true;
    this.setDefaultCriteriaForTimeSheet();
    this.setDefaultCriteriaForReimbursement();
  }
  clear(): void {
    this.filterFlag = false;
    this.myForm.reset();
    this.setDefaultCriteriaForTimeSheet();
    this.setDefaultCriteriaForReimbursement();
  }
  getReimbursementList(): void {
    this.queryParamReimbursement = this.prepareQueryParam(this.dataTableParamForReimbursement);
    this.reimbursementService.getReimbursementList(this.queryParamReimbursement).subscribe(data => {

      if (data.data.totalRecords > 0) {
        this.reimbursementList = data.data.result;
        this.totalRecords = data.data.totalRecords;
        this.amountReimbursement = 0;
        this.reimbursementList.forEach(element => {
          this.amountReimbursement += element.amount;
        });
      }
      else {
        this.reimbursementList = [];
        this.amountReimbursement = 0;
      }

      // this.calculateTotalAmount(this.amountReimbursement);
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
  setDefaultCriteriaForReimbursement(): void {
    const filterMap = new Map();
    const timesheetData = this.localStorageService.getItem('timesheetData');
    filterMap.set('JOB_DETAIL_ID', timesheetData.jobBidDetail.jobDetail.id);
    filterMap.set('WORKER_ID', timesheetData.worker.id);
    filterMap.set('OFFCYCLE', false);
    const datePipe = new DatePipe('en-US');
    if (this.filterFlag) {
      const value = datePipe.transform(this.myForm.value.workerWeekStart, 'yyyy-MM-dd 00:00:00');
      filterMap.set('WEEK_START', value);
      const valueEnd = datePipe.transform(this.myForm.value.workerWeekEnd, 'yyyy-MM-dd 00:00:00');
      filterMap.set('WEEK_END', valueEnd);
    }
    else {
      const value = datePipe.transform(timesheetData.weekStart, 'yyyy-MM-dd 00:00:00');
      filterMap.set('WEEK_START', value);
      const valueEnd = datePipe.transform(timesheetData.weekEnd, 'yyyy-MM-dd 00:00:00');
      filterMap.set('WEEK_END', valueEnd);
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParamForReimbursement = {
      offset: 0,
      size: 10000,
      sortField: '',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.getReimbursementList();
  }
  downloadDocuments(id): void {
    let filterMap = new Map();
    filterMap.set('JOB_REIMBURSEMENT_ID', id);
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.dataTableParamForReimbursementAttachment = {
      offset: 0,
      size: this.size,
      sortField: 'CREATED_DATE',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.dataTableParamForReimbursementAttachment);
    this.reimbursementService.getAttachments(this.queryParam).subscribe(data => {

      let attachmentsList = data.data.result;
      if (attachmentsList.length > 0) {
        this.reimbursementService.downloadReimbursementAttachments(id).subscribe(data => {

          const blob = new Blob([data], { type: 'application/zip' });
          const fileName = 'Reimbursements';
          saveAs(blob, fileName);
          // this.onLoadJob();
        });
      }
      else {
        this.notificationService.error('No attachments present', '');
      }
    });
  }
  setDefaultCriteriaForTimeSheet(): void {
    const filterMap = new Map();
    const timesheetData = this.localStorageService.getItem('timesheetData');
    filterMap.set('JOB_ID', timesheetData.jobBidDetail.jobDetail.id);
    filterMap.set('WORKER_ID', timesheetData.worker.id);

    const datePipe = new DatePipe('en-US');
    if (this.filterFlag) {
      const value = datePipe.transform(this.myForm.value.workerWeekStart, 'yyyy-MM-dd 00:00:00');
      filterMap.set('WEEK_START', value);
      const valueEnd = datePipe.transform(this.myForm.value.workerWeekEnd, 'yyyy-MM-dd 00:00:00');
      filterMap.set('WEEK_END', valueEnd);
    }
    else {
      const value = datePipe.transform(timesheetData.weekStart, 'yyyy-MM-dd 00:00:00');
      filterMap.set('WEEK_START', value);
      const valueEnd = datePipe.transform(timesheetData.weekEnd, 'yyyy-MM-dd 00:00:00');
      filterMap.set('WEEK_END', valueEnd);
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParamForTimesheet = {
      offset: 0,
      size: 10000,
      sortField: 'WORK_START_DATE',
      sortOrder: 1,
      searchText: this.globalFilter
    };
    this.getTimesheetData();
  }
  getTimesheetData(): void {
    this.approvedRejectedFlag = false;
    this.queryParamForTimesheet = this.prepareQueryParam(this.datatableParamForTimesheet);
    this.timesheetService.getTimesheetList(this.queryParamForTimesheet).subscribe(data => {
      console.log(data);
      this.totalWorkHours = 0;
      this.totalWorkHoursForCalculation = 0;
      this.totalBillableMiles = 0;
      this.totalOvertimeHours = 0;
      if (data.data.totalRecords > 0) {
        const timesheetListData = data.data.result;
        this.timesheetList = (timesheetListData);

        this.timesheetList.forEach(data => {
          this.totalWorkHours += data.workHour;
          this.totalWorkHours = parseFloat((this.totalWorkHours).toFixed(2));
          this.totalBillableMiles += data.billableMiles;
          this.totalOvertimeHours += data.overtimeHour;
          if (data.status === 'APPROVED' || data.status === 'REJECTED') {
            this.approvedRejectedFlag = true;
          }
        });
      }
      else {
        this.timesheetList.length = 0;
      }
      this.setPaymentSummary(this.timesheetList);
    });
  }
  setPaymentSummary(timesheetList): void {
    if (timesheetList.length === 0) {
      this.totalFlag = false;
    }
    this.timesheetPaySummaryList.length = 0;

    const timesheetLength = this.timesheetList.length;
    this.amountWorkHours = 0;
    this.amountOverTimeHours = 0;
    this.amountDiem = 0;
    this.amountMilage = 0;
    this.overTimeHours = 0;
    timesheetList.forEach(timesheetData => {
      if (this.totalWorkHours > 40) {
        this.overTimeHours = this.totalWorkHours - 40;
        this.totalWorkHoursForCalculation = this.totalWorkHours - this.overTimeHours;
      }
      else {
        this.totalWorkHoursForCalculation = this.totalWorkHours;
      }
      this.totalWorkHoursForCalculation = parseFloat((this.totalWorkHoursForCalculation).toFixed(2));
      this.amountWorkHours = this.totalWorkHoursForCalculation * timesheetData.jobBidDetail.clientHourlyRate;
      if (this.overTimeHours > 0) {
        if (this.hasOvertimePayRateApplied) {
          let temp = (timesheetData.jobBidDetail.clientHourlyRate * 1.5);
          this.amountOverTimeHours = this.overTimeHours * temp;
        }
        else if (!this.hasOvertimePayRateApplied) {
          let temp1 = (timesheetData.jobBidDetail.clientHourlyRate);
          this.amountOverTimeHours = this.overTimeHours * temp1;
        }
      }

      if (timesheetData.jobBidDetail.jobDetail.isPerDiem) {
        this.amountDiem = timesheetLength * timesheetData.jobBidDetail.clientPerDiemRate;
      }
      else {
        this.amountDiem = 0;
      }
      if (timesheetData.jobBidDetail.jobDetail.isPayForMilage) {
        this.totalBillableMiles = parseFloat((this.totalBillableMiles).toFixed(2));
        this.amountMilage = this.totalBillableMiles * timesheetData.jobBidDetail.clientMilageRate;
      }
      else {
        this.amountMilage = 0;
      }
      const timesheetPaySummaryDTO = new TimesheetPaySummaryDTO('Regular Hours',
        this.totalWorkHoursForCalculation, timesheetData.jobBidDetail.clientHourlyRate, this.amountWorkHours);
      this.timesheetPaySummaryList.push(timesheetPaySummaryDTO);
      if (this.overTimeHours > 0) {
        this.overTimeHours = parseFloat((this.overTimeHours).toFixed(2));
        if (this.hasOvertimePayRateApplied) {
          const timesheetPaySummaryDTOForOverTime = new TimesheetPaySummaryDTO('Overtime Hours',
            this.overTimeHours,
            ((timesheetData.jobBidDetail.clientHourlyRate * 1.5)), this.amountOverTimeHours);
          this.timesheetPaySummaryList.push(timesheetPaySummaryDTOForOverTime);
        }
        else if (!this.hasOvertimePayRateApplied) {
          const timesheetPaySummaryDTOForOverTime = new TimesheetPaySummaryDTO('Overtime Hours',
            this.overTimeHours,
            ((timesheetData.jobBidDetail.clientHourlyRate)), this.amountOverTimeHours);
          this.timesheetPaySummaryList.push(timesheetPaySummaryDTOForOverTime);
        }
      }
      if (timesheetData.jobBidDetail.jobDetail.isPerDiem) {
        const timesheetPaySummaryDTO = new TimesheetPaySummaryDTO('Per Diem',
          timesheetLength, timesheetData.jobBidDetail.clientPerDiemRate, this.amountDiem);
        this.timesheetPaySummaryList.push(timesheetPaySummaryDTO);
      }
      else {
        const timesheetPaySummaryDTO = new TimesheetPaySummaryDTO('Per Diem',
          'N/A', 'N/A', this.amountDiem);
        this.timesheetPaySummaryList.push(timesheetPaySummaryDTO);
      }
      if (timesheetData.jobBidDetail.jobDetail.isPayForMilage) {
        const timesheetPaySummaryDTO = new TimesheetPaySummaryDTO('Billable Miles',
          this.totalBillableMiles, timesheetData.jobBidDetail.clientMilageRate, this.amountMilage);
        this.timesheetPaySummaryList.push(timesheetPaySummaryDTO);
      }
      else {
        const timesheetPaySummaryDTO = new TimesheetPaySummaryDTO('Billable Miles',
          'N/A', 'N/A', this.amountMilage);
        this.timesheetPaySummaryList.push(timesheetPaySummaryDTO);
      }
    });
    const timesheet = [];
    this.timesheetPaySummaryList.forEach((item) => {
      if (timesheet.findIndex(i => i.specifications == item.specifications) === -1) {
        timesheet.push(item);
      }

    });
    if (!timesheet.some((item) => item.specifications === 'Overtime Hours')) {
      const timesheetPaySummaryDTO = new TimesheetPaySummaryDTO('Overtime Hours',
        'N/A', 'N/A', this.amountOverTimeHours);
      timesheet.push(timesheetPaySummaryDTO);
    }
    this.timesheetPaySummaryList = timesheet;

    //  this.calculateTotalAmount();
  }
  approveTimesheet(timesheetList, reimbursementList, amountReimbursement, totalAmount) {


    let regularHourRate;
    let overTimeHourRate;
    let milesRate;
    let perDiemRate;
    let approveRejectTimesheetDTO = new ApproveRejectTimeSheetDTO();
    timesheetList.forEach(element => {
      regularHourRate = element.jobBidDetail.clientHourlyRate;
      overTimeHourRate = ((regularHourRate * 1.5));
      milesRate = element.jobBidDetail.clientMilageRate;
      perDiemRate = element.jobBidDetail.clientPerDiemRate;

    });
    approveRejectTimesheetDTO.timeSheets = timesheetList;
    approveRejectTimesheetDTO.reimbursements = reimbursementList;
    approveRejectTimesheetDTO.totalRegularHours = this.totalWorkHoursForCalculation;
    approveRejectTimesheetDTO.regularHourRate = regularHourRate;
    approveRejectTimesheetDTO.totalOvertimeHours = this.overTimeHours;
    approveRejectTimesheetDTO.totalBillableMiles = this.totalBillableMiles;
    approveRejectTimesheetDTO.milesRate = milesRate;
    approveRejectTimesheetDTO.perDiemRate = perDiemRate;
    approveRejectTimesheetDTO.totalPerDiem = this.amountDiem;
    approveRejectTimesheetDTO.totalReimbursementAmount = amountReimbursement;
    approveRejectTimesheetDTO.totalAmount = totalAmount;


    this.timesheetService.approveTimesheet(approveRejectTimesheetDTO).subscribe(data => {

      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('timesheets.approved'), '');
        this.setDefaultCriteriaForTimeSheet();
        this.setDefaultCriteriaForReimbursement();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  openRejectDialog() {
    this.rejectDialog = true;
    this.initializeRejectForm();
  }
  hideRejectDialog(): void {
    this.rejectDialog = false;
  }
  initializeRejectForm() {
    this.myRejectForm = this.formBuilder.group({
      rejectionReason: [],

    });
  }
  rejectTimesheet(timesheetList, reimbursementList, amountReimbursement, totalAmount) {


    let regularHourRate;
    let overTimeHourRate;
    let milesRate;
    let perDiemRate;
    let approveRejectTimesheetDTO = new ApproveRejectTimeSheetDTO();
    timesheetList.forEach(element => {
      regularHourRate = element.jobBidDetail.jobDetail.clientHourlyRate;
      overTimeHourRate = ((regularHourRate * 1.5));
      milesRate = element.jobBidDetail.clientMilageRate;
      perDiemRate = element.jobBidDetail.clientPerDiemRate;

    });
    approveRejectTimesheetDTO.timeSheets = timesheetList;
    approveRejectTimesheetDTO.reimbursements = reimbursementList;
    approveRejectTimesheetDTO.totalRegularHours = this.totalWorkHoursForCalculation;
    approveRejectTimesheetDTO.regularHourRate = regularHourRate;
    approveRejectTimesheetDTO.totalOvertimeHours = this.overTimeHours;
    approveRejectTimesheetDTO.totalBillableMiles = this.totalBillableMiles;
    approveRejectTimesheetDTO.milesRate = milesRate;
    approveRejectTimesheetDTO.perDiemRate = perDiemRate;
    approveRejectTimesheetDTO.totalPerDiem = this.amountDiem;
    approveRejectTimesheetDTO.totalReimbursementAmount = amountReimbursement;
    approveRejectTimesheetDTO.totalAmount = totalAmount;
    approveRejectTimesheetDTO.reasonToReject = this.myRejectForm.value.rejectionReason;

    this.timesheetService.rejectTimesheet(approveRejectTimesheetDTO).subscribe(data => {

      if (data.statusCode === '200' && data.message === 'OK') {
        this.notificationService.success(this.translator.instant('timesheets.rejected'), '');
        this.hideRejectDialog();
        this.setDefaultCriteriaForTimeSheet();
        this.setDefaultCriteriaForReimbursement();
      }
      else {
        this.notificationService.error(data.message, '');
      }
    });
  }
  onFilterOpen(): void {
    this.isFilterOpened = !this.isFilterOpened;
  }
  calculateTotalAmount(amountReimbursement, amountDiem, amountMilage, amountWorkHours, amountOverTimeHours) {
    this.totalAmount = 0;

    this.totalAmount = amountReimbursement + amountDiem + amountMilage + amountWorkHours + amountOverTimeHours;
    return this.totalAmount;
  }
  @Input() get selectedReimbursementColumns(): any[] {
    return this._selectedReimbursementColumns;
  }

  set selectedReimbursementColumns(val: any[]) {
    this._selectedReimbursementColumns = this.reimbursementColumns.filter(col => val.includes(col));
  }

  @Input() get selectedDayWiseColumns(): any[] {
    return this._selectedDayWiseColumns;
  }

  set selectedDayWiseColumns(val: any[]) {
    this._selectedDayWiseColumns = this.dayWiseColumns.filter(col => val.includes(col));
  }
  getOvertimeClientDetiail(): void {
    this.approveClientService.getApproveClientDetailByClientId(this.localStorageService.getItem('timesheetData').client.id).subscribe(
      data => {

        this.approveClientDTO = data.data;
        if (this.approveClientDTO.approveClient.hasOvertimePayRateApplied) {
          this.hasOvertimePayRateApplied = true;
        }
        else {
          this.hasOvertimePayRateApplied = false;
        }

      });
  }
}
