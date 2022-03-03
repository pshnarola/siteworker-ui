import { User } from "src/app/shared/vo/User";
import { Certificate } from "../../admin/certificate/certificate";

export class workerCertificate {
    id;
    certificate: Certificate;

    certificationDate;

    expiryDate;

    status;

    documentPath1: string;

    documentName1: string;

    documentPath2: string;

    documentName2: string;

    user: User;
}