import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ReplaySubject, Subject, Subscriber } from 'rxjs';
import { concatMap, groupBy, map, toArray } from 'rxjs/operators';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { LineItem } from 'src/app/module/client/Vos/lineItemModel';
import { PaymentMileStone } from 'src/app/module/client/Vos/paymentMilestoneModel';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { ProjectBidService } from 'src/app/service/subcontractor-services/project-bid/project-bid.service';
import { CommonUtil } from 'src/app/shared/CommonUtil';
import { CustomValidator } from 'src/app/shared/CustomValidator';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { PATH_CONSTANTS } from 'src/app/shared/PathConstants';
import { DataTableParam } from 'src/app/shared/vo/DataTableParam';
import { BidDetailInfoDTO } from '../../vos/BidInfoDTO';
import { BidDetail } from '../../vos/JobSiteBidDetail';
import { LineItemBidDetail } from '../../vos/LineItemBidDetail';
import { PaymentMileStoneBidDetail } from '../../vos/PaymentMileStoneBidDetail';
import { ProjectBidDetail } from '../../vos/ProjectBidDetail';

@Component({
  selector: 'app-bid-quotation',
  templateUrl: './bid-quotation.component.html',
  styleUrls: ['./bid-quotation.component.css']
})
export class BidQuotationComponent implements OnInit, OnDestroy {

  id;
  viewInfo = false;
  workTypeList = [];
  paymentMileStoneList = [];
  linItemList = [];
  subscription = new Subscriber();
  projectDetailToBid: any;
  jobsiteDetailToBid: any = [];
  groupedLineItem = [];
  viewLineItem: LineItem;
  checkedProject = false;

  projectBidDetail: BidDetail;
  bidAmount = 0;

  projectBidDetailDto: ProjectBidDetail;
  loggedInUser: any;
  loggedInUserId: any;
  total = 0;

  jobSiteBidDetail = new BidDetail();
  biddedJobsiteData = new BidDetail();
  lineItemBidDetail = new LineItemBidDetail();
  paymentMileStoneBidDetail = new PaymentMileStoneBidDetail();
  biddedPaymentMileStoneData: PaymentMileStoneBidDetail[];

  filterMap = new Map();
  globalFilter;
  offset = 0;
  size = 10;
  datatableParam: DataTableParam;
  queryParam: URLSearchParams;
  sortOrder = 0;
  sortField: any = 'created_date';
  myForm: FormGroup;
  myFormMileStone: FormGroup;
  appliedOnProject = false;

  bidDetailInfoDTO: BidDetailInfoDTO;
  validateJobsiteList = [];
  tempListOfjobsite = [];

  //disable div
  disableBid = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private translator: TranslateService,
    private localStorageService: LocalStorageService,
    private projectBidService: ProjectBidService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private notificationService: UINotificationService,
    private confirmDialogService: ConfirmDialogueService
  ) {
    this.loggedInUser = this.localStorageService.getLoginUserObject();
    this.loggedInUserId = this.localStorageService.getLoginUserId();
    this.route.queryParams.subscribe(
      (params: Params) => {
        this.id = params.project;
      });
  }

  ngOnInit(): void {
    this.getSelectedProjectDetails();
    this.getSelectedProjectsJobsiteDetails();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    if (this.localStorageService.getItem('milestoneDetail')) {
      this.localStorageService.removeItem('milestoneDetail');
    }
  }

  onClick(): void {
    this.checkedProject = !this.checkedProject;
  }

  initializeForm(lineItemListToBid?): void {
    let tempLineItem;
    const lisOfGroupedLineItem = new FormArray([]);

    for (let i = 0; i < lineItemListToBid.length; i++) {
      tempLineItem = [];
      const temp = lineItemListToBid[i].value;
      const listOfLineItem = new FormArray([]);

      for (let i = 0; i < temp.length; i++) {
        listOfLineItem.push(
          this.formBuilder.group(
            {
              id: temp[i].id,
              lineItemId: temp[i].lineItemId,
              lineItemName: temp[i].lineItemName,
              cost: temp[i].cost,
              unit: temp[i].unit,
              quantity: temp[i].quantity,
              bidAmount: ['', CustomValidator.required],
            }
          ));
      }

      tempLineItem = listOfLineItem;
      lisOfGroupedLineItem.push(this.formBuilder.group({
        key: lineItemListToBid[i].key,
        value: tempLineItem
      })
      );

    }
    this.myForm = this.formBuilder.group({
      lisOfGroupedLineItem
    });
  }

  initializeFormOfPaymentMileStone(list?): void {
    const mileStone = new FormArray([]);
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < list.length; i++) {
      mileStone.push(this.formBuilder.group({
        id: '',
        name: list[i].name,
        deliverables: list[i].lineItem.length,
        percentage: [list[i].percentage, CustomValidator.required],
        amountRelease: [list[i].amount, CustomValidator.required]
      }));
    }
    this.myFormMileStone = this.formBuilder.group({
      mileStone
    });
  }

  getSelectedProjectsJobsiteDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedJobsiteSubject.subscribe(data => {
      const jobsite = this.localStorageService.getSelectedJobsiteObject();
      if (jobsite) {
        if (jobsite.id === 'jid') {
          this.jobsiteDetailToBid = null;
          this.checkTheBidIsOpen();
        }
        else {
          this.jobsiteDetailToBid = jobsite;
          this.checkTheBidIsOpen();
          this.getProjectByIdAndUserId();
          this.groupBy();
        }
      } else {
        this.jobsiteDetailToBid = null;
      }
    }));
  }

  checkTheBidIsOpen() {
    if (this.jobsiteDetailToBid.status === 'IN_PROGRESS') {
      return this.disableBid = true;
    } else {
      return this.disableBid = false;
    }
  }

  getSelectedProjectDetails(): void {
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      const project = this.localStorageService.getSelectedProjectObject();
      if (project.id === 'pid') {
        this.projectDetailToBid = null;
      }
      else {
        this.projectDetailToBid = project;
      }
    }));
  }

  groupBy(): void {
    this.groupedLineItem = [];
    const records = this.jobsiteDetailToBid.lineItem;
    const pipedRecords = new Subject();
    const result = pipedRecords.pipe(
      groupBy(
        (x: LineItem) => x.workType,
        null,
        null,
        () => new ReplaySubject()
      ),
      concatMap(
        object => object.pipe(
          toArray(),
          map(obj =>
            ({ key: object.key, value: obj })
          ))
      )
    );

    result.subscribe(x => {
      this.groupedLineItem.push(x);
    });

    records.forEach(x => pipedRecords.next(x));
    pipedRecords.complete();
  }

  hideDialog(): void {
    this.viewInfo = false;
    this.viewLineItem = null;
  }

  showDialog(lineItem): void {
    this.viewInfo = true;
    this.viewLineItem = lineItem;
  }

  previous(): void {
    this.router.navigate([PATH_CONSTANTS.SELECT_JOBSITE]);
  }

  save(goToPrevious?: boolean) {

    if (this.bidAmount > 0) {
      if (!this.projectDetailToBid.isNegotiable) {
        if (this.bidAmount <= this.projectDetailToBid.cost) {
        } else {
          this.notificationService.error(this.translator.instant('bidAmount.less.than.project.cost'), '');
          return false;
        }
      }
    } else if (this.total > 0 && !this.checkedProject) {
      if (!this.projectDetailToBid.isNegotiable) {
        if (this.total <= this.jobsiteDetailToBid.cost) {
        } else {
          this.notificationService.error(this.translator.instant('bidAmount.less.than.jobsite.cost'), '');
          return false;
        }
      }
    } else if (this.total > 0) {
      if (!this.projectDetailToBid.isNegotiable) {
        if (this.total <= this.projectDetailToBid.cost) {
        } else {
          this.notificationService.error(this.translator.instant('bidAmount.less.than.project.cost'), '');
          return false;
        }
      }
    }

    if (this.checkedProject && this.bidAmount > 0) {
      let percentage = 0.00;
      this.jobsiteDetailToBid.paymentMileStone.forEach(milestone => {
        percentage = (+percentage.toFixed(2)) + (+parseFloat(milestone.percentage).toFixed(2));
      });
      if (this.jobsiteDetailToBid.paymentMileStone.length == 0 || (+percentage.toFixed(2)) === 100.00) {

        const listOfPayment = [];

        this.jobsiteDetailToBid.paymentMileStone.forEach(element => {
          element.amount = ((this.projectDetailToBid.cost * element.percentage) / 100);
          this.paymentMileStoneBidDetail = new PaymentMileStoneBidDetail(element.amount, element.percentage, element);
          listOfPayment.push(this.paymentMileStoneBidDetail);
        });

        this.projectBidDetail = new BidDetail();
        this.projectBidDetail.projectId = this.projectDetailToBid.id;
        this.projectBidDetail.subContractorId = this.loggedInUserId;
        this.projectBidDetail.hasBiddedOnProject = this.checkedProject;
        this.projectBidDetail.jobSiteId = this.jobsiteDetailToBid.id;
        this.projectBidDetail.subContractorCost = this.bidAmount;
        this.projectBidDetail.paymentMileStones = listOfPayment;
        this.projectBidService.updateProjectBidDetail(this.projectBidDetail).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('applied.project'), '');
              this.projectJobSelectionService.refreshBidQuotatiionSideBarForJobsite.next();
              this.getProjectByIdAndUserId();
              if (goToPrevious) {
                setTimeout(() => {
                  this.previous();
                }, 2000);
              }
            } else {
              if (data.errorCode) {
                this.notificationService.error(data.errorCode, '');
              } else {
                this.notificationService.error(data.message, '');
              }
            }
          },
          (error) => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          }
        );
      }
      else {
        this.notificationService.error(this.translator.instant('percentage.error'), '');
      }
    } else if (!this.checkedProject) {
      let percentage = 0.00;
      this.jobsiteDetailToBid.paymentMileStone.forEach(milestone => {
        percentage = (+percentage.toFixed(2)) + (+parseFloat(milestone.percentage).toFixed(2));
      });
      if (this.jobsiteDetailToBid.paymentMileStone.length == 0 || (+percentage.toFixed(2)) === 100.00) {
        this.jobSiteBidDetail = new BidDetail();
        const list = [];
        const listOfPayment = [];

        let count = 0;
        this.groupedLineItem.forEach(
          groupedLine => {
            groupedLine.value.forEach(element => {
              if (!element.bidAmount) {
                count++;
              } else {
                this.lineItemBidDetail = new LineItemBidDetail(element, element.bidAmount);
                list.push(this.lineItemBidDetail);
              }
            });
          });
        if (count !== 0) {
          // this.notificationService.error('enter bidAmount', '');
          // return false;
          if (this.bidAmount > 0) {
            this.notificationService.error(this.translator.instant('disable.checkbox.mandatory'), '');
            return false;
          }
        } else {
          this.jobSiteBidDetail.jobSiteBidCompleted = true;
          const list = [];
          const sideBarJobsite = this.localStorageService.getItem('selectedJobsitesForBidQuotation');
          sideBarJobsite.forEach(element => {
            if (element.id == this.jobsiteDetailToBid.id) {
              const obj = {
                assignedTo: element.assignedTo,
                attachment: element.attachment,
                city: element.city,
                cost: element.cost,
                createdBy: element.createdBy,
                createdDate: element.createdDate,
                description: element.description,
                id: element.id,
                jobCode: element.jobCode,
                latitude: element.latitude,
                lineItem: element.lineItem,
                location: element.location,
                longitude: element.longitude,
                paymentMileStone: element.paymentMileStone,
                state: element.state,
                status: element.status,
                supervisor: element.supervisor,
                title: element.title,
                updatedBy: element.updatedBy,
                updatedDate: element.updatedDate,
                user: element.user,
                zipCode: element.zipCode,
                isBidCompleted: true,
              };
              list.push(obj);
            } else {
              const obj = {
                assignedTo: element.assignedTo,
                attachment: element.attachment,
                city: element.city,
                cost: element.cost,
                createdBy: element.createdBy,
                createdDate: element.createdDate,
                description: element.description,
                id: element.id,
                jobCode: element.jobCode,
                latitude: element.latitude,
                lineItem: element.lineItem,
                location: element.location,
                longitude: element.longitude,
                paymentMileStone: element.paymentMileStone,
                state: element.state,
                status: element.status,
                supervisor: element.supervisor,
                title: element.title,
                updatedBy: element.updatedBy,
                updatedDate: element.updatedDate,
                user: element.user,
                zipCode: element.zipCode,
                isBidCompleted: element.isBidCompleted,
              };
              list.push(obj);
            }
          });
          this.localStorageService.setItem('selectedJobsitesForBidQuotation', list);
        }

        this.groupedLineItem.forEach(
          groupedLine => {
            groupedLine.value.forEach(element => {
              this.lineItemBidDetail = new LineItemBidDetail(element, element.bidAmount);
              list.push(this.lineItemBidDetail);
            });
          });

        this.jobsiteDetailToBid.paymentMileStone.forEach(element => {
          element.amount = ((this.total * element.percentage) / 100);
          this.paymentMileStoneBidDetail = new PaymentMileStoneBidDetail(element.amount, element.percentage, element);
          listOfPayment.push(this.paymentMileStoneBidDetail);
        });

        this.jobSiteBidDetail.lineItems = list;
        this.jobSiteBidDetail.paymentMileStones = listOfPayment;
        this.jobSiteBidDetail.jobSiteId = this.jobsiteDetailToBid.id;
        this.jobSiteBidDetail.projectId = this.projectDetailToBid.id;
        this.jobSiteBidDetail.subContractorId = this.loggedInUserId;
        this.jobSiteBidDetail.totalJobsiteBidCost = this.total;
        this.localStorageService.setItem('bid', this.jobSiteBidDetail);
        this.projectBidService.updateProjectBidDetail(this.jobSiteBidDetail).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('applied.jobsite'), '');
              this.projectJobSelectionService.refreshBidQuotatiionSideBarForJobsite.next();
              this.getProjectByIdAndUserId();
              if (goToPrevious) {
                setTimeout(() => {
                  this.previous();
                }, 2000);
              }
            } else {
              if (data.errorCode) {
                this.notificationService.error(data.errorCode, '');
              } else {
                this.notificationService.error(data.message, '');
              }
            }
          },
          (error) => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          }
        );
      }
      else {
        this.notificationService.error(this.translator.instant('percentage.error'), '');
      }
    } else {
      this.notificationService.error('Bid amount should not be zero', '');
    }

  }

  saveAndNext() {
    if (this.bidAmount > 0) {
      if (!this.projectDetailToBid.isNegotiable) {
        if (this.bidAmount <= this.projectDetailToBid.cost) {
        } else {
          this.notificationService.error(this.translator.instant('bidAmount.less.than.project.cost'), '');
          return false;
        }
      }
    }
    else if (this.total > 0 && !this.checkedProject) {
      if (!this.projectDetailToBid.isNegotiable) {
        if (this.total <= this.jobsiteDetailToBid.cost) {
        } else {
          this.notificationService.error(this.translator.instant('bidAmount.less.than.jobsite.cost'), '');
          return false;
        }
      }
    }
    else if (this.total > 0) {
      if (!this.projectDetailToBid.isNegotiable) {
        if (this.total <= this.projectDetailToBid.cost) {
        } else {
          this.notificationService.error(this.translator.instant('bidAmount.less.than.project.cost'), '');
          return false;
        }
      }
    }

    if (this.checkedProject && this.bidAmount > 0) {

      let percentage = 0.00;
      this.jobsiteDetailToBid.paymentMileStone.forEach(milestone => {
        percentage = (+percentage.toFixed(2)) + (+parseFloat(milestone.percentage).toFixed(2));
      });
      if (this.jobsiteDetailToBid.paymentMileStone.length == 0 || (+percentage.toFixed(2)) === 100.00) {
        const listOfPayment = [];


        this.jobsiteDetailToBid.paymentMileStone.forEach(element => {
          element.amount = ((this.projectDetailToBid.cost * element.percentage) / 100);
          this.paymentMileStoneBidDetail = new PaymentMileStoneBidDetail(element.amount, element.percentage, element);
          listOfPayment.push(this.paymentMileStoneBidDetail);
        });

        this.projectBidDetail = new BidDetail();
        this.projectBidDetail.projectId = this.projectDetailToBid.id;
        this.projectBidDetail.subContractorId = this.loggedInUserId;
        this.projectBidDetail.hasBiddedOnProject = this.checkedProject;
        this.projectBidDetail.jobSiteId = this.jobsiteDetailToBid.id;
        this.projectBidDetail.subContractorCost = this.bidAmount;
        this.projectBidDetail.paymentMileStones = listOfPayment;
        this.projectBidService.updateProjectBidDetail(this.projectBidDetail).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('applied.project'), '');
              this.projectJobSelectionService.refreshBidQuotatiionSideBarForJobsite.next();
              this.getProjectByIdAndUserId();
              setTimeout(() => {
                this.next();
              }, 2000);
            } else {
              if (data.errorCode) {
                this.notificationService.error(data.errorCode, '');
              } else {
                this.notificationService.error(data.message, '');
              }
            }
          },
          (error) => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          }
        );
      }
      else {
        this.notificationService.error(this.translator.instant('percentage.error'), '');
      }
    } else if (!this.checkedProject) {
      let percentage = 0.00;
      this.jobsiteDetailToBid.paymentMileStone.forEach(milestone => {
        percentage = (+percentage.toFixed(2)) + (+parseFloat(milestone.percentage).toFixed(2));
      });
      if (this.jobsiteDetailToBid.paymentMileStone.length == 0 || (+percentage.toFixed(2)) === 100.00) {
        this.jobSiteBidDetail = new BidDetail();
        const list = [];
        const listOfPayment = [];

        let count = 0;
        this.groupedLineItem.forEach(
          groupedLine => {
            groupedLine.value.forEach(element => {
              if (!element.bidAmount) {
                count++;
              } else {
                this.lineItemBidDetail = new LineItemBidDetail(element, element.bidAmount);
                list.push(this.lineItemBidDetail);
              }
            });
          });
        if (count !== 0) {
          if (this.bidAmount > 0) {
            this.notificationService.error(this.translator.instant('disable.checkbox.mandatory'), '');
            return false;
          }
          this.notificationService.error(this.translator.instant('enter.bidAmount'), '');
          return false;
        } else {
          this.jobSiteBidDetail.jobSiteBidCompleted = true;
          const list = [];
          const sideBarJobsite = this.localStorageService.getItem('selectedJobsitesForBidQuotation');
          sideBarJobsite.forEach(element => {
            if (element.id == this.jobsiteDetailToBid.id) {
              const obj = {
                assignedTo: element.assignedTo,
                attachment: element.attachment,
                city: element.city,
                cost: element.cost,
                createdBy: element.createdBy,
                createdDate: element.createdDate,
                description: element.description,
                id: element.id,
                jobCode: element.jobCode,
                latitude: element.latitude,
                lineItem: element.lineItem,
                location: element.location,
                longitude: element.longitude,
                paymentMileStone: element.paymentMileStone,
                state: element.state,
                status: element.status,
                supervisor: element.supervisor,
                title: element.title,
                updatedBy: element.updatedBy,
                updatedDate: element.updatedDate,
                user: element.user,
                zipCode: element.zipCode,
                isBidCompleted: true,
              };
              list.push(obj);
            } else {
              const obj = {
                assignedTo: element.assignedTo,
                attachment: element.attachment,
                city: element.city,
                cost: element.cost,
                createdBy: element.createdBy,
                createdDate: element.createdDate,
                description: element.description,
                id: element.id,
                jobCode: element.jobCode,
                latitude: element.latitude,
                lineItem: element.lineItem,
                location: element.location,
                longitude: element.longitude,
                paymentMileStone: element.paymentMileStone,
                state: element.state,
                status: element.status,
                supervisor: element.supervisor,
                title: element.title,
                updatedBy: element.updatedBy,
                updatedDate: element.updatedDate,
                user: element.user,
                zipCode: element.zipCode,
                isBidCompleted: element.isBidCompleted
              };
              list.push(obj);
            }
          });
          this.localStorageService.setItem('selectedJobsitesForBidQuotation', list);
        }

        this.jobsiteDetailToBid.paymentMileStone.forEach(element => {
          element.amount = ((this.total * element.percentage) / 100);
          this.paymentMileStoneBidDetail = new PaymentMileStoneBidDetail(element.amount, element.percentage, element);
          listOfPayment.push(this.paymentMileStoneBidDetail);
        });

        this.jobSiteBidDetail.lineItems = list;
        this.jobSiteBidDetail.paymentMileStones = listOfPayment;
        this.jobSiteBidDetail.jobSiteId = this.jobsiteDetailToBid.id;
        this.jobSiteBidDetail.projectId = this.projectDetailToBid.id;
        this.jobSiteBidDetail.subContractorId = this.loggedInUserId;
        this.jobSiteBidDetail.totalJobsiteBidCost = this.total;
        this.localStorageService.setItem('bid', this.jobSiteBidDetail);
        this.projectBidService.updateProjectBidDetail(this.jobSiteBidDetail).subscribe(
          data => {
            if (data.statusCode === '200' && data.message === 'OK') {
              this.notificationService.success(this.translator.instant('applied.jobsite'), '');
              this.projectJobSelectionService.refreshBidQuotatiionSideBarForJobsite.next();
              this.getProjectByIdAndUserId();
              setTimeout(() => {
                this.next();
              }, 2000);
            } else {
              if (data.errorCode) {
                this.notificationService.error(data.errorCode, '');
              } else {
                this.notificationService.error(data.message, '');
              }
            }
          },
          (error) => {
            this.notificationService.error(this.translator.instant('common.error'), '');
          }
        );
      }
      else {
        this.notificationService.error(this.translator.instant('percentage.error'), '');
      }
    } else {
      this.notificationService.error(this.translator.instant('bidAmount.not.zero'), '');
    }
  }

  next(): void {
    if (this.checkedProject && this.validateProject()) {
      this.router.navigate([PATH_CONSTANTS.PROJECT_BID_REVIEW]);
    } else if (!this.checkedProject && this.validateJobsite()) {
      this.router.navigate([PATH_CONSTANTS.PROJECT_BID_REVIEW]);
    }
  }

  setData(jobsiteData): void {
    const tempData = [];

    if (jobsiteData.lineItems.length !== 0) {

      this.groupedLineItem.forEach(
        item => {
          item.value.forEach(
            val => {
              jobsiteData.lineItems.forEach(e => {
                if (val.id === e.lineItem.id) {
                  const obj = {
                    cost: e.lineItem.cost,
                    createdBy: e.lineItem.createdBy,
                    description: e.lineItem.description,
                    dynamicLabel1: e.lineItem.dynamicLabel1,
                    dynamicLabel2: e.lineItem.dynamicLabel2,
                    dynamicLabel3: e.lineItem.dynamicLabel3,
                    exclusions: e.lineItem.exclusions,
                    id: e.lineItem.id,
                    unit: e.lineItem.unit,
                    inclusions: e.lineItem.inclusions,
                    lineItemId: e.lineItem.lineItemId,
                    lineItemName: e.lineItem.lineItemName,
                    quantity: e.lineItem.quantity,
                    updatedBy: e.lineItem.updatedBy,
                    workType: e.lineItem.workType,
                    bidAmount: e.subContractorBidAmount,
                  };
                  tempData.push(obj);
                }
              });
            });
        }
      );

      this.jobsiteDetailToBid.lineItem = tempData as LineItem[];
      this.groupBy();

    }

  }

  setPaymentMileStone(jobsiteData): void {
    const temppaymentMileStone = [];

    if (jobsiteData.paymentMileStones.length !== 0) {

      this.jobsiteDetailToBid.paymentMileStone.forEach(p => {
        jobsiteData.paymentMileStones.forEach(q => {
          if (p.id == q.paymentMileStone.id) {
            const obj = {
              id: q.paymentMileStone.id,
              name: q.paymentMileStone.name,
              lineItem: q.paymentMileStone.lineItem,
              percentage: q.subContractorPercentage,
              amount: q.subContractorAmount,
            };
            temppaymentMileStone.push(obj);
          }
        });
      });

      this.jobsiteDetailToBid.paymentMileStone = temppaymentMileStone as PaymentMileStone[];

    }
  }

  getProjectByIdAndUserId(): void {
    this.projectBidService.getBiddedData(this.projectDetailToBid.id, this.loggedInUserId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.data.biddingType === 'BY_PROJECT') {
            this.appliedOnProject = true;
            this.projectBidDetailDto = data.data;
            this.checkedProject = this.projectBidDetailDto.hasBiddedOnProject;
            this.bidAmount = this.projectBidDetailDto.subContractorCost;
          } else {
            this.appliedOnProject = false;
            this.checkedProject = false;
            this.bidAmount = 0;
            this.projectBidDetailDto = new ProjectBidDetail();
          }
        }
        else {
          this.checkedProject = false;
          this.bidAmount = 0;
          this.projectBidDetailDto = new ProjectBidDetail();
        }
      });

    this.projectBidService.getBiddedDataOfJobsite(this.jobsiteDetailToBid.id, this.loggedInUserId).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.data.jobSiteBidDetail) {
            this.biddedJobsiteData = data.data;
            if (this.biddedJobsiteData.lineItems.length !== 0) {
              this.setData(this.biddedJobsiteData);
              this.setPaymentMileStone(this.biddedJobsiteData);
            }
            if (this.biddedJobsiteData.paymentMileStones.length !== 0) {
              this.setPaymentMileStone(this.biddedJobsiteData);
            }
          }
          else {
            this.biddedJobsiteData = new BidDetail();
          }
        } else {
          this.biddedJobsiteData = new BidDetail();
        }
      });

    this.getJobsiteBidDetailByIdAndUserId();
  }

  validateProject(): boolean {
    if (this.checkedProject && this.bidAmount > 0) {
      return true;
    } else if (this.appliedOnProject) {
      this.notificationService.error(this.translator.instant('feel.jobsite.bidAmount'), '');
      return false;
    } else {
      return true;
    }
  }

  validateJobsite(): boolean {
    let count = 0;
    if (!this.checkedProject) {
      this.tempListOfjobsite.forEach(
        e => {
          if (e.subContractorCost > 0) {
            count++;
          }
        });
      if (this.appliedOnProject) {
        if (count !== this.projectDetailToBid.jobsite.length) {
          this.notificationService.error(this.translator.instant('feel.jobsite.bidAmount'), '');
          return false;
        }
        else {
          let isJobSiteBidCompletedCount = 0;
          if (this.validateJobsiteList) {
            this.validateJobsiteList.forEach(element => {
              if (!element.isJobSiteBidCompleted) {
                isJobSiteBidCompletedCount++;
              }
            });
            if (isJobSiteBidCompletedCount > 0) {
              this.notificationService.error(this.translator.instant('feel.jobsite.bidAmount'), '');
              return false;
            } else {
              return true;
            }
          }
        }
      } else if (count === this.tempListOfjobsite.length) {
        let isJobSiteBidCompletedCount = 0;
        if (this.validateJobsiteList) {
          this.validateJobsiteList.forEach(element => {
            if (!element.isJobSiteBidCompleted) {
              isJobSiteBidCompletedCount++;
            }
          });
          if (isJobSiteBidCompletedCount > 0) {
            this.notificationService.error(this.translator.instant('feel.jobsite.bidAmount'), '');
            return false;
          } else {
            return true;
          }
        }
      } else {
        this.notificationService.error(this.translator.instant('feel.jobsite.bidAmount'), '');
        return false;
      }
    }
  }

  getJobsiteBidDetailByIdAndUserId(): void {
    const filterMap = new Map();
    filterMap.set('SUBCONTRACTOR_ID', this.loggedInUserId);
    filterMap.set('PROJECT_ID', this.projectDetailToBid.id);
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
    this.projectBidService.getAllJobsitetBidDetail(this.queryParam).subscribe(
      data => {
        if (data.statusCode === '200') {
          if (data.data.result.length !== 0) {
            this.bidDetailInfoDTO = data.data.result;
            this.tempListOfjobsite = data.data.result;
            this.validateJobsiteList = data.data.result;
          } else {
            this.bidDetailInfoDTO = new BidDetailInfoDTO();
            this.validateJobsiteList = [];
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

  calculateAmountRelease(percentage, amount): number {
    if (this.total !== 0) {
      amount = ((this.total * percentage) / 100);
    } else if (this.bidAmount !== 0) {
      amount = ((this.bidAmount * percentage) / 100);
    } else {
      amount = ((this.jobsiteDetailToBid.cost * percentage) / 100);
    }
    return amount;
  }

  calculateTotalBidAmount(amount): number {
    let total = 0;
    amount.forEach(e => {
      if (e.bidAmount) {
        total += e.bidAmount;
      }
    });
    return total;
  }

  calculateTotalBidAmountForJobsite(list): number {
    this.total = 0;
    list.forEach(element => {
      element.value.forEach(e => {
        if (e.bidAmount) {
          this.total += e.bidAmount;
        }
      });
    });
    return this.total;
  }

  redirectToLineItemDeliverables(milestone): void {

    const milestoneDetail = {
      jobsiteDetail: this.localStorageService.getSelectedJobsiteObject(),
      milestone
    };

    this.localStorageService.setItem('milestoneDetail', milestoneDetail);
    CommonUtil.openWindow(PATH_CONSTANTS.VIEW_LINE_ITEM_DELIVERABLES);
  }

  openConfirmationDialog(): void {
    let options = null;
    const message = 'Do you want to save data for the jobsite before moving to Step 1?';
    options = {
      title: this.translator.instant('warning'),
      message: this.translator.instant(`${message}`),
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    };
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.save(true);
      } else {
        this.previous();
      }
    });
  }

}
