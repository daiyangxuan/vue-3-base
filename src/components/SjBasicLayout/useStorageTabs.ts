import { reactive, watch } from "vue";
import { TabInfo } from "./SjNavTab/types";
import { useStorage } from "@vueuse/core";
import { MenuInfo } from "./SjSider/types";

const NAV_TAB_KEY = "NAV_TAB_KEY";
const NAV_SELECTED_TAB_KEY = "NAV_SELECTED_TAB_KEY";
export default function useStorageTabs(menu: MenuInfo[]) {
  const savedTabsStr = window.localStorage.getItem(NAV_TAB_KEY);
  let savedTabs: Array<TabInfo>;
  if (!savedTabsStr) {
    savedTabs = [];
  } else {
    savedTabs = JSON.parse(savedTabsStr);
  }
  const tabs = reactive<Array<TabInfo>>(savedTabs);
  const selectedKey = useStorage<string | null>(NAV_SELECTED_TAB_KEY, null);
  watch(tabs, (newTabs) => {
    window.localStorage.setItem(
      NAV_TAB_KEY,
      JSON.stringify(
        newTabs.map(({ key, label }) => {
          return {
            key,
            label,
          };
        })
      )
    );
  });
  return {
    tabs,
    selectedKey,
  };
}
