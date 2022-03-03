import { BaseModel } from "src/app/shared/vo/baseModel";
import { User } from "src/app/shared/vo/User";
import { JobsiteDetail } from "../../module/client/Vos/jobsitemodel";
import { ProjectDetail } from "../../module/client/Vos/projectDetailmodel";

export class RatingAndReview extends BaseModel {

    ratingText: string;

    rating: number;

    safetyRating: number;
    
    submittedBy: User;

    submittedTo: User;

    project: ProjectDetail;

    jobsite: JobsiteDetail;

    jobDetail: any;

    isReportToAdmin: boolean;
    
    type;

    isAcceptedByAdmin;

    isRejectedByAdmin;

}