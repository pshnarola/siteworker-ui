import { User } from 'src/app/shared/vo/User';

export class COI {
    id: string;

    isGeneralLimitMeets: boolean;

    isAutoMobileLimitMeets: boolean;

    isWorkerLimitMeets: boolean;

    // TODO Need to use actual one because still this combo is not decided
    umbrellaLiability: string;

    documentPath: string;

    documentName: string;

    status;

    user: User;
}
