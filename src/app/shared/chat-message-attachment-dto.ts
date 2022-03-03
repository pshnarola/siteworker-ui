export class ChatMessageAttachmentDTO {
    fileName: string;
    path: string;
    constructor(fileName?, path?) {
        this.fileName =  fileName;
        this.path =  path;
    }
}
