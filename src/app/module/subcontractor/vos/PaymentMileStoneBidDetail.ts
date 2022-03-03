import { User } from "src/app/shared/vo/User";
import { JobsiteDetail } from "../../client/Vos/jobsitemodel";
import { PaymentMileStone } from "../../client/Vos/paymentMilestoneModel";
import { ProjectDetail } from "../../client/Vos/projectDetailmodel";

export class PaymentMileStoneBidDetail {

      paymentMileStone: PaymentMileStone;

      jobSiteDetail: JobsiteDetail;

      subContractor: User;

      subContractorPercentage: number;

      subContractorAmount: number;

      projectDetail: ProjectDetail;

      constructor(subContractorAmount?, subContractorPercentage?, paymentMileStone?) {
            this.subContractorAmount = subContractorAmount;
            this.subContractorPercentage = subContractorPercentage;
            this.paymentMileStone = paymentMileStone;
      }

}