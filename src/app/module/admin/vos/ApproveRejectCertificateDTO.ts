import { COI } from '../../subcontractor/subcontractor-profile/vo/COI';
import { EMR } from '../../subcontractor/subcontractor-profile/vo/emr';
import { OSHA } from '../../subcontractor/subcontractor-profile/vo/OSHA';
import { WorkerCertificateDTO } from './WorkerCertificateDTO';

export class ApproveRejectCertificateDTO{
    workerCertificates: WorkerCertificateDTO[];
    subContractorEMRs: EMR[];
    subContractorOSHAs: OSHA[];
    subContractorCOIs: COI[];
    loggedInAdmin;
}
