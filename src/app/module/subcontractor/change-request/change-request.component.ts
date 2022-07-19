import { DatePipe } from "@angular/common";
import { HttpResponse } from "@angular/common/http";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { Table } from "primeng/table";
import { Subscription } from "rxjs";
import { ConfirmDialogueService } from "src/app/confirm-dialogue.service";
import { FileDownloadService } from "src/app/service/admin-services/fileDownload/file-download.service";
import { UomService } from "src/app/service/admin-services/uom/uom.service";
import { ChangeRequestService } from "src/app/service/client-services/change-request/change-request.service";
import { ProjectJobSelectionService } from "src/app/service/client-services/project-job-selection.service";
import { DateHelperService } from "src/app/service/date-helper.service";
import { FilterLeftPanelDataService } from "src/app/service/filter-left-panel-data.service";
import { HeaderManagementService } from "src/app/service/header-management.service";
import { LocalStorageService } from "src/app/service/localstorage.service";
import { COMMON_CONSTANTS } from "src/app/shared/CommonConstants";
import { CustomValidator } from "src/app/shared/CustomValidator";
import { UINotificationService } from "src/app/shared/notification/uinotification.service";
import { ChangeRequest } from "src/app/shared/vo/ChangeRequest";
import { ChangeRequestAttachment } from "src/app/shared/vo/ChangeRequestAttachment";
import { ChangeRequestDTO } from "src/app/shared/vo/ChangeRequestDTO";
import { DataTableParam } from "src/app/shared/vo/DataTableParam";
import { ChangeRequestStatusDTO } from "../../client/Vos/ChangeRequestStatusDTO";
import { JobsiteDetail } from "../../client/Vos/jobsitemodel";
import { ProjectDetail } from "../../client/Vos/projectDetailmodel";
@Component({
  selector: "app-change-request",
  templateUrl: "./change-request.component.html",
  styleUrls: ["./change-request.component.css"],
})
export class ChangeRequestComponent implements OnInit {
  blockSpecial: RegExp = COMMON_CONSTANTS.blockSpecial;
  loading = false;
  offset: Number = 0;
  totalRecords: Number = 0;
  dialogHeader: string;
  isFilterOpened = false;
  changeRequestDialog = false;
  changeRequestForm: FormGroup;
  loggedInUserId: string;
  projectTypes: ProjectDetail[] = [];
  jobsiteTypes: JobsiteDetail[] = [];
  selectedProject: ProjectDetail = null;
  selectedJobsite: JobsiteDetail = null;
  filteredJobsite: JobsiteDetail[];
  filteredProject: ProjectDetail[];
  previousSelectedJobsite: JobsiteDetail = null;
  assignedTo: any;
  submitted = false;
  isSelectedProject = false;
  isSelectedJobsite = false;
  selectedFile: File;
  datatableParam: DataTableParam;
  filterMap = new Map();
  sortField = "CREATED_DATE";
  queryParam;
  size = COMMON_CONSTANTS.MASTER_TABLE_ROW_SIZE;
  rowsPerPageOptions = COMMON_CONSTANTS.MASTER_TABLE_PAGINATE_DROPDOWN;
  sortOrder;
  globalFilter;
  titleFilterValue: string;
  subcontractorFilterValue: any;
  keywordFilterValue: any;
  fromDateFilterValue: any;
  toDateFilterValue: any;
  isInEditMode = false;
  actionTypes: any;
  selectedChangeRequest: any[];
  selectedAction: any;
  status: any;
  subscription = new Subscription();
  fileLabel = this.translator.instant("choose.file");

  files: File[] = [];
  FileName = "";
  selectedLogo: File;
  showPreview = false;
  logoBody: any;
  logoData: string;
  image: any;
  singleImageView: any;

  // DTO
  changeRequest: ChangeRequest;
  changeRequestDto = new ChangeRequestDTO();
  attachment: ChangeRequestAttachment;
  attachmentList: ChangeRequestAttachment[] = [];
  lineItemsList: FormArray;
  lineItemDTO: any = [];
  lineItemDTO2: any = [];
  lineItemArray: any = [];
  // filter field
  startDate: Date;
  endDate: Date;
  tempDate;
  ChangeReequestTitleList = [];
  FilterFormGroup: FormGroup;
  emptyArray = [];

  ///////////////////////////////
  fatchedAttachmentList = [];
  changeRequestId;
  reason;
  rejectDialog = false;
  reasonToRejectForm: FormGroup;
  statusChangeToApproveList;
  statusChangeToRejectList;

  ////////////////////////////
  @ViewChild("dt") table: Table;
  columns = [];
  ChangeRequestList = [];
  spinner: boolean;
  loginUser: any;
  assignedToObject;
  dateFlag = false;
  titleParmas: { userId: string; name: any };
  keyword: any;
  title = [];
  subcontractors = [];
  listTemp = [];
  subcontractorNameParams: { name: any };
  submittedReason = false;

  createdFromDate;
  createdToDate;
  truncateLength = COMMON_CONSTANTS.TRUNCATE_LENGTH;

  changeRequestStatus: ChangeRequestStatusDTO;
  totalStatusCount = 0;

  selectedUOM: "";
  selectedQty: "";
  isLineItem = false;
  details: any = [];
  uom: any = [];
  filteredUom: any[];
  errorLineitem = false;
  constructor(
    private captionChangeService: HeaderManagementService,
    private _localStorageService: LocalStorageService,
    private confirmDialogService: ConfirmDialogueService,
    private _formBuilder: FormBuilder,
    private translator: TranslateService,
    private filterlLeftPanelService: FilterLeftPanelDataService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private _notificationService: UINotificationService,
    private _fileService: FileDownloadService,
    private changeRequestService: ChangeRequestService,
    private dateHelperService: DateHelperService,
    private _uomService: UomService,
    private changeDetector: ChangeDetectorRef
  ) {
    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.addHideAllLabelSubject.next(false);
  }

  ngOnInit(): void {
    this.actionTypes = [
      { name: "APPROVE", value: "Approve" },
      { name: "REJECT", value: "Reject" },
    ];
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.loginUser = this._localStorageService.getLoginUserObject();
    this.dialogHeader = this.translator.instant("add.change.request");
    this.captionChangeService.hideHeaderSubject.next(true);
    this.projectJobSelectionService.addHideAllLabelSubject.next(false);
    this.initializeFilterFormGroup();
    this.setProject();
    this.setJobsite();
    this.setColumnOfTable();
    this.initializeChangeRequestForm();
    this.loadUomList();
    this.reasonToRejectForm = this._formBuilder.group({
      reason: ["", Validators.required],
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private setColumnOfTable() {
    this.columns = [
      {
        label: this.translator.instant("status"),
        value: "status",
        sortable: false,
        isHidden: false,
      },
      {
        label: this.translator.instant("project.title"),
        value: "PROJECT_TITLE",
        sortable: true,
        isHidden: this.isSelectedProject ? true : false,
      }, // this.selectedProject ? true :  this.isSelectedProject ? true :
      {
        label: this.translator.instant("jobsite.title"),
        value: "JOBSITE_TITLE",
        sortable: true,
        isHidden: this.isSelectedJobsite ? true : false,
      }, // this.isSelectedJobsite ? true :
      {
        label: this.translator.instant("client"),
        value: "CLIENT_NAME",
        sortable: true,
        isHidden: false,
      },
      {
        label: this.translator.instant("change.request.title"),
        value: "title",
        sortable: true,
        isHidden: false,
      },
      {
        label: this.translator.instant("change.request.description"),
        value: "description",
        sortable: true,
        isHidden: false,
      },
      {
        label: this.translator.instant("created.date"),
        value: "CREATED_DATE",
        sortable: true,
        isHidden: false,
      },
      {
        label: this.translator.instant("created.by"),
        value: "CREATED_BY_NAME",
        sortable: true,
        isHidden: false,
      },
      {
        label: this.translator.instant("cost"),
        value: "cost",
        sortable: true,
        isHidden: false,
      },
    ];
  }

  private setProject() {
    this.subscription.add(
      this.projectJobSelectionService.selectedProjectSubject.subscribe(
        (data) => {
          this.selectedChangeRequest = [];
          const project = this._localStorageService.getSelectedProjectObject();
          this._localStorageService.removeItem("selectedJobsite");

          if (project) {
            this.selectedProject = null;
            this.selectedJobsite = null;
            if (project.id === "pid") {
              this.isSelectedProject = false;
              this.isSelectedJobsite = false;
              this.filterChangeRequestLoadAll();
            } else {
              this.isSelectedJobsite = false;
              this.jobsiteTypes = this._localStorageService.getAllJobsite();
              for (let i = 0; i < this.jobsiteTypes.length; i++) {
                if (this.jobsiteTypes[i].id === "jid") {
                  this.jobsiteTypes.splice(i, 1);
                }
              }
              this.projectTypes.splice(0, this.projectTypes.length);
              this.projectTypes.push(project);
              this.selectedProject = project;
              if (this.selectedProject !== null) {
                this.isSelectedProject = true;
                this.filterChangeRequestLoadAll();
              }
            }
          } else {
            this.selectedProject = null;
            this.selectedJobsite = null;
            this.isSelectedProject = false;
            this.isSelectedJobsite = false;
            this.filterChangeRequestLoadAll();
          }
          this.setColumnOfTable();
        }
      )
    );
  }

  lineItemDetails(details) {
    // this.changeRequestForm.setControl( 'lineitem' ,this._formBuilder.array([]))

    this.lineItemsList = this.changeRequestForm.get("lineitem") as FormArray;
    this.isLineItem =
      details && details.lineItem && details.lineItem.length ? true : false;
    details &&
      details.lineItem.forEach((element: any, index) => {
        this.lineItemsList.push(
          this._formBuilder.group({
            unit: [""],
            quantity: [""],
            lineItem: [element],
            changeRequestStatus: [false],
            cost: [],
          })
        );
      });
  }

  setValidations(event, index,details) {
    if (this.changeRequestForm.value.lineitem.length == 0 && !event.checked) {
      this.errorLineitem = true;
    } else {
      this.errorLineitem = false;
    }
    if (event.checked) {
      let groupItems = this.changeRequestForm.get("lineitem") as FormArray;
      
      groupItems;
      for (let index = 0; index < groupItems.length; index++) {
       if(details.id == groupItems.value[index].lineItem.id) {
        groupItems.at(index).get("unit").setValidators(Validators.required);
        groupItems.at(index).get("cost").setValidators(Validators.required);
        groupItems.at(index).get("quantity").setValidators(Validators.required);

        groupItems.at(index).get("unit").updateValueAndValidity();
        groupItems.at(index).get("cost").updateValueAndValidity();
        groupItems.at(index).get("quantity").updateValueAndValidity();
       }
      
      }
    } else {
      let groupItems = this.changeRequestForm.get("lineitem") as FormArray;
      groupItems;
      for (let index = 0; index < groupItems.length; index++) {
        groupItems.at(index).get("unit").clearValidators();
        groupItems.at(index).get("cost").clearValidators();
        groupItems.at(index).get("quantity").clearValidators();

        groupItems.at(index).get("unit").updateValueAndValidity();
        groupItems.at(index).get("cost").updateValueAndValidity();
        groupItems.at(index).get("quantity").updateValueAndValidity();
      }
    }
  }

  private setJobsite() {
    this.subscription.add(
      this.projectJobSelectionService.selectedJobsiteSubject.subscribe(
        (data) => {
          this.selectedChangeRequest = [];
          const jobsite = this._localStorageService.getSelectedJobsiteObject();
          if (jobsite) {
            if (jobsite.id === "jid") {
              this.selectedJobsite = null;
              this.isSelectedJobsite = false;
              this.filterChangeRequestLoadAll();
            } else {
              this.selectedJobsite = jobsite;
              this.details = jobsite;
              this.isSelectedJobsite = true;

              if (jobsite.assignedTo) {
                this.assignedTo = jobsite.assignedTo.firstName;
                this.assignedToObject = jobsite.assignedTo;
              } else {
                this.assignedTo = null;
                this.assignedToObject = null;
              }
              this.previousSelectedJobsite = jobsite;
              if (this.selectedJobsite !== null) {
                this.isSelectedJobsite = true;
                this.filterChangeRequestLoadAll();
              }
            }
          } else {
            this.selectedJobsite = null;
            this.isSelectedJobsite = false;
            this.filterChangeRequestLoadAll();
          }
          this.setColumnOfTable();
        }
      )
    );
  }

  filterChangeRequestLoadAll() {
    this.filterMap.clear();
    this.filterMap.set("USER_ID", this.loggedInUserId);
    if (this.selectedProject) {
      this.filterMap.set("PROJECT_ID", this.selectedProject.id);
    }
    if (this.selectedJobsite) {
      this.filterMap.set("JOBSITE_ID", this.selectedJobsite.id);
    }
    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });
    this.globalFilter = JSON.stringify(jsonObject);
    this.datatableParam = {
      offset: this.offset,
      size: this.size,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter,
    };
    this.loadChangeRequestList();
  }

  onSelect(event) {
    this.files.splice(2, 0, ...event.addedFiles);
    if (this.files[5] != null) {
    }
    if (event.rejectedFiles.length > 0) {
      if (event.rejectedFiles[0].reason === "size") {
        this._notificationService.error(
          this.translator.instant("max.file.size.10.mb"),
          ""
        );
      } else {
        this._notificationService.error(
          this.translator.instant("image.pdf.upload"),
          ""
        );
      }
      event.rejectedFiles = [];
    }
  }

  onRemove(event) {
    this.files.splice(this.files.indexOf(event), 1);
  }

  onRemoveFromList(id) {
    const fileTemp: File[] = [];
    this.files.forEach((e, index) => {
      if (index !== id) {
        fileTemp.push(e);
      }
    });
    this.files.length = 0;
    this.files = fileTemp;
    this._notificationService.success(
      this.translator.instant("document.deleted"),
      ""
    );
  }

  onRemoveFromDBList(id, cId) {
    this.changeRequestService.deleteChangeRequest(id).subscribe((data) => {
      if (data.statusCode === "200" && data.message === "OK") {
        this._notificationService.success(
          this.translator.instant("document.deleted"),
          ""
        );
        setTimeout(() => {
          this.getLatestAttachmentList(cId);
        }, 2000);
        this.loadChangeRequestList();
      } else {
        this._notificationService.error(data.message, "");
        this.loadChangeRequestList();
      }
    });
  }

  getLatestAttachmentList(id) {
    const datatableParam = {
      offset: this.offset,
      size: 7,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: `{"CHANGE_REQUEST_ID":"${id}"}`,
    };
    const queryParam = this.prepareQueryParam(datatableParam);
    this.changeRequestService
      .getChangeRequestAttachmentList(queryParam)
      .subscribe((data) => {
        this.fatchedAttachmentList = data.data.result;
      });
  }

  uploadFile(next?: string) {
   console.log('this.changeRequestDto =>',this.changeRequestDto);
   
    
    this.changeRequestDto.lineItems = [];
      this.changeRequestForm.value.lineitem.forEach((element) => {
        if (element.changeRequestStatus) {
          this.changeRequestDto.lineItems.push(element);
        }
      })

      if(  this.changeRequestDto.lineItems.length == 0){
        this.errorLineitem = true;
      }else{
        this.errorLineitem = false;
      }
  

    if (!this.changeRequestForm.valid) {
      CustomValidator.markFormGroupTouched(this.changeRequestForm);
      this.submitted = true;
      this.spinner = false;
     
      return false;
    }

    this.spinner = true;
    if (next == "editMode") {
      if (this.files.length + this.fatchedAttachmentList.length >= 0) {
        if (this.files.length + this.fatchedAttachmentList.length <= 5) {
          this.attachment = new ChangeRequestAttachment();
          const uploadFileData = new FormData();

          this.files.forEach((element) => {
            uploadFileData.append("file", element);
          });

          this._fileService.uploadMultipleFile(uploadFileData).subscribe(
            (event) => {
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                if (this.logoData.length === this.files.length) {
                  this.files.forEach((element, i) => {
                    this.attachment = new ChangeRequestAttachment(
                      element.name,
                      this.logoData[i]
                    );
                    this.attachmentList.push(this.attachment);
                  });
                  this.onSubmitChangeRequestForm();
                }
              }
            },
            (error) => {
              this._notificationService.error(
                this.translator.instant("common.error"),
                ""
              );
              this.spinner = false;
            }
          );
        } else {
          this._notificationService.error(
            "You can upload maximum 5 Attachments",
            ""
          );
        }
      } else {
        this.onSubmitChangeRequestForm();
      }
    } else {
      if (this.files.length !== 0) {
        if (this.files.length <= 5) {
          this.attachment = new ChangeRequestAttachment();
          const uploadFileData = new FormData();
          this.files.forEach((element) => {
            uploadFileData.append("file", element);
          });

          this._fileService.uploadMultipleFile(uploadFileData).subscribe(
            (event) => {
              if (event instanceof HttpResponse) {
                this.logoBody = event.body;
                this.logoData = this.logoBody.data;
                if (this.logoData.length === this.files.length) {
                  this.files.forEach((element, i) => {
                    this.attachment = new ChangeRequestAttachment(
                      element.name,
                      this.logoData[i]
                    );
                    this.attachmentList.push(this.attachment);
                  });
                  this.onSubmitChangeRequestForm();
                }
              }
            },
            (error) => {
              this._notificationService.error(
                this.translator.instant("common.error"),
                ""
              );
              this.spinner = false;
            }
          );
        } else {
          this._notificationService.error(
            "You can upload maximum 5 Attachments",
            ""
          );
        }
      } else {
        this.onSubmitChangeRequestForm();
      }
    }
  }

  onFilterOpen() {
    this.isFilterOpened = !this.isFilterOpened;
  }

  openChangeRequestDialog(): void {
    this.submitted = false;
    this.fileLabel = this.translator.instant("choose.file");
    this.dialogHeader = this.translator.instant("add.change.request");
    this.initializeChangeRequestForm();
    if (this.selectedProject !== null) {
      this.isSelectedProject = true;
      this.changeRequestForm.controls.project.patchValue(this.selectedProject);
    }

    if (this.selectedJobsite !== null) {
      this.isSelectedJobsite = true;
      this.changeRequestForm.controls.jobSite.patchValue(this.selectedJobsite);
    }
    
    this.lineItemDetails(this.details);

    this.changeRequestDialog = true;
    this.changeDetector.detectChanges();
  }

  openDeleteDialog(id, title) {
    let options = null;
    const message = this.translator.instant("dialog.message.delete");
    options = {
      title: this.translator.instant("warning"),
      message: this.translator.instant(`${message}?`),
      cancelText: this.translator.instant("dialog.cancel.text"),
      confirmText: this.translator.instant("dialog.confirm.text"),
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        if (id) {
          this.onRemoveFromDBList(id, this.changeRequestId);
        }
      }
    });
  }

  openDeleteDialogForTemp(index, title) {
    let options = null;
    const message = this.translator.instant("dialog.message.delete");
    options = {
      title: this.translator.instant("warning"),
      message: this.translator.instant(`${message}?`),
      cancelText: this.translator.instant("dialog.cancel.text"),
      confirmText: this.translator.instant("dialog.confirm.text"),
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        this.onRemoveFromList(index);
      }
    });
  }

  hideChangeRequestDialog(): void {
    this.changeRequestDialog = false;
    this.files.length = 0;
    this.fatchedAttachmentList.length = 0;
    this.submitted = false;
    this.loadChangeRequestList();
  }

  //nip
  private initializeChangeRequestForm() {
    this.changeRequestForm = this._formBuilder.group({
      id: [],
      createdBy: this.loggedInUserId,
      updatedBy: this.loggedInUserId,
      raisedBy: this.loggedInUserId,
      raisedTo: this.assignedTo,
      raisedToId: this.assignedTo,
      project: this.selectedProject,
      jobSite: this.selectedJobsite,
      title: ["", [Validators.required, Validators.maxLength(100)]],
      description: ["", [Validators.required, Validators.maxLength(500)]],
      // cost: [null, [Validators.required, Validators.min(0.01)]],
      status: ["PENDING", Validators.required],
      lineitem: this._formBuilder.array([]),
    });
  }

  // nip
  get lineItems(): FormArray {
    return this.changeRequestForm.controls["lineitem"] as FormArray;
  }

  onChangeStatusOfselected() {
    if (this.selectedChangeRequest?.length) {
      if (this.selectedAction) {
        if (this.selectedAction.name === "REJECT") {
          const idList = [];
          this.selectedChangeRequest.forEach((e) => {
            if (
              e.changeRequest.status === "PENDING" &&
              e.changeRequest.raisedBy.id !== this.loggedInUserId
            ) {
              idList.push(e.changeRequest);
            }
          });
          this.onRejectChangeRequest(null, idList);
        }
        if (this.selectedAction.name === "APPROVE") {
          const idList = [];
          this.selectedChangeRequest.forEach((e) => {
            if (
              e.changeRequest.status === "PENDING" &&
              e.changeRequest.raisedBy.id !== this.loggedInUserId
            ) {
              idList.push(e.changeRequest);
            }
          });
          this.onOpenDialogOfApproveList(idList);
        }
      } else {
        this._notificationService.error("Select action of Status", "");
      }
    } else {
      this._notificationService.error(
        this.translator.instant("select.action"),
        ""
      );
    }
  }

  onSubmitChangeRequestForm() {
    this.submitted = true;

    if(  this.changeRequestDto.lineItems.length == 0){
      this.errorLineitem = true;
    }else{
   this.errorLineitem = false;
    }

    if (!this.changeRequestForm.valid) {
      this.errorLineitem = true;
      CustomValidator.markFormGroupTouched(this.changeRequestForm);
      this.submitted = true;
      this.spinner = false;
      return false;
    }

    if (this.changeRequestForm.valid) {
      this.changeRequestDto.lineItems = [];
      this.changeRequestForm.value.lineitem.forEach((element) => {
        if (element.changeRequestStatus) {
          this.changeRequestDto.lineItems.push(element);
        }
      });

      
     
        if (this.changeRequestForm.controls.id.value !== null) {
          this.changeRequestDto.changeRequest = new ChangeRequest();

          this.changeRequestDto.attachments = this.attachmentList;
          this.changeRequestDto.changeRequest.id =
            this.changeRequestForm.value.id;
          this.changeRequestDto.changeRequest.title =
            this.changeRequestForm.value.title;
          this.changeRequestDto.changeRequest.raisedTo =
            this.changeRequestForm.value.raisedToId;
          this.changeRequestDto.changeRequest.project =
            this.changeRequestForm.value.project;
          this.changeRequestDto.changeRequest.jobSite =
            this.changeRequestForm.value.jobSite;
          this.changeRequestDto.changeRequest.raisedBy = this.loginUser;
          this.changeRequestDto.changeRequest.description =
            this.changeRequestForm.value.description;
          // this.changeRequestDto.changeRequest.cost =
          //   this.changeRequestForm.value.cost;
          this.changeRequestDto.changeRequest.status =
            this.changeRequestForm.value.status;
          this.changeRequestDto.changeRequest.updatedBy =
            this.changeRequestForm.value.updatedBy;

          this.changeRequestService
            .updateChangeRequest(this.changeRequestDto)
            .subscribe(
              (data) => {
                if (data.statusCode === "200" && data.message === "OK") {
                  this._notificationService.success(
                    this.translator.instant("change.request.added"),
                    ""
                  );
                  this.changeRequestDialog = false;
                  this.submitted = false;
                  this.files = [];
                  this.attachmentList = [];
                  this.fatchedAttachmentList.length = 0;
                  this.spinner = false;
                  this.isInEditMode = false;
                  this.loadChangeRequestList();
                } else {
                  this._notificationService.error(data.message, "");
                  this.submitted = false;
                  this.attachmentList = [];
                  this.fatchedAttachmentList.length = 0;
                  this.spinner = false;
                  this.isInEditMode = false;
                  this.loadChangeRequestList();
                }
              },
              (error) => {
                this._notificationService.error(
                  this.translator.instant("common.error"),
                  ""
                );
                this.changeRequestDialog = false;
                this.submitted = false;
                this.files = [];
                this.attachmentList = [];
                this.isInEditMode = false;
                this.fatchedAttachmentList.length = 0;
                this.spinner = false;
                this.loadChangeRequestList();
              }
            );
        } else {
          this.changeRequestDto.changeRequest = new ChangeRequest();

          this.changeRequestDto.attachments = this.attachmentList;

          this.changeRequestDto.changeRequest.raisedBy = this.loginUser;
          this.changeRequestDto.changeRequest.raisedTo =
            this.changeRequestForm.value.project.user;
          this.changeRequestDto.changeRequest.jobSite =
            this.changeRequestForm.value.jobSite;
          this.changeRequestDto.changeRequest.project =
            this.changeRequestForm.value.project;
          this.changeRequestDto.changeRequest.title =
            this.changeRequestForm.value.title;
          this.changeRequestDto.changeRequest.description =
            this.changeRequestForm.value.description;
          // this.changeRequestDto.changeRequest.cost =
          //   this.changeRequestForm.value.cost;
          this.changeRequestDto.changeRequest.status =
            this.changeRequestForm.value.status;
          this.changeRequestDto.changeRequest.createdBy =
            this.changeRequestForm.value.createdBy;
          this.changeRequestDto.changeRequest.updatedBy =
            this.changeRequestForm.value.updatedBy;

          this.changeRequestService
            .addChangeRequest(this.changeRequestDto)
            .subscribe(
              (data) => {
                if (data.statusCode === "200" && data.message === "OK") {
                  this._notificationService.success(
                    this.translator.instant("change.request.added"),
                    ""
                  );
                  this.changeRequestDialog = false;
                  this.submitted = false;
                  this.files = [];
                  this.attachmentList = [];
                  this.isInEditMode = false;
                  this.spinner = false;
                  this.loadChangeRequestList();
                } else {
                  this._notificationService.error(data.message, "");
                  this.submitted = false;
                  this.attachmentList = [];
                  this.spinner = false;
                  this.isInEditMode = false;
                  this.loadChangeRequestList();
                }
              },
              (error) => {
                this._notificationService.error(
                  this.translator.instant("common.error"),
                  ""
                );
                this.changeRequestDialog = false;
                this.submitted = false;
                this.files = [];
                this.attachmentList = [];
                this.isInEditMode = false;
                this.spinner = false;
                this.loadChangeRequestList();
              }
            );
        }
      
    } else {
      this._notificationService.error("Assign project ", "");
    }
  }

  onLazyLoad(event) {
    this.sortOrder = event.sortOrder === -1 ? 1 : 0;
    this.sortField = event.sortField ? event.sortField : "CREATED_DATE";
    this.offset = event.first / event.rows;
    this.datatableParam = {
      offset: this.offset,
      size: event.rows ? event.rows : 10,
      sortField: this.sortField.toUpperCase(),
      sortOrder: this.sortOrder,
      searchText: this.globalFilter,
    };
    this.loadChangeRequestList();
  }

  prepareQueryParam(paramObject) {
    const params = new URLSearchParams();
    for (const key in paramObject) {
      params.set(key, paramObject[key]);
    }
    return params;
  }

  loadChangeRequestList() {
    this.loading = true;
    this.queryParam = this.prepareQueryParam(this.datatableParam);
    this.changeRequestService.getChangeRequestList(this.queryParam).subscribe(
      (data) => {

        if (data.statusCode === "200") {
          if (data.message === "OK") {
            this.totalStatusCount = 0;
            this.loading = false;
            this.ChangeRequestList = data.data.result;
            this.offset = data.data.first;
            this.totalRecords = data.data.totalRecords;
            this.totalStatusCount = 0;
            this.ChangeRequestList.forEach((e) => {
              if (
                e.changeRequest.status === "PENDING" &&
                e.changeRequest.raisedBy.id !== this.loggedInUserId
              ) {
                this.totalStatusCount++;
              }
            });
          }
        } else {
          this.loading = false;
        }
      },
      (error) => {
        this.loading = false;
      }
    );
  }

  public initializeFilterFormGroup(): void {
    const changeRequestTitle = new FormArray([]);
    changeRequestTitle.push(
      this._formBuilder.group({
        title: [],
      })
    );
    this.FilterFormGroup = this._formBuilder.group({
      keyword: [""],
      changeRequestTitle: [""],
      dateRangeFrom: [""],
      dateRangeTo: [""],
    });
  }

  loadUomList() {
    let datatableParam: DataTableParam = {
      offset: 0,
      size: 1000000,
      sortField: "",
      sortOrder: 1,
      searchText: '{"IS_ENABLE" : true}',
    };
    this.queryParam = this.prepareQueryParam(datatableParam);
    this._uomService.getUOMList(this.queryParam).subscribe(
      (data) => {
        if (data.statusCode === "200") {
          if (data.message == "OK") {
            this.uom = data.data.result;
          }
        } else {
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }

  filterUom(event) {
    let filtered: any[] = [];
    let query = event.query;

    for (let i = 0; i < this.uom.length; i++) {
      let uom = this.uom[i];
      if (uom.name.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(uom);
      }
    }
    this.filteredUom = filtered;
    this.filteredUom = this.filteredUom.sort();
  }

  clear() {
    this.FilterFormGroup.reset();
    this.FilterFormGroup.get("changeRequestTitle").patchValue(this.emptyArray);
    this.filter();
  }

  getSubcontractorByName(name): void {
    this.subcontractorNameParams = {
      name: name.query,
    };
    this.queryParam = this.prepareQueryParam(this.subcontractorNameParams);
    this.filterlLeftPanelService
      .getSubcontractorByName(this.queryParam)
      .subscribe((data) => {
        this.subcontractors = data.data;
        this.subcontractors = this.subcontractors.sort();
      });
  }

  getChangeRequestTitle(name): void {
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.titleParmas = {
      name: name.query,
      userId: this.loggedInUserId,
    };
    this.queryParam = this.prepareQueryParam(this.titleParmas);
    this.filterlLeftPanelService
      .getChangeRequestTitleForClient(this.queryParam)
      .subscribe((data) => {
        this.ChangeReequestTitleList = data.data;
        this.ChangeReequestTitleList = this.ChangeReequestTitleList.sort();
      });
  }

  filter() {
    this.filterMap.clear();
    this.title.length = 0;
    this.listTemp.length = 0;
    this.dateFlag = false;

    if (
      (this.FilterFormGroup.value.dateRangeFrom &&
        !this.FilterFormGroup.value.dateRangeTo) ||
      (!this.FilterFormGroup.value.dateRangeFrom &&
        this.FilterFormGroup.value.dateRangeTo)
    ) {
      this.dateFlag = true;
    }

    if (
      !this.FilterFormGroup.value.dateRangeFrom &&
      !this.FilterFormGroup.value.dateRangeTo
    ) {
      this.dateFlag = false;
    }

    this.filterMap.set("USER_ID", this.loggedInUserId);
    if (this.FilterFormGroup.value.changeRequestTitle) {
      this.FilterFormGroup.value.changeRequestTitle.forEach((element) => {
        this.title.push(element);
        this.filterMap.set("TITLE", this.title.toString());
      });
    }
    if (this.FilterFormGroup.value.keyword) {
      this.keyword = this.FilterFormGroup.value.keyword;
      this.filterMap.set("KEY_WORD", this.keyword);
    }
    if (this.selectedProject) {
      this.filterMap.set("PROJECT_ID", this.selectedProject.id);
    }
    if (this.selectedJobsite) {
      this.filterMap.set("JOBSITE_ID", this.selectedJobsite.id);
    }
    if (
      this.FilterFormGroup.value.dateRangeFrom &&
      this.FilterFormGroup.value.dateRangeTo
    ) {
      this.startDate = this.FilterFormGroup.value.dateRangeFrom;
      this.dateHelperService.setStartDate(this.startDate);
      const datePipe = new DatePipe("en-US");
      const value = datePipe.transform(this.startDate, "yyyy-MM-dd HH:mm:ss");
      this.filterMap.set("START_DATE", value);
      this.endDate = this.FilterFormGroup.value.dateRangeTo;
      if (this.endDate) {
        this.dateHelperService.setEndDate(this.endDate);
        const valueEnd = datePipe.transform(
          this.endDate,
          "yyyy-MM-dd HH:mm:ss"
        );
        this.filterMap.set("END_DATE", valueEnd);
      }
    }

    const jsonObject = {};
    this.filterMap.forEach((value, key) => {
      jsonObject[key] = value;
    });

    if (!this.dateFlag) {
      this.globalFilter = JSON.stringify(jsonObject);
      this.datatableParam = {
        offset: this.offset,
        size: this.size,
        sortField: this.sortField.toUpperCase(),
        sortOrder: this.sortOrder,
        searchText: this.globalFilter,
      };
      this.loadChangeRequestList();
    } else {
      this._notificationService.error(
        this.translator.instant("please.enter.appropriate.date.range"),
        ""
      );
    }
  }

  // edit request
  editChangeRequest(changeRequestDetails: any) {

    this.dialogHeader = this.translator.instant("edit.change.request");
    this.isInEditMode = true;
    this.changeRequestDto = { ...changeRequestDetails };

    this.fatchedAttachmentList = this.changeRequestDto.attachments;
    this.changeRequestId = this.changeRequestDto.changeRequest.id;
    this.changeRequestForm.controls.id.patchValue(
      this.changeRequestDto.changeRequest.id
    );
    this.changeRequestForm.controls.title.patchValue(
      this.changeRequestDto.changeRequest.title
    );
    this.changeRequestForm.controls.project.patchValue(
      this.changeRequestDto.changeRequest.project
    );
    this.changeRequestForm.controls.jobSite.patchValue(
      this.changeRequestDto.changeRequest.jobSite
    );
    this.changeRequestForm.controls.raisedTo.patchValue(
      this.changeRequestDto.changeRequest.jobSite.assignedTo.firstName
    );
    this.changeRequestForm.controls.raisedToId.patchValue(
      this.changeRequestDto.changeRequest.jobSite.assignedTo
    );
    this.changeRequestForm.controls.description.patchValue(
      this.changeRequestDto.changeRequest.description
    );
    // this.changeRequestForm.controls.cost.patchValue(
    //   this.changeRequestDto.changeRequest.cost
    // );
    this.changeRequestForm.controls.updatedBy.patchValue(this.loggedInUserId);
    this.changeRequestForm.controls.createdBy.patchValue(
      this.changeRequestDto.changeRequest.createdBy
    );
    //snip
    // this.changeRequestForm.controls.lineitem.patchValue(this.changeRequestDto.lineItems)
    if (
      this.changeRequestForm.value.lineitem &&
      this.changeRequestForm.value.lineitem.length > 0
    ) {
      while (this.lineItems.length !== 0) {
        this.lineItems.removeAt(0);
      }
    }
    this.lineItemsList = this.changeRequestForm.get("lineitem") as FormArray;
    this.changeRequestDto.changeRequest.jobSite.lineItem.forEach(
      (e: any, index) => {
        this.lineItemsList.push(
          this._formBuilder.group({
            unit: [],
            quantity: [],
            lineItem: [e],
            changeRequestStatus: [],
            cost: [],
          })
        );
      }
    );

    this.changeRequestDto.lineItems.forEach((e: any, indexs) => {
      let groupItems = this.changeRequestForm.get("lineitem") as FormArray;
      groupItems;
      for (let index = 0; index < groupItems.length; index++) {
      
        if(e.lineItem.id === groupItems.at(index).get("lineItem").value.id ){

     
        groupItems.at(index).get("unit").patchValue(e.unit);
        groupItems.at(index).get("cost").patchValue(e.cost);
        groupItems.at(index).get("quantity").patchValue(e.quantity);
        groupItems
          .at(index)
          .get("changeRequestStatus")
          .patchValue(e.changeRequestStatus);
        groupItems.at(index).get("lineItem").patchValue(e.lineItem);

        groupItems.at(index).get("unit").updateValueAndValidity();
        groupItems.at(index).get("cost").updateValueAndValidity();
        groupItems.at(index).get("quantity").updateValueAndValidity();
        groupItems
          .at(index)
          .get("changeRequestStatus")
          .updateValueAndValidity();
        groupItems.at(index).get("lineItem").updateValueAndValidity();
      }
    }
    });

    this.isLineItem =
      this.changeRequestDto.changeRequest.jobSite.lineItem &&
      this.changeRequestDto.changeRequest.jobSite.lineItem.length
        ? true
        : false;
    this.changeRequestDialog = true;
  }

  onApproveChangeRequest(list) {
    this.spinner = true;
    this.changeRequestStatus = new ChangeRequestStatusDTO();
    this.changeRequestStatus.changeRequestIdList = [];
    this.changeRequestStatus.changeRequestIdList = list;
    this.changeRequestStatus.createdBy = this.loggedInUserId;
    this.changeRequestStatus.updatedBy = this.loggedInUserId;
    this.changeRequestService
      .approveChangeRequest(this.changeRequestStatus, false)
      .subscribe((data) => {
        if (data.statusCode === "200" && data.message === "OK") {
          this._notificationService.success(
            this.translator.instant("change.request.approved"),
            ""
          );
          this.spinner = false;
          this.selectedChangeRequest = [];
          this.selectedAction = null;
          this.loadChangeRequestList();
        } else {
          this._notificationService.error(data.message, "");
          this.spinner = false;
          this.selectedChangeRequest = [];
          this.loadChangeRequestList();
        }
      });
  }

  onRejectChangeRequest(id?: string, list?: any[]) {
    this.dialogHeader = "Warning";
    this.rejectDialog = true;
    if (list) {
      this.statusChangeToRejectList = list;
    } else {
      this.statusChangeToRejectList = [];
      this.statusChangeToRejectList.push(id);
    }
  }

  openDialog(id, title, status) {
    let options = null;
    const message = this.translator.instant("dialog.message");
    if (status === "approve") {
      this.status = this.translator.instant("approve");
    } else {
      this.status = this.translator.instant("reject");
    }
    options = {
      title: this.translator.instant("warning"),
      message: this.translator.instant(`${message} ${this.status} ?`),
      cancelText: this.translator.instant("dialog.cancel.text"),
      confirmText: this.translator.instant("dialog.confirm.text"),
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        if (status === "approve") {
          this.statusChangeToApproveList = [];
          this.statusChangeToApproveList.push(id);
          this.onApproveChangeRequest(this.statusChangeToApproveList);
        } else {
        }
      }
    });
  }

  onOpenDialogOfApproveList(idlist) {
    let options = null;
    const message = this.translator.instant("dialog.message");
    options = {
      title: this.translator.instant("warning"),
      message: this.translator.instant(`${message} approve ?`),
      cancelText: this.translator.instant("dialog.cancel.text"),
      confirmText: this.translator.instant("dialog.confirm.text"),
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe((confirmed) => {
      if (confirmed) {
        this.onApproveChangeRequest(idlist);
      }
    });
  }

  onSubmitRejected(list?) {
    this.submittedReason = true;
    this.spinner = true;
    if (!this.reasonToRejectForm.valid) {
      CustomValidator.markFormGroupTouched(this.reasonToRejectForm);
      this.submittedReason = true;
      this.spinner = false;
      return false;
    }
    this.changeRequestStatus = new ChangeRequestStatusDTO();
    if (list) {
      this.changeRequestStatus.changeRequestIdList = list;
    } else {
      this.changeRequestStatus.changeRequestIdList =
        this.statusChangeToRejectList;
    }
    this.changeRequestStatus.createdBy = this.loggedInUserId;
    this.changeRequestStatus.reasonToReject =
      this.reasonToRejectForm.value.reason;
    this.changeRequestStatus.updatedBy = this.loggedInUserId;
    this.changeRequestService
      .rejectChangeRequest(this.changeRequestStatus)
      .subscribe((data) => {
        if (data.statusCode === "200" && data.message === "OK") {
          this._notificationService.success(
            this.translator.instant("change.request.rejected"),
            ""
          );
          this.hideDialog();
          this.spinner = false;
          this.selectedChangeRequest = [];
          this.selectedAction = null;
          this.loadChangeRequestList();
        } else {
          this._notificationService.error(data.message, "");
          this.hideDialog();
          this.spinner = false;
          this.selectedChangeRequest = [];
          this.loadChangeRequestList();
        }
      });
  }

  hideDialog() {
    this.submittedReason = false;
    this.rejectDialog = false;
    this.reasonToRejectForm.reset();
  }

  // ngAfterContentChecked(): void {
  //   console.log('in detector =>');
  //   if(this.changeRequestDialog){

  //     this.changeDetector.detectChanges();
  //   }
  // }
}
