import { minLength, required } from '@rxweb/reactive-form-validators';

export class LogIn {
    @required({ message: 'This field is required' })
    // @contains({ value: 'admin@abc.com', message: '' })
    public email: string;

    @required({ message: 'This field is required' })
    @minLength({ value: 8, message: 'required 8 character min' })
    public password: string;

}