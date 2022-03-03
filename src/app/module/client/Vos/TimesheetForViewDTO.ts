import { JobBidDetailDTO } from 'src/app/shared/vo/job-bid-detail-dto';

export class TimesheetForViewDTO {
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

    totalHoursWorked;

    totalBillableMiles;

}
