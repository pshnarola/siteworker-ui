import { BaseModel } from "src/app/shared/vo/baseModel";

export class JobInviteeConfiguration extends BaseModel {

    states: string;

    isCertificateMatch: boolean;

    isJobTitleMatch: boolean;

    successRatioMin: number;

    successRatioMax: number;

    avgRatingMin: number;

    avgRatingMax: number;

}