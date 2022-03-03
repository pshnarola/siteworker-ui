import { Service } from 'src/app/module/admin/service-component/service';
import { User } from 'src/app/shared/vo/User';

export class SubContractorServiceDTO {
    service: Service;
    user :User;


    constructor(service:Service) {
        this.service = service;
    }
}
