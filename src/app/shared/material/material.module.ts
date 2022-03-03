import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LayoutModule } from '@angular/cdk/layout';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { ToastModule } from 'primeng/toast';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { KeyFilterModule } from 'primeng/keyfilter';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { ToastrModule } from 'ngx-toastr';
import { FieldsetModule } from 'primeng/fieldset';
import { CardModule } from 'primeng/card';
import { PasswordModule } from 'primeng/password';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MatDialogModule } from '@angular/material/dialog';
import { TooltipModule } from 'primeng/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { InputNumberModule } from 'primeng/inputnumber';
import { ListboxModule } from 'primeng/listbox';
import { PaginatorModule } from 'primeng/paginator';
import { AccordionModule } from 'primeng/accordion';
import { ChipsModule } from 'primeng/chips';
import { CarouselModule } from 'primeng/carousel';
import { PickListModule } from 'primeng/picklist';
import { CalendarModule } from 'primeng/calendar';
import { DataViewModule } from 'primeng/dataview';
import { NgxPaginationModule } from 'ngx-pagination';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { MatChipsModule } from '@angular/material/chips';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { TimelineModule } from "primeng/timeline";
import { TabViewModule } from 'primeng/tabview';
import { RatingModule } from 'primeng/rating';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputMaskModule } from 'primeng/inputmask';
import { CheckboxModule } from "primeng/checkbox";
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { SliderModule } from 'primeng/slider';
import { InputSwitchModule } from 'primeng/inputswitch';
import { VirtualScrollerModule } from 'primeng/virtualscroller';



const materialModule = [MatToolbarModule,
  LayoutModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule,
  MatGridListModule,
  MatCardModule,
  MatMenuModule,
  MatInputModule,
  MatSelectModule,
  MatRadioModule,
  MatDividerModule,
  MatSlideToggleModule,
  MatSnackBarModule,
  CommonModule,
  ToastModule,
  RippleModule,
  TableModule,
  DropdownModule,
  DialogModule,
  InputTextModule,
  ButtonModule,
  AutoCompleteModule,
  KeyFilterModule,
  MessagesModule,
  MessageModule,
  TooltipModule,
  ToastrModule,
  FieldsetModule,
  CardModule,
  PasswordModule,
  RadioButtonModule,
  MatDialogModule,
  MatBadgeModule,
  InputNumberModule,
  ListboxModule,
  PaginatorModule,
  AccordionModule,
  ChipsModule,
  CarouselModule,
  PickListModule,
  DataViewModule,
  NgxPaginationModule,
  CalendarModule,
  OverlayPanelModule,
  MatChipsModule,
  InputTextareaModule,
  MultiSelectModule,
  TimelineModule,
  TabViewModule,
  RatingModule,
  ProgressSpinnerModule,
  InputMaskModule,
  CheckboxModule,
  AvatarModule,
  AvatarGroupModule,
  SliderModule,
  InputSwitchModule,
  VirtualScrollerModule
];


@NgModule({
  declarations: [],
  imports: [
    materialModule
  ],
  exports: [
    materialModule
  ]
})
export class MaterialModule { }
