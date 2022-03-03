import { Injectable } from '@angular/core';
import { PostType } from '../module/client/enums/posttype';
import { JobDetails } from '../module/client/post-job/job-details';
import { SideBarEnumForSubContractor } from '../module/subcontractor/enums/subcontractorSidebarEnum';
import { SideBarEnumForWorker } from '../module/worker/enums/sideBarEnumForWorker';

@Injectable()
export class LocalStorageService {

    // tslint:disable-next-line: typedef
    setItem(key: string, value: any, storageType?: boolean) {
        if (storageType) {
            localStorage.setItem(key, JSON.stringify(value));
        } else {
            sessionStorage.setItem(key, JSON.stringify(value));
        }
    }

    getItem(key: string, defaultValue?: any, storageType?: boolean): any {

        if (storageType) {
            if (localStorage.getItem(key)) {
            } else {
                return defaultValue;
            }
        } else {
            if (sessionStorage.getItem(key)) {
                return JSON.parse(sessionStorage.getItem(key));
            } else {
                return defaultValue;
            }
        }

    }

    // tslint:disable-next-line: typedef
    removeItem(key: string) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    }

    getLoginUserId(): any {
        const user = this.getItem('user');
        return user ? user.id : '';
    }

    getLoginUserObject(): any {
        const user = this.getItem('user');
        return user;
    }
    getSelectedProjectObject(): any {
        const project = this.getItem('selectedProject');
        return project;
    }

    getSelectedJobsiteObject(): any {
        const jobsite = this.getItem('selectedJobsite');
        return jobsite;
    }
    getAllJobsite(): any {
        const jobsite = this.getItem('allJobsites');
        return jobsite;
    }
    getEditJobId(): any {
        const editJobId = this.getItem('editJobId');
        return editJobId;
    }
    getJobDetails(): any {
        const job = this.getItem('jobDetail');
        return job;
    }
    getSelectedJob(): any {
        const selectedJob = this.getItem('selectedJob');
        return selectedJob as JobDetails;
    }
    // tslint:disable-next-line: adjacent-overload-signatures
    getSelectedPostType(): any {
        const postType: PostType = this.getItem('Post_Type');
        return postType;
    }

    setTheme(themeName: string): void {
        sessionStorage.setItem('iconic_worker_theme', JSON.stringify(themeName));
    }

    getheme(): any {
        return this.getItem('iconic_worker_theme');
    }

    setSidebarJobSelectionFilterEnum(workerJobSelectionSidePannelEnum: SideBarEnumForWorker): void {
        sessionStorage.setItem('workerJobSelectionSidePannelEnum', JSON.stringify(workerJobSelectionSidePannelEnum));
    }

    getSidebarJobSelectionFilterEnum(): SideBarEnumForWorker {
        const selectedJobSelectionSidebarEnum: SideBarEnumForWorker = this.getItem('workerJobSelectionSidePannelEnum');
        return selectedJobSelectionSidebarEnum;
    }


    getSidebarSubcontractorFilterEnum(): SideBarEnumForSubContractor {
        let selectedProjectSelectionSidebarEnum: SideBarEnumForSubContractor = this.getItem('subcontractorSelectionSidePannelEnum');
        return selectedProjectSelectionSidebarEnum;
    }

    setSidebarSubcontractorFilterEnum(subcontractorSideBarSelectionEnum: SideBarEnumForSubContractor): void {
        sessionStorage.setItem('subcontractorSelectionSidePannelEnum', JSON.stringify(subcontractorSideBarSelectionEnum));
    }

    setSelectedProjectForBidQuotation(selectedProject: any): void {
        sessionStorage.setItem('selectedProjectForBidQuotation', JSON.stringify(selectedProject));
    }

    getSelectedProjectForBidQuotation() {
        return sessionStorage.getItem('selectedProjectForBidQuotation');
    }

    setSelectedJobsitesForBidQuotation(selectedjobsites: any): void {
        sessionStorage.setItem('selectedJobsitesForBidQuotation', JSON.stringify(selectedjobsites));
    }

    getSelectedJobsiteForBidQuotation(): any {
        let jobsites = sessionStorage.getItem('selectedJobsitesForBidQuotation');
        return JSON.parse(jobsites);
    }

    async logout(): Promise<any> {
        await sessionStorage.clear();
        await localStorage.clear();
    }

    async logoutForNewRoleLogin(): Promise<any> {
        await sessionStorage.clear();
        await localStorage.clear();
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }

}
