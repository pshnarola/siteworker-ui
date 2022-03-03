import { JobDetails } from "../module/client/post-job/job-details";
import { JobsiteDetail } from "../module/client/Vos/jobsitemodel";
import { ProjectDetail } from "../module/client/Vos/projectDetailmodel";
import { User } from "./vo/User";

export class ChatMessageDTO {
    message: string;
    type;
    postedTo: User;
    postedBy: User;
    project: any;
    jobSite: any;
    job: JobDetails;
    documentPath1: string;
    documentName1: string;
    documentPath2: string;
    documentName2: string;
    documentPath3: string;
    documentName3: string;
}
