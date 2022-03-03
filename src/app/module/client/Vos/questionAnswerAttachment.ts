import { BaseModel } from "src/app/shared/vo/baseModel";
import { ProjectDetail } from "./projectDetailmodel";

export class QuestionAnswerAttachment extends BaseModel{
    project: ProjectDetail;

	fileName: string;

    path: string;
}