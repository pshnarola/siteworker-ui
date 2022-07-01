import { BaseModel } from "src/app/shared/vo/baseModel";

export class  CloseoutPackageRequestDTO extends BaseModel{
 projectDetail;

 jobSiteDetail;

 paymentMileStone;

 paymentMileStoneBidDetail;

 subContractor;

 client;

 status;

 requestedDate;

 approvedDate;

 cost;
 lineItemDTOList:any=[];
}
