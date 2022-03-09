import { BaseModel } from 'src/app/shared/vo/baseModel';
import { IndustryType } from 'src/app/shared/vo/IndustryType';
import { User } from 'src/app/shared/vo/User';
import { Company } from '../../admin/company/company';
import { MarketType } from '../enums/marketTypeEnum';
import { ProjectStatus } from '../enums/projectStatusenum';
import { JobsiteDetail } from './jobsitemodel';

export class ProjectDetail extends BaseModel {
    cost: number;

    user: User;

    title: string;

    company: Company;

    region: string;

    state: string;

    industry: IndustryType;

    bidDueDate: any;

    startDate: any;

    completionDate: any;

    isNegotiable: boolean;

    type: MarketType;

    status: any;

    isSaveAsDraft: boolean;

    lastSavedStep: number;

    assignedTo: User;

    supervisor: User;

    jobsite: JobsiteDetail[];

    attachment: any[];

    latitude: any;

    longitude: any;

    attachmentLink: any;

}