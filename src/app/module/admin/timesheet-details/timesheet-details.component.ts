import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { COMMON_CONSTANTS } from 'src/app/shared/CommonConstants';

@Component({
  selector: 'app-timesheet-details',
  templateUrl: './timesheet-details.component.html',
  styleUrls: ['./timesheet-details.component.css']
})
export class TimesheetDetailsComponent implements OnInit {
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  totalRecords;
  jobTitle: any;
  workWeekStartDate;
  myForm: FormGroup;
  maxEndDate;
  dayWiseColumns = [{ label: 'Work Date', value: 'worker', sortable: true, isHidden: false, field: 'worker' },
  { label: 'Hours Worked', value: 'title', sortable: false, isHidden: false, field: 'title' },
  { label: 'Work Description', value: 'workWeek', sortable: false, isHidden: false, field: 'workWeek' },
  { label: 'Total Miles Travelled', value: 'employmentType', sortable: true, isHidden: false, field: 'employmentType' },
  { label: 'Non Billable Miles', value: 'region', sortable: true, isHidden: false, field: 'region' },
  { label: 'Billable Miles', value: 'timesheet', sortable: false, isHidden: false, field: 'timesheet' },
  { label: 'Mileage Description', value: 'timesheet', sortable: false, isHidden: false, field: 'timesheet' },
  { label: 'File Attachment', value: 'timesheet', sortable: false, isHidden: false, field: 'timesheet' },
  { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status' },
  ];
  reimbursementColumns = [
    { label: 'Raised Date', value: 'CREATED_DATE', sortable: true, isHidden: false, field: 'CREATED_DATE' },
    { label: 'Reimbursements Title', value: 'title', sortable: true, isHidden: false, field: 'title' },
    { label: 'Description', value: 'description', sortable: true, isHidden: false, field: 'description' },
    { label: 'Amount', value: 'amount', sortable: true, isHidden: false, field: 'amount' },
    { label: 'Off Cycle', value: 'offCycle', sortable: false, isHidden: false, field: 'offCycle' },
    { label: 'Attachment', value: 'attachment', sortable: false, isHidden: false, field: 'attachment' },
    { label: 'Status', value: 'status', sortable: true, isHidden: false, field: 'status' },

  ];
  paySummaryColumns = [
    { label: 'Specifications', value: 'specifications', sortable: true, isHidden: false, field: 'specifications' },
    { label: 'Quantity', value: 'quantity', sortable: true, isHidden: false, field: 'quantity' },
    { label: 'Rate', value: 'rate', sortable: true, isHidden: false, field: 'rate' },
    { label: 'Amount', value: 'amount', sortable: true, isHidden: false, field: 'amount' },


  ];
  workWeekEndDate = new Date();
  date1: Date;
  constructor(private formBuilder: FormBuilder,
    private captionChangeService: HeaderManagementService) {
    this.captionChangeService.hideHeaderSubject.next(true);
  }

  ngOnInit(): void {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.initializeForm();
    this.myForm.get('workerWeekStart').valueChanges.subscribe(data => {
      this.workWeekEndDate = new Date(data);
      this.workWeekEndDate.setDate(this.workWeekEndDate.getDate() + 7);
    });
  }
  initializeForm(): void {
    this.myForm = this.formBuilder.group({
      workerWeekStart: [],
      workerWeekEnd: [],
    });
  }
  filter(): void {
    console.log(this.myForm.value);
  }
}
