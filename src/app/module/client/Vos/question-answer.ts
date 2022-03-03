import { BaseModel } from "src/app/shared/vo/baseModel";
import { User } from "src/app/shared/vo/User";
import { ProjectDetail } from "./projectDetailmodel";

export class QuestionAnswerDetail extends BaseModel{

    ProjectDetail: ProjectDetail;

	JobsiteDetail: any;

	question: string;

	answer: string;

	user: User;

	repliedBy: User;
}