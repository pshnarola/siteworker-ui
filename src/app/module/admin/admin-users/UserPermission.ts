import { User } from 'src/app/shared/vo/User';

export class UserPermission {
    id: string;

    user: User;

    menuName: string;

    canView: boolean;

    canModify: boolean;

    createdBy: string;

    updatedBy: string;
}
