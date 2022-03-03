import { User } from 'src/app/shared/vo/User';

export class Compliance {
    id: string;

    isSafetyManualFollowed: boolean;

    hasAutoInsurance: boolean;

    autoInsuranceExpiryDate;

    documentPath: string;

    documentName: string;

    isBackgroundCheckAndDrugScreening: boolean;

    user: User;
}
