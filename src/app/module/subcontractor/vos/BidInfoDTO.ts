import { LineItemBidDetail } from "./LineItemBidDetail";
import { PaymentMileStoneBidDetail } from "./PaymentMileStoneBidDetail";

export class BidDetailInfoDTO {

    jobSiteBidDetail;

    lineItems: LineItemBidDetail[];

    paymentMileStones: PaymentMileStoneBidDetail[];

}