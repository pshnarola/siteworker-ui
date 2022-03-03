import { required } from '@rxweb/reactive-form-validators';
import { State } from '../state/state';

export class City {
    id: string;

    // @required({ message: 'This field is required' })
    name: string;

    enable: number;

    // @required({ message: 'This field is required' })
    state: State;
    
    createdBy: string;
    updatedBy: string;
}

// ng g class shared/vo/city/city