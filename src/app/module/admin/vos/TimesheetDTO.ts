import { BaseModel } from 'src/app/shared/vo/baseModel';
import { JobBidDetailDTO } from 'src/app/shared/vo/job-bid-detail-dto';

export class TimesheetDTO extends BaseModel {
    workDate;

    weekStart;

    weekEnd;

    workHour;

    workDescription;

    totalMilesTravelled;

    nonBillableMiles;

    billableMiles;

    jobBidDetail: JobBidDetailDTO;

    worker;

    client;

    status;

    approvedDate;

    // this is response Id from tsheet
    tsheetResposeId;
}