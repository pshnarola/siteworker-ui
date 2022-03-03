export interface NavItemsInfo {
  path: string;
  title: string;
  icon: string;
  hideOnPhone: boolean;
  // class: string;
  // label: string;
  // labelClass: string;
  // extralink: boolean;
  // id: string;
  submenu: NavItemsInfo[];
}
