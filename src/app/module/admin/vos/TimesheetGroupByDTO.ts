import { BaseModel } from 'src/app/shared/vo/baseModel';
import { JobBidDetailDTO } from 'src/app/shared/vo/job-bid-detail-dto';

export class TimesheetGroupByDTO extends BaseModel {
    workDate: Date;

    weekStart: Date;

    weekEnd: Date;

    workWeek;

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
