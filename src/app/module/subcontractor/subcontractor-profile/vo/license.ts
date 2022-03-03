import { User } from 'src/app/shared/vo/User';

export class License {

    id;
    
    name: string;

    number: string;

    state: string;

    expiryDate;

    documentPath1: string;

    documentName1: string;

    documentPath2: string;

    documentName2: string;

    user: User;


}