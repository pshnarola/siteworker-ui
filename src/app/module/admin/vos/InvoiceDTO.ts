import { BaseModel } from 'src/app/shared/vo/baseModel';
import { JobBidDetailDTO } from 'src/app/shared/vo/job-bid-detail-dto';
import { User } from 'src/app/shared/vo/User';
import { CloseoutPackageRequestDTO } from '../../subcontractor/vos/CloseOutPackageRequestDTO';

export class InvoiceDTO extends BaseModel{
    closeOutPackageRequest: CloseoutPackageRequestDTO;

    subContractor: User;

    client: User;

    worker: User;

    type;

    toType;

    status;

    invoiceNumber;

    invoiceAmount;

    invoiceDocName;

    invoiceDocPath;

    invoiceDate;

    invoicePaidDate;

    platformMarginCost;

    weekStart;

    weekEnd;

    jobBidDetail: JobBidDetailDTO;
}
