import { User } from 'src/app/shared/vo/User';
import { JobInviteeConfiguration } from './JobInviteeConfiguration';
import { NumberOfEmployee } from './number-of-employee';
import { ProjectInviteeConfiguration } from './ProjectInviteeConfigurationDTO';

export class Clientvo {

	id: any;

	companyName: string;

	companyPhone: string;

	contactName: string;

	contactEmail: string;

	contactPhone: string;

	yearFounded: string;

	numberOfEmployee: NumberOfEmployee;

	createdDate;

	updatedDate

	dunNumber: string;

	companyDescription: string;

	// To save address
	latitude: number;

	// To save address
	longitude: number;

	city: string;

	state: string;

	zipCode: number;

	photo: string;

	user: User;

	legalCompanyName: string;

	designation: string;

	projectMSA: string;

	isProjectMSAccepted: boolean;

	jobMSA: string;

	isProjectAccess;

	isJobAccess;

	isProjectApproved;

	isJobApproved;

	location;

	isJobMSAccepted: boolean;

	lastSavedStep: number;

	projectInviteeConfiguration: ProjectInviteeConfiguration;

	jobInviteeConfiguration: JobInviteeConfiguration;

	lstProjectInviteePreferredState: any;

	lstJobInviteePreferredState: any;

}
