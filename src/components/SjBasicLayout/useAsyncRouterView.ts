import { inject, InjectionKey, provide } from "vue";
import ProgressBar from "./ProgressBar";
import { TabInfo } from "./SjNavTab/types";

export interface AsyncRouterView {
  onInit: (
    getData?: (tab: TabInfo, routerViewProgress: ProgressBar) => Promise<void>
  ) => Promise<void>;
  routerViewProgress: ProgressBar;
  tab: TabInfo | undefined;
}

export const AsyncRouterViewInjectionKey: InjectionKey<AsyncRouterView> =
  Symbol("AsyncRouterViewInjectionKey");
export function provideAsyncRouterView(asyncRouterView: AsyncRouterView) {
  provide(AsyncRouterViewInjectionKey, asyncRouterView);
}
export default function useAsyncRouterView(
  getData?: (tab: TabInfo, routerViewProgress: ProgressBar) => Promise<void>
) {
  const asyncRouterView = inject(AsyncRouterViewInjectionKey);
  if (!asyncRouterView) {
    throw new Error(
      "useAsyncRouterView must be used in async router view component"
    );
  }
  const { onInit, routerViewProgress, tab } = asyncRouterView;
  onInit(getData);
  return {
    routerViewProgress,
    tab,
  };
}
