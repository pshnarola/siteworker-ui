import { WorkerProfileDto } from "./worker-profile-dto";
import { WorkerServicesList } from "./worker-services-list";

export class WorkerDto {
    workerProfile: WorkerProfileDto;

    workerServices: WorkerServicesList[];
}
