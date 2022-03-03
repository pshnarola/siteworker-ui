import { ClientRatingDTO } from "./client-rating-dto";
import { WorkerRatingDTO } from "./worker-rating-dto";

export class RatingDTO {
    clientRating: ClientRatingDTO;
    workerRating: WorkerRatingDTO;
    constructor(clientRating?, workerRating?){
        this.clientRating = clientRating;
        this.workerRating = workerRating;

    }
}
