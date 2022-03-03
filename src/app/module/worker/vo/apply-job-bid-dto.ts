import { JobBidDetailDTO } from "src/app/shared/vo/job-bid-detail-dto";
import { JobBidCertificateDTO } from "./job-bid-certificate-dto";
import { JobBidScreeningQuestionDTO } from "./job-bid-screening-question-dto";

export class ApplyJobBidDTO {
    jobBidDetail: JobBidDetailDTO;
    jobBidCertificates: JobBidCertificateDTO[];
    jobBidScreeningQuestions: JobBidScreeningQuestionDTO[];
}
