import { Service } from "src/app/module/admin/service-component/service";

export class WorkerServicesList {
    service;

    constructor(service: Service) {
        this.service = service;
    }
}
