import { JobReimbursementAttachmentDTO } from './job-reimbursement-attachment-dto';
import { JobReimbursementDTO } from './job-reimbursement-dto';

export class JobReimbursementDetailDTO {
    reimbursement: JobReimbursementDTO;
    reimbursementAttachments: JobReimbursementAttachmentDTO[];
}
