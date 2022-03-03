import { User } from 'src/app/shared/vo/User';

export class EMR {
    id: string;

    year: string;

    documentPath: string;

    documentName: string;

    status;

    user: User;

    constructor(year?: string, documentPath?: string, documentName?: string, status?: string, user?: any) {
        this.year = year;
        this.documentPath = documentPath;
        this.documentName = documentName;
        this.user = user;
        this.status = status;
    }
}
