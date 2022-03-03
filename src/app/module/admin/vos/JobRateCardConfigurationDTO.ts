export class JobRateCardConfigurationDTO {
    jobRateCard;

    jobTitle;

    experience;

    minPayRate;

    maxPayRate;

    minBillRate;

    maxBillRate;

    minProfit;

    maxProfit;

    profitMargin;
    constructor(jobTitle, experience,

        minPayRate,

        maxPayRate,

        minBillRate,

        maxBillRate,

        minProfit,

        maxProfit,

        profitMargin,) {
        this.jobTitle = jobTitle;
        this.experience = experience;
        this.minPayRate = minPayRate;
        this.maxPayRate = maxPayRate;
        this.minBillRate = minBillRate;
        this.maxBillRate = maxBillRate;
        this.minProfit = minProfit;
        this.maxProfit = maxProfit;
        this.profitMargin = profitMargin;


    }
}
