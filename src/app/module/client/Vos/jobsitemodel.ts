import { BaseModel } from 'src/app/shared/vo/baseModel';
import { User } from 'src/app/shared/vo/User';
import { JobsiteStatus } from '../enums/jobsiteStatus';
import { JobSiteAttachment } from './jobsiteAttachment';
import { LineItem } from './lineItemModel';
import { PaymentMileStone } from './paymentMilestoneModel';
import { ProjectDetail } from './projectDetailmodel';

export class JobsiteDetail extends BaseModel {

    user: User;

    project: ProjectDetail;

    title: string;

    description: string;

    cost: number;

    state: string;

    city: string;

    status: JobsiteStatus;

    location: string;

    zipCode: string;

    assignedTo: User;

    jobCode: string;

    latitude: number;

    longitude: number;

    supervisor: User;

    paymentMileStone: PaymentMileStone[];

    lineItem: LineItem[];

    attachment: JobSiteAttachment[];

    isBidCompleted: boolean;
}
