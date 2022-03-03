import { ChangeRequestStatus } from "./ChangeRequestStatus";
import { User } from "./User";

export class ChangeRequest{
    id: string;
    createdBy: string;
    updatedBy: string;
    raisedBy: User;
    raisedTo: User;
    title: string;
    description: string;
    cost: number;
    project: any;
    jobSite: any;
    status: ChangeRequestStatus;
}