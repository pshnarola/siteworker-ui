export class JobReimbursementAttachmentDTO {
    fileName: string;
    path: string;
    constructor(fileName?, path?) {
        this.fileName =  fileName;
        this.path =  path;
    }
}
