import { required } from '@rxweb/reactive-form-validators';

export class Uom {
    id: string;

    @required({ message: 'This field is required' }) 
    name: string;

    enable: number; 
    createdBy: string;
    updatedBy: string;
}
