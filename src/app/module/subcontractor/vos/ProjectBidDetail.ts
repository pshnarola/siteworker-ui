import { User } from "src/app/shared/vo/User";
import { ProjectDetail } from "../../client/Vos/projectDetailmodel";

export class ProjectBidDetail {
    id: string;

    projectDetail: ProjectDetail;

    subContractor: User;

    subContractorCost: number;

    hasBiddedOnProject: boolean;

    biddingType;

    clientSpecialNotes;

    status;

    createdBy;

    updatedBy;
}