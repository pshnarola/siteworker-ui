import { DiversityCategory } from 'src/app/module/admin/diversity-category/diversity-category';
import { BaseModel } from 'src/app/shared/vo/baseModel';
import { IndustryType } from 'src/app/shared/vo/IndustryType';
import { State } from 'src/app/shared/vo/state/state';
import { ProjectListingConfigurationComponent } from '../../project-listing-configuration/project-listing-configuration.component';
import { ProjectListConfiguration } from './project-list-configuration';

export class SubcontractorProfile extends BaseModel {
    companyName: string;

    dba: string;

    mobilePhone: string;

    workPhone: string;

    description: string;

    photo: string;

    industryType: IndustryType;

    isEIN: boolean;

    einorSSN: string;

    numberOfEmployee;

    yearFounded: string;

    websiteURL: string;

    diversityStatus: DiversityCategory;

    // To save address
    latitude: number;

    // To save address
    longitude: number;

    // To save address
    location: string;

    city: string;

    state: string;

    zipCode: string;

    user;

    isLoginAsCompany: boolean;

    lastSavedStep: number;
    hasLicenses: boolean;
    hasEMR: boolean;
    hasOSHA: boolean;
    hasCOI: boolean;
    projectListConfiguration: ProjectListConfiguration;
	
	lstPreferredStates: State[];
}
