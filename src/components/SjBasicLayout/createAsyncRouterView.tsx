import { AsyncComponentLoader } from "@vue/runtime-core";
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  getCurrentInstance,
  onMounted,
  Ref,
  ref,
} from "vue";
// import { provideAsyncRouterView } from "@/composables/useAsyncRouterView";
// import useRouterTab from "@/components/RouterTab/useRouterTab";
import RouterViewLoading from "./RouterViewLoading.vue";
import ProgressBar from "./ProgressBar";
import useNavTabs from "./useNavTabs";
import { TabInfo } from "./SjNavTab/types";
import { provideAsyncRouterView } from "./useAsyncRouterView";

const createAsyncRouterView = (loader: AsyncComponentLoader) => {
  const AsyncComponent = defineAsyncComponent({
    loadingComponent: RouterViewLoading,
    delay: 0,
    loader: async () => {
      return await loader();
      // try {
      //   // loading.value = true;
      //   return await loader();
      // } finally {
      //   // loading.value = false;
      // }
    },
  });

  // const AsyncComponent = defineAsyncComponent(loader);

  return defineComponent({
    components: {
      AsyncComponent,
    },
    name: "AsyncRouterView",
    setup(props, context) {
      const wrapperRef: Ref<HTMLElement | null> = ref(null);
      const routerViewProgress = new ProgressBar();

      const { tabs, selectedTabKey } = useNavTabs();
      const instance = getCurrentInstance();
      if (!instance) {
        throw new Error("router view not a instance");
      }
      const key = instance.vnode.key;
      const id = `async-router-view-${String(key)}`;
      const currentTabItem = computed(() => {
        return tabs.find((item) => {
          return item.key === key;
        });
      });

      const onInit = async (
        getData: (
          tab: TabInfo,
          routerViewProgress: ProgressBar
        ) => Promise<void> = () => Promise.resolve()
      ) => {
        if (currentTabItem.value) {
          await getData(currentTabItem.value, routerViewProgress);
        }
        if (currentTabItem.value) {
          currentTabItem.value.loading = false;
        }
        routerViewProgress.done();
      };

      provideAsyncRouterView({
        onInit,
        routerViewProgress,
        tab: currentTabItem.value,
      });
      onMounted(() => {
        if (!wrapperRef.value) {
          throw new Error("NO Wrapper Element for Progress");
        }
        routerViewProgress.configure({
          parent: wrapperRef.value,
          showSpinner: false,
          trickleSpeed: 100,
        });
        routerViewProgress.start();
        if (currentTabItem.value) {
          currentTabItem.value.loading = true;
        }
      });
      // const handleResolve = () => {
      //   routerViewProgress.done();
      // };
      return () => {
        return (
          <div style={"height:100%;width: 100%"} id={id} ref={wrapperRef}>
            {/*<Suspense*/}
            {/*  timeout="0"*/}
            {/*  onResolve={handleResolve}*/}
            {/*  v-slots={{*/}
            {/*    default: () => (*/}
            {/*      <AsyncComponent*/}
            {/*        {...context.attrs}*/}
            {/*        style={"height:100%;width: 100%"}*/}
            {/*        ref={componentRef}*/}
            {/*      />*/}
            {/*      // <About1View/>*/}
            {/*    ),*/}
            {/*    fallback: () => <div class="loading">loading suspense</div>,*/}
            {/*  }}*/}
            {/*/>*/}
            <AsyncComponent
              {...context.attrs}
              style={"height:100%;width: 100%"}
            />
          </div>
        );
      };
    },
  });
};
export default createAsyncRouterView;
