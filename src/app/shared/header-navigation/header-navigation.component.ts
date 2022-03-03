import { User } from './../vo/User';
import { Component, AfterViewInit, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgbModal, ModalDismissReasons, NgbPanelChangeEvent, NgbCarouselConfig } from '@ng-bootstrap/ng-bootstrap';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { Router } from '@angular/router';
import { PATH_CONSTANTS } from '../PathConstants';
import { API_CONSTANTS } from '../ApiConstants';
import { Title } from '@angular/platform-browser';
import { Observable } from 'rxjs';
import { LocalStorageService } from 'src/app/service/localstorage.service';


@Component({
  selector: 'app-header-navigation',
  templateUrl: './header-navigation.component.html',
  styleUrls: ['./header-navigation.component.css']
})
export class HeaderNavigationComponent implements OnInit {

  loggedIn: boolean = true;

  ngOnInit() {
    $("body").on("click", function () {
      if ($("header.topbar .dropdown-menu.show").length > 0) {
        if ($(".black-overlay").length == 0) {
          $("body").append('<div class="black-overlay"></div>');
        } else if ($(".dropdown-menu.show").length == 1) {
          $(".black-overlay").remove();
        }
      } else {
        $(".black-overlay").remove();
      }
    });
  }
}