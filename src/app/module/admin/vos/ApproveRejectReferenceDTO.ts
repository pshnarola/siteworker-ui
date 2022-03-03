import { SubContractorReferenceDTO } from "./SubContractorReferenceDTO";
import { WorkerReferenceDTO } from './WorkerReferenceDTO';

export class ApproveRejectReferenceDTO{
    workerReferences: WorkerReferenceDTO[];
    subContractorReferences: SubContractorReferenceDTO[];
}
