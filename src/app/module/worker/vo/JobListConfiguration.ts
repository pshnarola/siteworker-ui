import { BaseModel } from "src/app/shared/vo/baseModel";

export class JobListConfiguration{
    id: string;
    
    states: string;

    isCertificateMatch: boolean;

    isJobTitleMatch: boolean;
}