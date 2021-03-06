import { BaseModel } from 'src/app/shared/vo/baseModel';
import { Experience } from 'src/app/shared/vo/experience';
import { User } from 'src/app/shared/vo/User';
import { Certificate } from '../../admin/certificate/certificate';
import { JobCertificate } from '../Vos/JobCertificateModel';

export class JobDetails extends BaseModel {
    title: string;
    description: string;
    specialQualification: string;
    noOfOpeningJob: number;
    experience: Experience;
    estimatedStartDate: Date;
    latitude: number;
    longitude: number;
    city: string;
    state: string;
    zipCode: string;
    region: string;
    certificates: JobCertificate;
    screeningQuestions: [];
    lastSavedStep: number;
    employmentType: string;
    isPerDiem: number;
    perDiemRate: number;
    isPayForMilage: number;
    minimumMile: number;
    milageRate: number;
    annualSalaryFrom: number;
    annualSalaryTo: number;
    isYearlyBonus: number;
    isHealthBenifit: number;
    is401KRetirement: number;
    isRelocationBenifit: number;
    jobType: string;
    user: User;
    status: string;
    assignedTo: User;
    isSavedAsDraft: number;
    supervisor: User;
    hourlyRateFrom: number;
    hourlyRateTo: number;
    workerMargin;
}
