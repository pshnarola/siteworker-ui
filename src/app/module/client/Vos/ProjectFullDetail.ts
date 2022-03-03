import { ProjectBiddingType } from 'src/app/shared/enums/bidding-type';
import { BaseModel } from 'src/app/shared/vo/baseModel';
import { BidStatus } from '../../subcontractor/enums/BidStatusenum';
import { InviteeStatus } from '../../subcontractor/enums/inviteeStatus';
import { BidDetail } from '../../subcontractor/vos/JobSiteBidDetail';
import { ProjectDetail } from './projectDetailmodel';

export class ProjectFullDetail extends BaseModel {
     projectDetail: ProjectDetail;
     hasMarkedAsFavourite: boolean;
     bidStatus: BidStatus;
     inviteeStatus: InviteeStatus;
     biddingType: ProjectBiddingType;
     jobsites: BidDetail;
}
