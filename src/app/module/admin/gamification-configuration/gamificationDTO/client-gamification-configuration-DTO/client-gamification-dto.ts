import { BaseModel } from "src/app/shared/vo/baseModel";

export class ClientGamificationDTO extends BaseModel {

    closeOutPackageResponseDays: number;

    closeOutPackageResponseTimePoint: number;

    weeklyTimesheetResponseDays: number;

    weeklyTimesheetResponseTimePoint: number;

    jobsiteConversionRate: number;

    jobsiteConversionRatePoints: number;

    leadDaysForActualStartDate: number;

    pointForStartingJobAtTime: number;

    qualityRatingFourToFivePoint: number;

    qualityRatingThreeToFourPoint: number;

    qualityRatingBelowThreePoint: number;

}
