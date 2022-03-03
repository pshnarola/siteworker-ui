import { BaseModel } from "src/app/shared/vo/baseModel";
import { User } from "src/app/shared/vo/User";
import { JobDetails } from "../../client/post-job/job-details";

export class JobReimbursementDTO extends BaseModel{
    jobDetail: JobDetails;
    title: string;
    description: string;
    isOffCycle: boolean;
    amount;
    weekStart;
    weekEnd;
    status;
    worker: User;
}
