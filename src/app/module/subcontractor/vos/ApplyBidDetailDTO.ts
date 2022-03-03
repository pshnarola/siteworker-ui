import { JobsiteDetail } from "../../client/Vos/jobsitemodel";
import { BidDetail } from "./JobSiteBidDetail";
import { ProjectBidDetail } from "./ProjectBidDetail";

export class ApplyBidDetailDTO {

    projectBidDetail: ProjectBidDetail;

    selectedJobSites: JobsiteDetail[];

}