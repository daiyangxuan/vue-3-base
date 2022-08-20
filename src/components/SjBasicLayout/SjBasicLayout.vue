<template>
  <a-layout style="height: 100%">
    <SjSider :menu="menu" :selectedKey="selectedKeyList" />
    <a-layout class="main-layout-wrapper">
      <div class="main-layout-top-container">
        <SjNavTab
          class="nav-tab"
          :tabs="tabs"
          :selected-key="selectedKey"
          ref="navTabRef"
          @tab-click="handleTabClick"
        />
        <div class="tab-after">
          <slot name="tab-after"></slot>
        </div>
      </div>
      <div class="main-layout-container" ref="contentRef">
        <router-view v-slot="{ Component }">
          <template v-if="Component && selectedKey">
            <keep-alive>
              <component :is="Component" :key="selectedKey" />
            </keep-alive>
          </template>
        </router-view>
      </div>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import SjSider from "./SjSider/SjSider.vue";
import { reactive, ref, watch, defineProps } from "vue";

import { useRoute } from "vue-router";
import { TabInfo } from "./SjNavTab/types";
import useKeepScrollRouter from "./useKeepScrollRouter";
import SjNavTab from "./SjNavTab/SjNavTab.vue";
import { MenuInfo } from "./SjSider/types";
import { provideNavTabs } from "./useNavTabs";
import { getUUID } from "../../utils";
import { deepEqual } from "../../utils";

const navTabRef = ref<InstanceType<typeof SjNavTab> | null>(null);
const contentRef = ref<HTMLElement | null>(null);

const route = useRoute();
const router = useKeepScrollRouter(contentRef);

// eslint-disable-next-line no-undef
const props = withDefaults(
  defineProps<{
    menu: MenuInfo[];
    defaultHomePath?: string;
  }>(),
  {
    defaultHomePath: "/home",
  }
);

// const { tabs, selectedKey } = useStorageTabs(menu);
// todo 目前不存储上次打开的页签
const tabs = reactive<Array<TabInfo>>([
  {
    key: getUUID(),
    label: "首页",
    fullPath: props.defaultHomePath,
    closable: false,
  },
]);
const selectedKey = ref<string | undefined>(undefined);
const selectedKeyList = ref<string | undefined>();

provideNavTabs({
  tabs,
  selectedTabKey: selectedKey,
});

const handleTabClick = (tab: TabInfo) => {
  router.push({
    path: tab.fullPath,
    query: tab.query,
  });
};

watch(
  () => route,
  () => {
    console.log(route)
  },
  {
    immediate: true,
    deep: true,
  },
)

// setInterval(() => {
//   console.log(useRoute())
// }, 500)

watch(
  [() => route?.fullPath, () => route?.matched],
  ([fullPath, matched]) => {
    console.log("========================")
    if (!fullPath || matched.length === 0) {
      return;
    }
    const existTab = tabs.find((tab) => {
      const params = fullPath?.split("?")[1]?.split("&");
      const obj: any = {};
      params?.map(
        (v: any) =>
          (obj[v?.split("=")[0]] = decodeURIComponent(v?.split("=")[1]))
      );
      return (
        tab.fullPath.split("?")[0] === fullPath.split("?")[0] &&
        deepEqual(tab.query || {}, obj)
      );
    });
    let key: string;
    if (!existTab) {
      key = getUUID();
      const item: TabInfo = {
        label: "",
        fullPath,
        // loading: false,
        key,
      };
      if (navTabRef.value) {
        navTabRef.value?.addTab(item);
      } else {
        tabs.push(item);
      }
    } else {
      key = existTab.key;
    }
    selectedKey.value = key;
    console.log("changePage", fullPath.replace("/", ""), [fullPath.replace("/", "")]);
    selectedKeyList.value = fullPath.replace("/", "");
  },
  {
    immediate: true,
    deep: true,
  }
);
</script>
<style lang="less" scoped>
.main-layout-wrapper {
  display: flex;
  align-items: stretch;
  flex-direction: column;

  .main-layout-top-container {
    display: flex;
    align-items: stretch;
    background-color: #3f495c;
    :deep(.nav-tab) {
      flex: 1 1 0;
    }

    .tab-after {
      flex-shrink: 0;
    }
  }
}

.main-layout-container {
  overflow: auto;
  flex: 1 1 0;
}
</style>
