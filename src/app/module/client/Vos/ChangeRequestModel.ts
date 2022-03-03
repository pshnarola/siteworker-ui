import { BaseModel } from 'src/app/shared/vo/baseModel';
import { User } from 'src/app/shared/vo/User';
import { ChangeRequestStatus } from '../enums/changeRequestStatusEnum';
import { JobsiteDetail } from './jobsitemodel';
import { ProjectDetail } from './projectDetailmodel';

export class ChangeRequest extends BaseModel{

    private project: ProjectDetail;

    private jobSite: JobsiteDetail;

    private raisedBy: User;

    private raisedTo: User;

    private title: string;

    private description: string;

    private cost: number;

    private status: ChangeRequestStatus;

    private reasonToReject: string;
}
