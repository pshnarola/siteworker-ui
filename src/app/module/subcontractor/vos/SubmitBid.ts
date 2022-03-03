import { BidDetailInfoDTO } from "./BidInfoDTO";
import { BidDetail } from "./JobSiteBidDetail";

export class SubmitBId {
    projectId: string;

    jobSiteBidDetails: BidDetailInfoDTO[];

    subContractorId: string;

    isBiddedOnWholeProject: boolean;
}