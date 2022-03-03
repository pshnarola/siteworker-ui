import { NotificationType } from '../enums/notificationtype';
import { BaseModel } from './baseModel';
import { User } from './User';

export class BellNotification extends BaseModel {
    name: string;

    description: string;

    type: NotificationType;

    isSeen: boolean;

    postedTo: User;

    postedBy: User;

}
