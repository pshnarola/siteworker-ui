
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NAVITEMS } from "./navbar-general-items";
import { Component, AfterViewInit, OnInit } from "@angular/core";
import { PerfectScrollbarConfigInterface } from "ngx-perfect-scrollbar";
import { Router, ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { NgbModal, ModalDismissReasons } from "@ng-bootstrap/ng-bootstrap";
import * as $ from "jquery";
import { LocalStorageService } from 'src/app/service/localstorage.service';
import { User } from '../vo/User';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {

  public navbarItems: any[];
  closeResult: string;
  user: User;
  constructor(
    private _localStorageService: LocalStorageService,
    private _router: Router
  ) {
    this.user = this._localStorageService.getLoginUserObject();
  }

  ngOnInit() {
    // proppie navbar items
    this.navbarItems = NAVITEMS.filter(navbarItem => navbarItem);
    var headerHeight = jQuery("header.topbar").outerHeight();
    jQuery(".page-wrapper").css("margin-top", headerHeight);

    // $("body").on("click", function() {
    //   if ($(".general-header .dropdown-menu.show").length > 0) {
    //     if ($(".black-overlay").length == 0) {
    //       $("body").append('<div class="black-overlay"></div>');
    //     } else if ($(".dropdown-menu.show").length == 1) {
    //       $(".black-overlay").remove();
    //     }
    //   } else {
    //     $(".black-overlay").remove();
    //   }
    // });
  }

  onProppie() {
    this._router.navigate(["main/home"]);
  }



  onAProperty() {
    this._router.navigate(["/main/add-listings/property-listing-add"]);
  }
  onMyself() {
    this._router.navigate(["/main/add-listings/user-listing-add"]);
  }
  onATeam() {
    this._router.navigate(["/main/add-listings/team-listing-add"]);
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return "by pressing ESC";
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return "by clicking on a backdrop";
    } else {
      return `with: ${reason}`;
    }
  }
}
