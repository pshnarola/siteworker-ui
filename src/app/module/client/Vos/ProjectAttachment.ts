import { BaseModel } from "src/app/shared/vo/baseModel";
import { ProjectDetail } from "./projectDetailmodel";

export class ProjectAttachmentDTO extends BaseModel {

	path: string;

	filename: string;

	ProjectDetail : ProjectDetail;

}