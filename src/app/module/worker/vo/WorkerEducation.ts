import { User } from "src/app/shared/vo/User";

export class WorkerEducation {
    id;

    institutionName: string;

    degree: string;

    major: string;

    startDate;

    isCurrentlyWorking: boolean;

    endDate;

    user: User;
}