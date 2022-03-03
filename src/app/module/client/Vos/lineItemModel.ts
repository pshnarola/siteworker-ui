import { BaseModel } from 'src/app/shared/vo/baseModel';
import { Uom } from 'src/app/shared/vo/uom/uom';
import { JobsiteDetail } from './jobsitemodel';
import { PaymentMileStone } from './paymentMilestoneModel';

export class LineItem extends BaseModel {

     workType: string;

     lineItemId: string;

     lineItemName: string;

     quantity: number;

     unit: Uom;

     jobsite: JobsiteDetail;

     cost: number;

     description: string;

     inclusions: string;

     exclusions: string;

     dynamicLabel1: string;

     dynamicLabel2: string;

     dynamicLabel3: string;

     paymentMilestone: PaymentMileStone;

}