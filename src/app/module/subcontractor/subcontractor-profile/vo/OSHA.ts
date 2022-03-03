import { User } from 'src/app/shared/vo/User';

export class OSHA {
    id: string;

    year: string;

    documentPath: string;

    documentName: string;

    optOutReason: string;

    status;

    user: User;

    constructor(year?: string, documentPath?: string, documentName?: string, optOutReason?: string, status?: string, user?: any) {
        this.year = year;
        this.documentPath = documentPath;
        this.documentName = documentName;
        this.optOutReason = optOutReason;
        this.user = user;
        this.status = status;
    }
}
