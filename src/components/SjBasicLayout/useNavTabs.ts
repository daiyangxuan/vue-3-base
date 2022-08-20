import { inject, InjectionKey, provide, Ref } from "vue";
import { TabInfo } from "./SjNavTab/types";

export interface NavTab {
  tabs: Array<TabInfo>;
  selectedTabKey: Ref<string | undefined>;
}
export const NavTabsInjectionKey: InjectionKey<NavTab> = Symbol(
  "NavTabsInjectionKey"
);

export function provideNavTabs(navTab: NavTab) {
  provide(NavTabsInjectionKey, navTab);
}
export default function useNavTabs() {
  const navTab = inject(NavTabsInjectionKey);
  if (!navTab) {
    throw new Error("useNavTabs must be used in SjBasicLayout components");
  }
  return navTab;
}
