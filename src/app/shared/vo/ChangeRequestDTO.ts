import { ChangeRequest } from "./ChangeRequest";
import { ChangeRequestAttachment } from "./ChangeRequestAttachment";

export class ChangeRequestDTO {
    changeRequest: ChangeRequest;
    attachments: ChangeRequestAttachment[];
}