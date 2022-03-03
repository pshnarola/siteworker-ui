import { Service } from 'src/app/module/admin/service-component/service';
import { SubContractorServiceDTO } from './sub-contractor-service-dto';
import { SubcontractorProfile } from './subcontractor-profile';

export class SubcontractorProfileDto {

    subcontractorProfile: SubcontractorProfile;
    subcontractorServices: SubContractorServiceDTO[];
}
