import { required } from '@rxweb/reactive-form-validators';

export class ContentMSA {
    id: string;

    content: string;
    
    @required({ message: 'This field is required' })
    type: any;
    
    version: number;
    isActive: boolean; 
    createdDate:Date;
    createdBy: string;
    updatedBy: string;
}
