import { BaseModel } from "src/app/shared/vo/baseModel";
import { JobTitle } from "src/app/shared/vo/JobTitle";
import { State } from "src/app/shared/vo/state/state";
import { User } from "src/app/shared/vo/User";
import { JobListConfiguration } from "./JobListConfiguration";

export class WorkerProfileDto extends BaseModel {

    jobTitle: JobTitle;

    status;

    mobilePhone: string;

    // To save address
    latitude: number;

    // To save address
    longitude: number;

    // To save address
    location: string;

    city: string;

    state: string;

    zipCode: string;

    summary: string;

    photo: string;

    minHourlyRate: number;

    maxHourlyRate: number;

    isWillingToWorkFullTime: boolean;

    minFullTimeSalary: number;

    maxFullTimeSalary: number;

    user: User;

    lastSavedStep: number;

    ripplingId;

    tsheetId;

    jobListConfiguration: JobListConfiguration;

    lstJobListPreferredState: State[];
}
