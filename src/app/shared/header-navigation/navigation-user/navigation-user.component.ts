
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NAVITEMS } from "./navbar-user-items";
import { Component, AfterViewInit, OnInit } from "@angular/core";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import * as $ from "jquery";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";
import { Subscription, interval } from "rxjs";
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { User } from '../../vo/User';

declare var QB: any;
@Component({
  selector: "app-navigation-user",
  templateUrl: "./navigation-user.component.html",
  styleUrls: ["./navigation-user.component.css"],
})
export class NavigationUserComponent implements OnInit, AfterViewInit {
  displayDialog: boolean = false;
  loginForm: FormGroup;
  name: string;
  loading: boolean = true;
  userProfileUrl = "assets/images/users/ProfileImage.png";
  headerNotifications: Notification[];
  temp: Notification[] = [];
  public config: PerfectScrollbarConfigInterface = {};
  message: string = "fa fa-edit";
  subscription: Subscription;
  noNotification = false;
  noMessages = false;
  // proppie navbar items
  public navbarItems: any[];
  public profileItems: any[];
  oldNotification: Notification[] = [];
  passwordForgot: number;
  closeResult: string;
  user: User;
  qbUserId: string;

  session: any;
  token: any;
  currentUserProfileImage: string;
  chattingUserProfileImage: string;

  profilePic: boolean = false;
  imagePath: string

  geolocationPosition: Coordinates = {
    accuracy: 0,
    altitude: 0,
    altitudeAccuracy: 0,
    heading: 0,
    latitude: 0,
    longitude: 0,
    speed: 0,
  };
  seenNotificationIds: string[] = [];
  constructor(
    private modalService: NgbModal,
    private _localStorageService: LocalStorageService,
    private _router: Router,
    private titleService: Title,

    private _formBuilder: FormBuilder
  ) {
    // this.user = this._localStorageService.getLoginUserObject();

  }

  notifications: Object[] = [
    {
      round: "round-danger",
      icon: "fa-bell",
      title: "Luanch Admin",
      subject: "Just see the my new admin!",
      time: "9:30 AM",
    },
    {
      round: "round-success",
      icon: "ti-calendar",
      title: "Event today",
      subject: "Just a reminder that you have event",
      time: "9:10 AM",
    },
    {
      round: "round-info",
      icon: "ti-settings",
      title: "Settings",
      subject: "You can customize this template as you want",
      time: "9:08 AM",
    },
  ];

  // This is for Mymessages
  mymessages: Object[] = [
    {
      useravatar: "assets/images/users/1.jpg",
      status: "online",
      from: "Pavan kumar",
      subject: "Just see the my admin!",
      time: "9:30 AM",
    },
    {
      useravatar: "assets/images/users/2.jpg",
      status: "busy",
      from: "Sonu Nigam",
      subject: "I have sung a song! See you at",
      time: "9:10 AM",
    },
    {
      useravatar: "assets/images/users/2.jpg",
      status: "away",
      from: "Arijit Sinh",
      subject: "I am a singer!",
      time: "9:08 AM",
    },
    {
      useravatar: "assets/images/users/4.jpg",
      status: "offline",
      from: "Pavan kumar",
      subject: "Just see the my admin!",
      time: "9:00 AM",
    },
  ];

  loadProfilePic() {
    this.user = this._localStorageService.getLoginUserObject();
  }

  ngOnInit() {

    // proppie navbar items
    this.navbarItems = NAVITEMS.filter((navbarItem) => navbarItem);

    // Proppie profile menu items

    this.getMessages()


    this.onTimeInterval();



    // var headerHeight = jQuery("header.topbar").outerHeight();
    // jQuery(".page-wrapper").css("margin-top", headerHeight);


  }





  onTimeInterval() {
    const source = interval(10000);
    const text = "Every 2 sec";

  }

  onMobileNotificationIconClick() {

  }

  onNotificationIconClick() {

  }

  routerPath(notification, status) {

  }
  updateNotificationReadStatus(notification) {

  }
  // ******** Add Listings ********
  onProppie() {

  }

  onLoad() {
    this.loading = false;
  }

  signOut() {
    this._localStorageService.removeItem("Authorization");
    this._localStorageService.removeItem("user");
    this._localStorageService.removeItem("listings");
    this._localStorageService.removeItem("rememberMe");

    setTimeout(function () {
      window.location.reload();
    });
    (window as any).Intercom("shutdown");
    this.qbLogout();
  }

  qbLogout() {

  }

  onLogIn() {

  }

  close(form: any) {

  }

  onAProperty() {

  }
  onMyself() {

  }
  onATeam() {

  }
  open(content) {

  }




  getMessages() {

  }
  onSeeFullConversation(dialog) {

  }

  retrieveDialog(token: any) {

  }

  initializeAndConnectQB() {

  }


  ngAfterViewInit(): void {
    this.loadProfilePic();
    var headerHeight = jQuery("header.topbar").outerHeight();
    jQuery(".page-wrapper").css("margin-top", headerHeight);
  }

  showNotifPoint() {

  }
}
