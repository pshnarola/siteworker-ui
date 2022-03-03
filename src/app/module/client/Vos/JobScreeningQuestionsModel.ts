export class JobScreeningQuestionDTO {
    id: string;
    questionNo: number;
    question: string;
    constructor(id:string,questionNo:number,question:string){
        this.question=question;
        this.questionNo=questionNo
        this.id=id;
    }
}