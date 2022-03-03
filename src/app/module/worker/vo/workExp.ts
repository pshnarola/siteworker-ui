import { User } from "src/app/shared/vo/User";

export class WorkExp {
    id;

    companyName: string;

    designation: string;

    description: string;

    startDate;

    isCurrentlyWorking: boolean;

    endDate;

    user: User;
}