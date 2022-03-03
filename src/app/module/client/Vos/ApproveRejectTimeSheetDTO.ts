import { TimesheetDTO } from '../../admin/vos/TimesheetDTO';
import { JobReimbursementDTO } from '../../worker/vo/job-reimbursement-dto';

export class ApproveRejectTimeSheetDTO {
    timeSheets: TimesheetDTO[];

    reimbursements: JobReimbursementDTO[];

    reasonToReject;

    totalRegularHours;

    regularHourRate;

    totalOvertimeHours;

    overtimeHourRate;

    totalBillableMiles;

    milesRate;

    totalPerDiem;

    perDiemRate;

    totalReimbursementAmount;

    totalAmount;

    regularHourAmount;

    overtimeAmount;

    billableMilesAmount;

    perDiemRateAmount;

    clientId;
}
