import { LineItemBidDetail } from "./LineItemBidDetail";
import { PaymentMileStoneBidDetail } from "./PaymentMileStoneBidDetail";

export class BidDetail {

    projectId: string;

    jobSiteId: string;

    lineItems: LineItemBidDetail[];

    paymentMileStones: PaymentMileStoneBidDetail[];

    subContractorId: string;

    subContractorCost: number;

    hasBiddedOnProject: boolean;

    totalJobsiteBidCost: number;

    jobSiteBidCompleted: boolean;

}
