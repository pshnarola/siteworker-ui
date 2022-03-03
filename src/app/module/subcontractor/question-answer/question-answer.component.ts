import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ConfirmDialogueService } from 'src/app/confirm-dialogue.service';
import { ProjectJobSelectionService } from 'src/app/service/client-services/project-job-selection.service';
import { QuestionAnswerService } from 'src/app/service/client-services/question-answer/question-answer.service';
import { HeaderManagementService } from 'src/app/service/header-management.service';
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { UINotificationService } from 'src/app/shared/notification/uinotification.service';
import { JobsiteDetail } from '../../client/Vos/jobsitemodel';
import { ProjectDetail } from '../../client/Vos/projectDetailmodel';

@Component({
  selector: 'app-question-answer',
  templateUrl: './question-answer.component.html',
  styleUrls: ['./question-answer.component.css']
})
export class QuestionAnswerComponent implements OnInit, OnDestroy {

  selectedProject: ProjectDetail = null;
  jobsite: JobsiteDetail[];
  questionAnswerForm: FormGroup;
  loggedInUserId: string;
  questionAnswerArray: any[] = [];
  isProjectSelected = false;
  subscription = new Subscription();
  submitted = false;
  filteredJobsite: JobsiteDetail[];

  constructor(
    private headerManagementService: HeaderManagementService,
    private _formBuilder: FormBuilder,
    private translator: TranslateService,
    private confirmDialogService: ConfirmDialogueService,
    private notificationService: UINotificationService,
    private _localStorageService: LocalStorageService,
    private projectJobSelectionService: ProjectJobSelectionService,
    private questionAnswerService: QuestionAnswerService,
    private router: Router
  ) {
    this.headerManagementService.hideHeaderSubject.next(true);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  ngOnInit(): void {
    this.headerManagementService.hideHeaderSubject.next(true);
    this.loggedInUserId = this._localStorageService.getLoginUserId();
    this.subscription.add(this.projectJobSelectionService.selectedProjectSubject.subscribe(data => {
      this.initializeQuestionAnswerForm();
      let project = this._localStorageService.getItem('selectedProject');
      if (project) {
        if (project.id === 'pid') {
          this.isProjectSelected = false;
        }
        else {
          this.isProjectSelected = true;
          this.selectedProject = project;
          let jobsite = this._localStorageService.getAllJobsite();
          if (jobsite) {
            this.jobsite = jobsite;
            for (let i = 0; i < jobsite.length; i++) {
              if (jobsite[i].id === 'jid') {
                this.jobsite.splice(i, 1);
              }
            }
          }
        }
      }
    }));
  }

  private initializeQuestionAnswerForm() {
    let questionAndAnswerList = new FormArray([]);
    for (let i = 0; i < 10; i++) {
      questionAndAnswerList.push(this._formBuilder.group({
        'id': [],
        'createdBy': this.loggedInUserId,
        'updatedBy': this.loggedInUserId,
        'jobSite': [null],
        'question': ['', Validators.maxLength(500)]
      }));
    }

    this.questionAnswerForm = this._formBuilder.group({
      questionAndAnswerList: questionAndAnswerList
    });
  }

  addTableRow() {
    const lengthOfArray = (<FormArray>this.questionAnswerForm.get('questionAndAnswerList')).length;
    if (lengthOfArray < 20) {
      (<FormArray>this.questionAnswerForm.get('questionAndAnswerList')).push(this._formBuilder.group({
        'id': [],
        'createdBy': this.loggedInUserId,
        'updatedBy': this.loggedInUserId,
        'jobSite': [null],
        'question': ['', Validators.maxLength(500)]
      }));
    }
  }

  viewAnswer() {
    this.router.navigate(['/subcontractor/question-answer-reply']);
  }

  get tableRowArray(): FormArray {
    return this.questionAnswerForm.get('questionAndAnswerList') as FormArray;
  }

  submitQuestions() {
    let hasError = false;
    this.submitted = true;
    let length = this.questionAnswerArray.length;
    this.questionAnswerArray.splice(0, length);
    this.questionAnswerForm.value.questionAndAnswerList.forEach(question => {
      if (!(question.question === "" && question.jobSite == null)) {
        if (question.question === "") {
          hasError = true;
          this.notificationService.error(this.translator.instant('enter.question.error'), '');
        }
        else if (question.jobSite === null) {
          hasError = true;
          this.notificationService.error(this.translator.instant('select.jobsite.error'), '');
        }
        else {
          this.questionAnswerArray.push(question);
        }
      }
    });
    if (this.questionAnswerArray.length > 0 && !hasError) {
      this.saveQuestion();
    }
  }

  private saveQuestion() {
    let questionAnwerDetails: any[] = [];
    let project = this.selectedProject;
    project.attachment = [];
    this.questionAnswerArray.forEach(element => {
      let QuestionAnswerDetail = {
        'id': '',
        'createdBy': element.createdBy,
        'updatedBy': element.updatedBy,
        'repliedBy': null,
        'question': element.question,
        'answer': '',
        'project': project,
        'jobSite': element.jobSite,
        'user': this._localStorageService.getLoginUserObject()
      }
      questionAnwerDetails.push(QuestionAnswerDetail);
    });
    let answerDetail = {
      'questionAndAnswerList': questionAnwerDetails
    }

    this.questionAnswerService.submitQuestion(answerDetail).subscribe(
      data => {
        if (data.statusCode === '200' && data.message === 'OK') {
          this.submitted = false;
          this.notificationService.success(this.translator.instant('question.submited.successfully'), '');
        }
        else {
          this.notificationService.error(data.message, '');
        }
      },
      error => {
        this.notificationService.error(this.translator.instant('common.error'), '');
      }
    );
  }

  openDialog() {
    let options = null;
    options = {
      title: "Suggestion",
      message: "Please select at least one project",
      cancelText: this.translator.instant('dialog.cancel.text'),
      confirmText: this.translator.instant('dialog.confirm.text')
    }
    this.confirmDialogService.open(options);
    this.confirmDialogService.confirmed().subscribe(confirmed => {
      if (confirmed) {
        this.router.navigate(['../']);
      }
      else {
        this.router.navigate(['../']);
      }
    });
  }


  filterJobsite(event) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.jobsite.length; i++) {
      let jobsite = this.jobsite[i];
      if (jobsite.title.toLowerCase().indexOf(query.toLowerCase()) == 0) {
        filtered.push(jobsite);
      }
    }
    this.filteredJobsite = filtered;
    this.filteredJobsite = this.filteredJobsite.sort();

  }
}
