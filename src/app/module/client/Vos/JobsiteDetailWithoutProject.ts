import { BaseModel } from "src/app/shared/vo/baseModel";
import { User } from "src/app/shared/vo/User";
import { BidStatus } from "../../subcontractor/enums/BidStatusenum";
import { StatusOfJobsite } from "../../subcontractor/vos/Enum";
import { JobsiteStatus } from "../enums/jobsiteStatus";
import { JobSiteAttachment } from "./jobsiteAttachment";
import { LineItem } from "./lineItemModel";
import { PaymentMileStone } from "./paymentMilestoneModel";

export class JobsiteDetailWithoutProject {

    id: any;
    createdBy: any;
    createdDate: any;
    updatedBy: any;
    updatedDate: any;

    user: User;

    title: string;

    description: string;

    cost: number;

    state: string;

    city: string;

    status: JobsiteStatus;

    bidStatus: BidStatus;

    // disableStatus: any;
    isBidCompleted: any;

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
    isSelected: boolean;

    constructor(
        id?: any,
        createdBy?: any,
        createdDate?: any,
        updatedBy?: any,
        updatedDate?: any,
        user?: User,
        title?: string,
        description?: string,
        cost?: number,
        state?: string,
        city?: string,
        status?: JobsiteStatus,
        isSelected?: boolean,
        bidStatus?: BidStatus,
        isBidCompleted?: any,
        location?: string,
        zipCode?: string,
        assignedTo?: User,
        jobCode?: string,
        latitude?: number,
        longitude?: number,
        supervisor?: User,
        paymentMileStone?: PaymentMileStone[],
        lineItem?: LineItem[],
        attachment?: JobSiteAttachment[]
    ) {
        this.id = id;
        this.createdBy = createdBy;
        this.createdDate = createdDate;
        this.updatedBy = updatedBy;
        this.updatedDate = updatedDate;
        this.user = user;
        this.title = title;
        this.description = description;
        this.cost = cost;
        this.state = state;
        this.city = city;
        this.status = status;
        this.bidStatus = bidStatus;
        this.isSelected = isSelected;
        this.isBidCompleted = isBidCompleted;
        this.location = location;
        this.zipCode = zipCode;
        this.assignedTo = assignedTo;
        this.jobCode = jobCode;
        this.latitude = latitude;
        this.longitude = longitude;
        this.supervisor = supervisor;
        this.paymentMileStone = paymentMileStone;
        this.lineItem = lineItem;
        this.attachment = attachment;
    }
}
