import { BaseModel } from "src/app/shared/vo/baseModel";

export class GamificationConfigurationWorkerDTO extends BaseModel {
    referencePoint;

    qualityRatingFourToFivePoint;

    qualityRatingThreeToFourPoint;

    qualityRatingBelowThreePoint;

    safetyRatingFourToFivePoint;

    safetyRatingThreeToFourPoint;

    safetyRatingBelowThreePoint;

    certificationPoint;

    workerExperiencePoint;

    // For 120 hrs
    jobPointForMaxHrs;

    // For 80-120 hrs
    jobPointForMidHrs;

    // For 40-80 hrs
    jobPointForMinHrs;

    powerUserPoint;

    yellowRedHatUserPoint;

    comments;

    photo;

}