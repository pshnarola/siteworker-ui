import { ChangeRequest } from "./ChangeRequest";
import { ChangeRequestAttachment } from "./ChangeRequestAttachment";
import { ChangeRequestLineItem } from "./ChangeRequestLineItem";


export class ChangeRequestDTO {
    changeRequest: ChangeRequest;
    attachments: ChangeRequestAttachment[];
    lineItems:any=[];
}