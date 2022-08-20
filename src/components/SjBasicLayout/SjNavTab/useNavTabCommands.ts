import { inject, InjectionKey, provide, Ref } from "vue";
import { NavigationFailure, useRouter } from "vue-router";
import { TabInfo } from "./types";
import { formateObjToParamStr } from "../../../utils";

type CloseCommand = (id?: string | null) => Promise<void | NavigationFailure>;

export interface NavTabCommands {
  close: CloseCommand;
  // closeOther: CloseCommand;
  // closeLeft: CloseCommand;
  // closeRight: CloseCommand;
  // refresh: (id?: string | null) => void;
}

export const NavTabCommandsInjectionKey: InjectionKey<NavTabCommands> = Symbol(
  "NavTabCommandsInjectionKey"
);

export function useNavTabCommands() {
  const commands = inject(NavTabCommandsInjectionKey);
  if (!commands) {
    throw new Error("NavTabCommands must be used under RouterTab");
  }
  return commands;
}

export function provideNavTabCommands(
  tabs: TabInfo[],
  selectedTabKey: Ref<string | undefined>,
  doLayout: () => void
) {
  const router = useRouter();
  const close: CloseCommand = async (key = selectedTabKey.value) => {
    if (!key) return;
    const tabItemIndex = tabs.findIndex((item) => item.key === key);
    const closable = tabs[tabItemIndex].closable ?? true;
    if (!closable) return;
    if (tabItemIndex < 0) {
      return;
    }
    let activeTabIndex = tabs.findIndex(
      (item) => item.key === selectedTabKey.value
    );
    tabs.splice(tabItemIndex, 1);
    doLayout();
    if (activeTabIndex !== tabItemIndex) {
      return;
    }
    //删除当前标签
    if (activeTabIndex >= tabs.length) {
      activeTabIndex = tabs.length - 1;
    }
    if (activeTabIndex < 0) {
      return;
    }
    return await router.push(
      tabs[activeTabIndex].query
        ? `${tabs[activeTabIndex].fullPath}?${formateObjToParamStr(
            tabs[activeTabIndex].query
          )}`
        : tabs[activeTabIndex].fullPath
    );
  };

  const closeOther: CloseCommand = async (key = selectedTabKey.value) => {
    if (!key) return;
    const tabItemIndex = tabs.findIndex((item) => item.key === key);
    if (tabItemIndex < 0) {
      return;
    }
    let removingTabs = tabs.splice(0, tabItemIndex);
    let count = 0;
    removingTabs.reverse().forEach((tab) => {
      const closable = tab.closable ?? true;
      if (!closable) {
        tabs.unshift(tab);
        count++;
      }
    });
    removingTabs = tabs.splice(count + 1);
    removingTabs.forEach((tab) => {
      const closable = tab.closable ?? true;
      if (!closable) {
        tabs.push(tab);
      }
    });
    doLayout();
    let activeTabIndex = tabs.findIndex(
      (item) => item.key === selectedTabKey.value
    );
    if (activeTabIndex >= 0) {
      return;
    }
    activeTabIndex = tabs.findIndex((item) => item.key === key);
    return await router.push(
      tabs[activeTabIndex].query
        ? `${tabs[activeTabIndex].fullPath}?${formateObjToParamStr(
            tabs[activeTabIndex].query
          )}`
        : tabs[activeTabIndex].fullPath
    );
  };
  //
  // const closeLeft: CloseCommand = async (id = selectedTabKey.value) => {
  //   if (!id) return;
  //   const items = tabs.value;
  //   const tabItemIndex = items.findIndex((item) => {
  //     return item.id === id;
  //   });
  //   if (!(tabItemIndex > 0)) {
  //     return;
  //   }
  //   items.splice(0, tabItemIndex);
  //   if (items[0].id === selectedTabKey.value) {
  //     return;
  //   }
  //   return await router.push(items[0].to);
  // };
  //
  const closeRight: CloseCommand = async (key = selectedTabKey.value) => {
    if (!key) return;
    const tabItemIndex = tabs.findIndex((item) => item.key === key);
    if (tabItemIndex < 0) {
      return;
    }
    const removingTabs = tabs.splice(tabItemIndex + 1);
    removingTabs.forEach((tab) => {
      const closable = tab.closable ?? true;
      if (!closable) {
        tabs.push(tab);
      }
    });
    doLayout();
    let activeTabIndex = tabs.findIndex(
      (item) => item.key === selectedTabKey.value
    );
    if (activeTabIndex >= 0) {
      return;
    }
    activeTabIndex = tabItemIndex;
    return await router.push(
      tabs[activeTabIndex].query
        ? `${tabs[activeTabIndex].fullPath}?${formateObjToParamStr(
            tabs[activeTabIndex].query
          )}`
        : tabs[activeTabIndex].fullPath
    );
  };
  //
  // const refresh = (id = selectedTabKey.value) => {
  //   if (!id) return;
  //   const items = tabs.value;
  //   const tabItem = items.find((item) => {
  //     return item.id === id;
  //   });
  //   if (!tabItem) return;
  //   tabItem.key = getUUID();
  // };

  const commands = {
    close,
    closeOther,
    // closeLeft,
    closeRight,
    // refresh,
  };

  provide(NavTabCommandsInjectionKey, commands);

  return commands;
}
