import { minLength, prop, required } from '@rxweb/reactive-form-validators';

export class Region {
    id: string;

    @required({ message: 'This field is required' })
    name: string;
    
    enable: number;
    createdBy: string;
    updatedBy: string;
}
