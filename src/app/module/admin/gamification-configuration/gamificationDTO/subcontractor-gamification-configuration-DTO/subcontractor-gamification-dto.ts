import { BaseModel } from 'src/app/shared/vo/baseModel';

export class SubcontractorGamificationDTO extends BaseModel {
    referencePoint: any;

    qualityRatingFourToFivePoint: any;

    qualityRatingThreeToFourPoint: any;

    qualityRatingBelowThreePoint: any;

    safetyRatingFourToFivePoint: any;

    safetyRatingThreeToFourPoint: any;

    safetyRatingBelowThreePoint: any;

    jobsiteCost: any;

    jobsitePointsGreaterThanEqualToJobsiteCost: any;

    jobsitePointsLessThanJobsiteCost: any;

    powerUserPoint: any;

    yellowRedHatUserPoint: any;

    comments: string;

    photo: string;
}
