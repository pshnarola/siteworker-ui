import { Certificate } from "../../admin/certificate/certificate";

export class JobBidCertificateDTO {
    certificate: Certificate;
    constructor(certificate:Certificate){
        this.certificate=certificate;
    }
}
