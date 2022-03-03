import { HttpResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver/dist/FileSaver';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { FileDownloadService } from 'src/app/service/admin-services/fileDownload/file-download.service';
import { ChatMessageServiceService } from 'src/app/service/chat-message-service.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { environment } from 'src/environments/environment';
import { ChatMessageAttachmentDTO } from '../chat-message-attachment-dto';
import { ChatMessageDTO } from '../chat-message-dto';
import { ChatMessageDTOWithProfile } from '../chatMessageDtoWithProfile';
import { UINotificationService } from '../notification/uinotification.service';
import { DataTableParam } from '../vo/DataTableParam';
import { User } from '../vo/User';
import { WorkerSidebarJobListService } from '../worker-sidebar-job-list.service';

@Component({
  selector: 'app-chat-screen',
  templateUrl: './chat-screen.component.html',
  styleUrls: ['./chat-screen.component.css']
})
export class ChatScreenComponent implements OnInit, OnDestroy {

  /*
   @author Varshil Panchal
 */

  submitted = false;
  chatMessageDTO = new ChatMessageDTO();
  // chatMessageDTO = new ChatMessageDTO();
  chatData: ChatMessageDTOWithProfile[] = [];
  attachmentList: ChatMessageAttachmentDTO[] = [];

  subscription = new Subscription();
  isSelectedJob: boolean;

  workerId: any;
  message;

  imageUrl = environment.baseURL + '/file/getById?fileId=';

  selectedJob: any;
  FileName: any;
  files: any = [];
  logoBody: any;
  logoData: any;
  attachment: ChatMessageAttachmentDTO;

  dialog = false;

  datatableParam: DataTableParam;
  globalFilter: string;
  sortOrder = 1;
  offset = 0;
  queryParam: URLSearchParams;

  loggedInUser: any;

  searchText;
  rolename: any;
  selectedProjectDetail: any;
  JobSiteDetail: any;

  userList = [];
  userFromTheList = null;
  totalMessages: number;
  messageHidden = false;
  biddingType: any;

  postType;

  constructor(
    private notificationService: UINotificationService,
    private localStorageService: LocalStorageService,
    private chatMessageService: ChatMessageServiceService,
    private translator: TranslateService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private workerSideBarJobListService: WorkerSidebarJobListService,
    private fileService: FileDownloadService,
    private confirmDialogService: ConfirmDialogueService,
    private captionChangeService: HeaderManagementService,
  ) {
    this.captionChangeService.hideHeaderSubject.next(true);

    this.loggedInUser = this.localStorageService.getLoginUserObject();
  }

  ngOnDestroy(): void {
    this.localStorageService.removeItem('workerSelectedJob');
    this.localStorageService.removeItem('doNotHideAllLabelsFromJobsite');
    this.subscription.unsubscribe();
  }

  ngOnInit(): void {
    this.postType = this.localStorageService.getItem('Post_Type');
    this.captionChangeService.hideHeaderSubject.next(true);
    this.rolename = this.loggedInUser.roles[0].roleName;
    switch (this.rolename) {
      case 'CLIENT':
        this.getDataByPostType();
        this.getSelectedProjectDetails();
        this.getSelectedJobsiteDetail();
        this.getSelectedJobOfClientSidebar();
        break;
      case 'SUBCONTRACTOR':
        this.getSelectedProjectDetails();
        this.getSelectedJobsiteDetail();
        break;
      case 'WORKER':
        this.getSelectedJob();
        break;
    }
  }

  getDataByPostType() {
    this.subscription.add(this.projectJobSelectionService.postTypeSubject.subscribe(data => {
      this.postType = data;
      if (this.postType === 'PROJECT') {
        this.getSelectedProjectDetails();
        this.getSelectedJobsiteDetail();
      } else if (this.postType === 'JOB') {
        this.getSelectedJobOfClientSidebar();
      }
    }));
  }

  getSelectedJob(): void {
    this.subscription.add(this.workerSideBarJobListService.workerSidebarJobChanged.subscribe(data => {
      this.chatData = [];
      this.selectedProjectDetail = null;
      this.JobSiteDetail = null;
      if (this.localStorageService.getItem('workerSelectedJob')) {
        const job = this.localStorageService.getItem('workerSelectedJob');
        if (job.id === 'jobId') {
          this.selectedJob = null;
        }
        else {
          this.selectedJob = job;
          this.getSelectedJobsChat();
          this.markMessageAsSeen3(this.loggedInUser.id, ' ', ' ', this.selectedJob.id);
        }
      } else {
        this.selectedJob = null;
      }
    }));
  }

  getSelectedJobOfClientSidebar(): void {
    this.subscription.add(this.projectJobSelectionService.selectedJobSubject.subscribe(data => {
      this.chatData = [];
      this.userList = [];
      this.selectedProjectDetail = null;
      this.JobSiteDetail = null;
      if (this.localStorageService.getItem('selectedJob')) {
        const job = this.localStorageService.getItem('selectedJob');
        if (job.id === 'jobId') {
          this.selectedJob = null;
        }
        else {
          this.selectedJob = job;
          this.getListOfuser();
        }
      } else {
        this.selectedJob = null;
      }
    }));
  }

  getSelectedProjectDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      this.chatData = [];
      this.userList = [];
      this.selectedJob = null;
      this.JobSiteDetail = null;
      if (this.rolename === 'CLIENT') {
        if (this.localStorageService.getSelectedProjectObject()) {
          const project = this.localStorageService.getSelectedProjectObject();
          if (project.id === 'pid') {
            this.selectedProjectDetail = null;
            this.JobSiteDetail = null;
          }
          else {
            this.selectedProjectDetail = project;
            if (this.rolename === 'CLIENT') {
              this.getListOfuser();
            } else if (this.biddingType === 'BY_PROJECT') {
              this.getSelectedJobsChat();
              this.markMessageAsSeen1(this.loggedInUser.id, this.selectedProjectDetail.id, ' ', ' ');
            }
          }
        } else {
          this.selectedProjectDetail = null;
          this.JobSiteDetail = null;
        }
      } else if (this.rolename === 'SUBCONTRACTOR') {
        if (this.localStorageService.getItem('selectedFullProjectDetail')) {
          const project = this.localStorageService.getItem('selectedFullProjectDetail');
          if (project.projectDetail.id === 'pid') {
            this.selectedProjectDetail = null;
            this.JobSiteDetail = null;
          }
          else {
            this.selectedProjectDetail = project.projectDetail;
            this.biddingType = project.biddingType;
            if (this.biddingType === 'BY_PROJECT') {
              this.getSelectedJobsChat();
              this.markMessageAsSeen1(this.loggedInUser.id, this.selectedProjectDetail.id, ' ', ' ');
            }
          }
        } else {
          this.selectedProjectDetail = null;
          this.JobSiteDetail = null;
        }
      }
    }));
  }

  getSelectedJobsiteDetail(): void {
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(data => {
      this.chatData = [];
      this.JobSiteDetail = null;
      if (this.localStorageService.getSelectedJobsiteObject()) {
        const jobSite = this.localStorageService.getSelectedJobsiteObject();
        if (jobSite) {
          if (jobSite.id === 'jid') {
            this.JobSiteDetail = null;
            if (this.rolename === 'SUBCONTRACTOR') {
              this.getSelectedJobsChat();
            }
          }
          else {
            this.JobSiteDetail = jobSite;
            if (this.rolename === 'CLIENT') {
              this.getListOfuser();
            } else if (this.biddingType === 'BY_PROJECT') {
              this.getSelectedJobsChat();
              this.markMessageAsSeen2(this.loggedInUser.id, ' ', this.JobSiteDetail.id, ' ');
            } else if (this.biddingType === 'BY_JOBSITE') {
              this.getSelectedJobsChat();
              this.markMessageAsSeen2(this.loggedInUser.id, ' ', this.JobSiteDetail.id, ' ');
            }
            if (this.JobSiteDetail !== null) {
            }
          }
        }
        else {
          this.JobSiteDetail = null;
        }
      } else {
        this.JobSiteDetail = null;
      }
    }));
  }

  markMessageAsSeen(id, projectId, jobsiteId, jobId): void {
    this.chatMessageService.markNotificationAsSeenByUserId(id, projectId, jobsiteId, jobId).subscribe(e => {
      if (e.statusCode === '200' && e.message === 'OK') {
        this.chatMessageService.unreadMessagesCount.next(0);
      } else {
        this.notificationService.error(e.message, '');
      }
    },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  markMessageAsSeen1(id, projectId, jobsiteId, jobId): void {
    this.chatMessageService.markNotificationAsSeenByUserId1(id, projectId).subscribe(e => {
      if (e.statusCode === '200' && e.message === 'OK') {
        this.chatMessageService.unreadMessagesCount.next(0);
      } else {
        this.notificationService.error(e.message, '');
      }
    },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  markMessageAsSeen2(id, projectId, jobsiteId, jobId): void {
    this.chatMessageService.markNotificationAsSeenByUserId2(id, jobsiteId).subscribe(e => {
      if (e.statusCode === '200' && e.message === 'OK') {
        this.chatMessageService.unreadMessagesCount.next(0);
      } else {
        this.notificationService.error(e.message, '');
      }
    },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  markMessageAsSeen3(id, projectId, jobsiteId, jobId): void {
    this.chatMessageService.markNotificationAsSeenByUserId3(id, jobId).subscribe(e => {
      if (e.statusCode === '200' && e.message === 'OK') {
        this.chatMessageService.unreadMessagesCount.next(0);
      } else {
        this.notificationService.error(e.message, '');
      }
    },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      });
  }

  getListOfuser(): void {
    this.userFromTheList = null;

    if (this.selectedProjectDetail && this.JobSiteDetail && this.postType === 'PROJECT') {
      this.chatMessageService.getListOfUserByJobsite(this.JobSiteDetail.id, this.selectedProjectDetail.id).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.data.length !== 0) {
              this.userList = data.data as User[];
            } else {
              this.userList = [];
            }
          }
        });
    } else if (this.selectedJob && this.postType === 'JOB') {
      this.chatMessageService.getListOfUserByJob(this.selectedJob.id).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.data.length !== 0) {
              this.userList = data.data as User[];
            } else {
              this.userList = [];
            }
          }
        });
    } else if (this.selectedProjectDetail && this.postType === 'PROJECT') {
      this.chatMessageService.getListOfUserByProject(this.selectedProjectDetail.id).subscribe(
        data => {
          if (data.statusCode === '200') {
            if (data.data.length !== 0) {
              this.userList = data.data as User[];
            } else {
              this.userList = [];
            }
          }
        });
    } else {
      this.userList = [];
    }
  }

  getSelectedJobsChat(user?): void {
    const filterMap = new Map();
    const loggedInUserId = this.localStorageService.getLoginUserId();
    if (user) {
      filterMap.set('USER_ID', user.id);
    } else {
      filterMap.set('USER_ID', loggedInUserId);
    }
    if (this.selectedJob) {
      filterMap.set('JOB_DETAIL_ID', this.selectedJob.id);
      filterMap.set('TYPE', 'JOB');
    }
    if (this.selectedProjectDetail) {
      filterMap.set('PROJECT_DETAIL_ID', this.selectedProjectDetail.id);
      filterMap.set('TYPE', 'PROJECT');
    }
    if (this.selectedProjectDetail && this.JobSiteDetail) {
      filterMap.set('JOB_SITE_ID', this.JobSiteDetail.id);
      filterMap.set('TYPE', 'JOBSITE');
    }
    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };

    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.chatMessageService.getChat(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.data.result.length !== 0) {
            this.chatData = data.data.result as ChatMessageDTOWithProfile[];
          } else {
            this.chatData = [];
          }
        }
      });
  }

  getSearchText(): void {
    const filterMap = new Map();

    filterMap.set('USER_ID', this.loggedInUser.id);

    if (this.searchText) {
      filterMap.set('SEARCH_TEXT', this.searchText);
    }

    if (this.selectedJob) {
      filterMap.set('JOB_DETAIL_ID', this.selectedJob.id);
    }

    if (this.selectedProjectDetail) {
      filterMap.set('PROJECT_DETAIL_ID', this.selectedProjectDetail.id);
    }

    if (this.selectedProjectDetail && this.JobSiteDetail) {
      filterMap.set('JOB_SITE_ID', this.JobSiteDetail.id);
    }

    const jsonObject = {};
    filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: 10000,
      sortField: 'CREATED_DATE',
      sortOrder: this.sortOrder,
      searchText: this.globalFilter
    };
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.chatMessageService.getChat(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.data.result.length !== 0) {
            this.chatData = data.data.result as ChatMessageDTOWithProfile[];
          } else {
            this.chatData = [];
          }
        }
      });

  }

  private prepareQueryParam(paramObject): URLSearchParams {
    const params = new URLSearchParams();
    // tslint:disable-next-line: forin
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  showMessageDialog(): void {
    this.dialog = true;
  }

  hideDialog(): void {
    this.dialog = false;
    this.submitted = false;
  }

  onRemoveFromList(id): void {
    const fileTemp: File[] = [];
    this.files.forEach((e, index) => {
      if (index !== id) {
        fileTemp.push(e);
      }
    });
    this.files.length = 0;
    this.files = fileTemp;
    this.notificationService.success(this.translator.instant('message.file.deleted'), '');
  }

  onSelect(event): void {
    this.files.splice(2, 0, ...event.addedFiles);
  }

  sendMessage(): void {
    if (this.message) {
      this.submitted = true;
      this.chatMessageDTO.message = this.message;
      this.chatMessageDTO.postedBy = this.loggedInUser;
      if (this.attachmentList[0]) {
        this.chatMessageDTO.documentName1 = this.attachmentList[0].fileName;
        this.chatMessageDTO.documentPath1 = this.attachmentList[0].path;
      }
      if (this.attachmentList[1]) {
        this.chatMessageDTO.documentName2 = this.attachmentList[1].fileName;
        this.chatMessageDTO.documentPath2 = this.attachmentList[1].path;
      }
      if (this.attachmentList[2]) {
        this.chatMessageDTO.documentName3 = this.attachmentList[2].fileName;
        this.chatMessageDTO.documentPath3 = this.attachmentList[2].path;
      }

      if (this.rolename === 'CLIENT' && this.selectedJob) {
        this.chatMessageDTO.postedTo = this.userFromTheList;
        this.chatMessageDTO.type = 'JOB';
        this.chatMessageDTO.job = this.selectedJob;
      } else if (this.rolename !== 'CLIENT' && this.selectedJob) {
        this.chatMessageDTO.postedTo = this.selectedJob.user;
        this.chatMessageDTO.type = 'JOB';
        this.chatMessageDTO.job = this.selectedJob;
      }

      if (this.rolename === 'CLIENT' && this.selectedProjectDetail) {
        this.chatMessageDTO.postedTo = this.userFromTheList;
        this.chatMessageDTO.type = 'PROJECT';
        this.chatMessageDTO.project = this.selectedProjectDetail;
      } else if (this.rolename !== 'CLIENT' && this.selectedProjectDetail) {
        this.chatMessageDTO.postedTo = this.selectedProjectDetail.user;
        this.chatMessageDTO.type = 'PROJECT';
        this.chatMessageDTO.project = this.selectedProjectDetail;
      }

      if (this.rolename === 'CLIENT' && this.selectedProjectDetail && this.JobSiteDetail) {
        this.chatMessageDTO.postedTo = this.userFromTheList;
        this.chatMessageDTO.type = 'JOBSITE';
        this.chatMessageDTO.jobSite = this.JobSiteDetail;
        this.chatMessageDTO.project = this.selectedProjectDetail;
      } else if (this.rolename !== 'CLIENT' && this.selectedProjectDetail && this.JobSiteDetail) {
        this.chatMessageDTO.postedTo = this.JobSiteDetail.user;
        this.chatMessageDTO.type = 'JOBSITE';
        this.chatMessageDTO.jobSite = this.JobSiteDetail;
        this.chatMessageDTO.project = this.selectedProjectDetail;
      }

      if (this.attachmentList[3]) {
        this.notificationService.error(this.translator.instant('you.can.attach.maximum.three.files'), '');
        this.attachmentList.length = 0;
      } else {
        this.chatMessageService.create(this.chatMessageDTO).subscribe(data => {
          if (data.message === 'OK' && data.statusCode === '200') {
            this.notificationService.success(this.translator.instant('message.sent'), '');
            this.files.length = 0;
            this.attachmentList.length = 0;
            this.message = null;
            this.chatMessageDTO = new ChatMessageDTO();
            if (this.rolename === 'CLIENT') {
              this.getSelectedJobsChat(this.userFromTheList);
            } else {
              this.getSelectedJobsChat();
            }
          }
          else {
            this.notificationService.error(data.message, '');
            this.files.length = 0;
            this.attachmentList.length = 0;
            this.message = null;
            this.chatMessageDTO = new ChatMessageDTO();
            if (this.rolename === 'CLIENT') {
              this.getSelectedJobsChat(this.userFromTheList);
            } else {
              this.getSelectedJobsChat();
            }
          }
        });
      }
    } else {

    }

  }

  uploadFile(): void {
    if (this.files.length !== 0) {
      const uploadFileData = new FormData();
      this.files.forEach(element => {
        uploadFileData.append('file', element);
      });
      this.fileService.uploadMultipleFile(uploadFileData).subscribe(
        event => {
          if (event instanceof HttpResponse) {
            this.logoBody = event.body;
            this.logoData = this.logoBody.data;
            this.files.forEach((element, i) => {
              this.attachment = new ChatMessageAttachmentDTO(element.name, this.logoData[i]);
              this.attachmentList.push(this.attachment);
            });
            this.sendMessage();
          }
        },
        (error) => {
          this.notificationService.error(this.translator.instant('common.error'), '');
        });
    }
    else {
      this.sendMessage();
    }
  }

  openDeleteDialogForTemp(index, title): void {
    let options = null;
    const message = this.translator.instant('dialog.message.delete');
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message}?`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.onRemoveFromList(index);
      }
    });
  }

  download(id, name): void {
    this.fileService.downloadFiles(id, name).subscribe(
      data => {
        const blob = new Blob([data], { type: 'application/pdf' });
        const fileName = name;
        saveAs(blob, fileName);
      },
      (error) => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  isImage(name: string): boolean {
    if (name.endsWith('pdf')) {
      return false;
    } else {
      return true;
    }
  }

  onChange(user): void {
    this.getSelectedJobsChat(user);
    if (this.selectedJob) {
      this.markMessageAsSeen3(this.loggedInUser.id, ' ', ' ', this.selectedJob.id);
    } else if (this.selectedProjectDetail) {
      this.markMessageAsSeen1(this.loggedInUser.id, this.selectedProjectDetail.id, ' ', ' ');
    } else if (this.selectedProjectDetail && this.JobSiteDetail) {
      this.markMessageAsSeen2(this.loggedInUser.id, ' ', this.JobSiteDetail.id, ' ');
    }
  }

  filterUserList(event): void {
    const filtered: any[] = [];
    const query = event.query;
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < this.userList.length; i++) {
      const entity = this.userList[i];
      if (entity.firstName.toLowerCase().indexOf(query.toLowerCase()) === 0) {
        filtered.push(entity);
      }
    }
    this.userList = filtered;
    this.userList = this.userList.sort();
  }
  getFullName(data: User) {
    return data.firstName + ' ' + data.lastName;
  }
}
