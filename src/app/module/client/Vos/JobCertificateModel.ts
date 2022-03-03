import { Certificate } from '../../admin/certificate/certificate';

export class JobCertificate {
    certificate: Certificate;
    constructor(certificate:Certificate){
        this.certificate=certificate;
    }
}