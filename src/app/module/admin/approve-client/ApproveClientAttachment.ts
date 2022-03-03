import { ApproveClientDetail } from './ApproveClientDetail';

export class ApproveClientAttachment {
    approveClientDetail: ApproveClientDetail;
    createdBy: string;
    createdDate: string;
    fileName: string;
    id: string;
    path: string;
    postType: string;
    updatedBy: string;
    updatedDate: string;

    constructor(fileName?, path?, postType?, id?) {
        this.fileName = fileName;
        this.path = path;
        this.postType = postType;
        this.id = id;
    }
}
