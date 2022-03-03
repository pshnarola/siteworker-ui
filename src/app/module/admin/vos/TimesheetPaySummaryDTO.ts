export class TimesheetPaySummaryDTO {
    specifications;
    quantity;
    rate;
    amount;
    constructor(
        specifications?,
        quantity?,
        rate?,
        amount?) {
        this.specifications = specifications;
        this.quantity = quantity;
        this.rate = rate;
        this.amount = amount;
    }
}
