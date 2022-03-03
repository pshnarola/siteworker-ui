import { BaseModel } from "src/app/shared/vo/baseModel";

export class ProjectInviteeConfiguration extends BaseModel {

    states: string;

    isIndustryTypeChecked: boolean;

    successRatioMin: number;

    successRatioMax: number;

    avgRatingMin: number;

    avgRatingMax: number;

}