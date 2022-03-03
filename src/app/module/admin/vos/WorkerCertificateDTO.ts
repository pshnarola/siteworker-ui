import { BaseModel } from 'src/app/shared/vo/baseModel';

export class WorkerCertificateDTO extends BaseModel{
    certificate;
    certificationDate;
    expiryDate;
    status;
    documentPath1;
    documentName1;
    documentPath2;
    documentName2;
    user;
    approvedDate;
    rejectedDate;
}