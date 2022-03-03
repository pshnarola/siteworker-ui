import { BaseModel } from 'src/app/shared/vo/baseModel';
import { ChangeRequest } from './ChangeRequestModel';
import { JobsiteDetail } from './jobsitemodel';
import { LineItem } from './lineItemModel';

export class PaymentMileStone extends BaseModel {

    name: string;

    lineItem: LineItem[];

    jobsite: JobsiteDetail;

    amount: number;

    percentage: any;

    changeRequest: ChangeRequest;

}
