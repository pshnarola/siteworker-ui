import { JobScreeningQuestionDTO } from "../../client/Vos/JobScreeningQuestionsModel";

export class JobBidScreeningQuestionDTO {
    question: JobScreeningQuestionDTO;
    answer: string;
    constructor(question:JobScreeningQuestionDTO,answer?: string){
        this.question=question;
        this.answer=answer
    }
}
