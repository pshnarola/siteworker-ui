import { User } from "src/app/shared/vo/User";
import { ProjectDetail } from "../../client/Vos/projectDetailmodel";


export class ProjectMarkAsFavourite {

    id: string;

    projectDetail: ProjectDetail;

    subContractor: User;

    hasMarkedFavourite: boolean;

    createdBy: string;

    updatedBy: string;

}