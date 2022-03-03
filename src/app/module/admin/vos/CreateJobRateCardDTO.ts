import { JobRateCardConfigurationDTO } from './JobRateCardConfigurationDTO';
import { JobRateCardDTO } from './JobRateCardDTO';

export class CreateJobRateCardDTO {
    jobRateCard: JobRateCardDTO;

    jobRateCardConfiguration: JobRateCardConfigurationDTO[];

    isAllowToCreate;
}
