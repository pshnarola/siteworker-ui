import { NavItemsInfo } from "./navbar.metadata";

export const NAVITEMS: NavItemsInfo[] = [
  {
    title: "Shortlist",
    path: "/main/property-listing",
    submenu: []
  },
  {
    title: "How it Works",
    path: "/main/how-it-works",
    submenu: []
  },
  {
    title: "Meet The Team",
    path: "/main/meet-the-team",
    submenu: []
  },
  {
    title: "Blog",
    path: "/main/blog",
    submenu: []
  },
  {
    title: "Contact",
    path: "/main/contact",
    submenu: []
  },
  {
    title: "Help",
    path: "/main/help",
    submenu: []
  },
  {
    title: "Explore",
    path: null,
    submenu: [
      {
        title: "Listings",
        path: "/main/team-listing",
        submenu: []
      },
      {
        title: "Saved Searches",
        path: "/main/saved-searches",
        submenu: []
      },
      {
        title: "Sold",
        path: "/main/sold",
        submenu: []
      },
      {
        title: "Friends",
        path: "/main/friends",
        submenu: []
      }
    ]
  },
  {
    title: "My Proppies",
    path: null,
    submenu: [
      {
        title: "Shortlist",
        path: "/main/user-listing",
        submenu: []
      },
      {
        title: "Teams",
        path: "/main/saved-searches",
        submenu: []
      },
      {
        title: "Partners",
        path: "/main/sold",
        submenu: []
      },
      {
        title: "Portfolio",
        path: "/main/friends",
        submenu: []
      },
      {
        title: "Contracts",
        path: "/main/friends",
        submenu: []
      }
    ]
  },
  {
    title: "Resources",
    path: null,
    submenu: [
      {
        title: "Calculator",
        path: "/main/calculator",
        submenu: []
      },
      {
        title: "How It Works",
        path: "/main/how-it-works",
        submenu: []
      },
      {
        title: "Blog",
        path: "/main/blog",
        submenu: []
      }
    ]
  }
];
