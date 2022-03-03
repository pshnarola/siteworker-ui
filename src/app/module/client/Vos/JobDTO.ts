import { Experience } from 'src/app/shared/vo/experience';
import { JobDetails } from '../post-job/job-details';
import { JobCertificate } from './JobCertificateModel';
import { JobScreeningQuestionDTO } from './JobScreeningQuestionsModel';

export class JobDTO {
    jobDetail: JobDetails;
    experience: Experience;
    certificates: JobCertificate[];
    screeningQuestions: JobScreeningQuestionDTO[];
}