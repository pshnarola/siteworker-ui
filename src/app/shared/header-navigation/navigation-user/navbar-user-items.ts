import { NavItemsInfo } from "src/app/shared/header-navigation/navbar-user.metadata";


export const NAVITEMS: NavItemsInfo[] = [
  {
    title: "Explore",
    icon: "binoculars",
    hideOnPhone: false,
    path: null,
    submenu: [
      {
        title: "Listings",
        icon: "",
        hideOnPhone: false,
        path: "/main/explore/listing",
        submenu: []
      },
      {
        title: "Saved Searches",
        icon: "",
        hideOnPhone: false,
        path: "/main/explore/saved-searches",
        submenu: []
      },
      {
        title: "Sold",
        icon: "",
        hideOnPhone: false,
        path: "/main/explore/sold-properties",
        submenu: []
      },
      {
        title: "Friends",
        icon: "",
        hideOnPhone: false,
        path: "/main/explore/friends",
        submenu: []
      }
    ]
  },
  {
    title: "My Proppies",
    icon: "home",
    hideOnPhone: false,
    path: null,
    submenu: [
      {
        title: "My Listings",
        icon: "",
        hideOnPhone: false,
        path: "/main/my-proppies/myListings",
        submenu: []
      },
      {
        title: "Shortlist",
        icon: "",
        hideOnPhone: false,
        path: "/main/my-proppies/shortlist",
        submenu: []
      },
      {
        title: "Teams",
        icon: "",
        hideOnPhone: false,
        path: "/main/my-proppies/teams",
        submenu: []
      },
      {
        title: "Partners",
        icon: "",
        hideOnPhone: false,
        path: "/main/my-proppies/partners",
        submenu: []
      },
      {
        title: "Portfolio",
        icon: "",
        hideOnPhone: false,
        path: "/main/my-proppies/portfolio",
        submenu: []
      },
      {
        title: "Contracts",
        icon: "",
        hideOnPhone: false,
        path: "/main/my-proppies/contracts",
        submenu: []
      }
    ]
  },
  {
    title: "Resources",
    icon: "",
    hideOnPhone: true,
    path: null,
    submenu: [
      {
        title: "Calculator",
        icon: "",
        hideOnPhone: true,
        path: "/main/calculator",
        submenu: []
      },
      {
        title: "How it Works",
        icon: "",
        hideOnPhone: true,
        path: "/main/how-it-works",
        submenu: []
      },
      {
        title: "Blog",
        icon: "",
        hideOnPhone: true,
        path: "/main/blog",
        submenu: []
      }
    ]
  }
];
