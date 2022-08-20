import { Component } from "vue";

export type MenuInfo = MenuGroupInfo | MenuItemInfo | MenuSubItemInfo;
interface MenuItemInfo {
  icon?: Component;
  title: string;
  id: string;
  fullPath: string;
  type: "menu-item";
}

interface MenuSubItemInfo {
  icon: Component;
  title: string;
  id: string;
  type: "sub-menu";
  children: Array<MenuInfo>;
}

interface MenuGroupInfo {
  title: string;
  id: string;
  type: "menu-group";
  children: Array<MenuInfo>;
}
