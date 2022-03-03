import { JobDetails } from 'src/app/module/client/post-job/job-details';
import { WorkerProfileDto } from 'src/app/module/worker/vo/worker-profile-dto';
import { User } from './User';

export class JobBidDetailDTO {
id: string;
workerHourlyRate: number;
workerAnnualSalary: number;
workerTentativeStartDate: Date;
workerSpecialNote: string;
isFavourite: boolean;
status;
jobDetail: JobDetails;
worker: User;
clientHourlyRate;
clientAnnualSalary;
clientSpecialNote;
clientPerDiemRate;
clientMilageRate;
isJobCompleted;
jobAcceptedDate;
jobCompletionDate;
jobAppliedDate;
workerProfile: WorkerProfileDto;
}

