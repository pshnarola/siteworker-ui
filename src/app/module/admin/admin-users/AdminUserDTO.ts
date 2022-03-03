import { User } from 'src/app/shared/vo/User';
import { UserPermission } from './UserPermission';

export class AdminUserDTO {
    id;

    createdBy;

    updatedBy;

    userDTO: User;

    userPermissions: UserPermission;
}
