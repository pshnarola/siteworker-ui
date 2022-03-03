import { User } from "src/app/shared/vo/User";
import { JobsiteDetail } from "../../client/Vos/jobsitemodel";
import { LineItem } from "../../client/Vos/lineItemModel";
import { ProjectDetail } from "../../client/Vos/projectDetailmodel";

export class LineItemBidDetail {
    lineItem: LineItem;

    jobSiteDetail: JobsiteDetail;

    subContractor: User;

    subContractorBidAmount: number;

    projectDetail: ProjectDetail;

    constructor(
        lineItem?: LineItem,
        subContractorBidAmount?: number
    ) {
        this.lineItem = lineItem;
        this.subContractorBidAmount = subContractorBidAmount;
    }
}