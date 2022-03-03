import { Supervisor } from './Supervisor';

export class SupervisorDetails{
    id: string;
    workPhone: string;
    mobilePhone: string;
    isAllowToPostProject: boolean;
    supervisor: Supervisor;
    createdBy: string;
    updatedBy: string;
}