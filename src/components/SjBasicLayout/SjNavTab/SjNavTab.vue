<template>
  <a-dropdown :trigger="['contextmenu']">
    <vue3-tabs-chrome
      :tabs="tabs"
      :modelValue="selectedKey"
      :min-width="94"
      :max-width="178"
      @tab-click="handleTabClick"
      @tab-contextmenu="handleTabContextmenu"
      :on-close="onClose"
      ref="tabsRef"
    />
    <template #overlay>
      <a-menu @click="handleContextMenuItemClick">
        <a-menu-item key="close" :disabled="!isContextmenuClosable"
          >关闭标签</a-menu-item
        >
        <a-menu-item key="closeOther" :disabled="!isContextmenuOtherClosable"
          >关闭其他标签</a-menu-item
        >
        <a-menu-item key="closeRight" :disabled="!isContextmenuRightClosable"
          >关闭右侧标签</a-menu-item
        >
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script lang="ts" setup>
import Vue3TabsChrome from "./Vue3ChromeTab/vue3-tabs-chrome.vue";
import { computed, ref, toRef } from "vue";
import { TabInfo } from "./types";
import { provideNavTabCommands } from "./useNavTabCommands";

const props = defineProps<{
  tabs: TabInfo[];
  selectedKey: string | undefined;
}>();

const emit = defineEmits<{
  // (e: "update:selectedKey", key: typeof props.selectedKey): void;
  (e: "tab-click", tab: TabInfo): void;
}>();

const removeTab = (tabKey: string) => {
  if (tabsRef.value) {
    tabsRef.value.removeTab(tabKey);
  }
};

const addTab = (...newTabs: Array<TabInfo>) => {
  if (tabsRef.value) {
    tabsRef.value.addTab(...newTabs);
  }
};

const doLayout = () => {
  if (tabsRef.value) {
    tabsRef.value.doLayout();
  }
};

const selectedKey = toRef(props, "selectedKey");
const { close, closeOther, closeRight } = provideNavTabCommands(
  props.tabs,
  selectedKey,
  doLayout
);

const handleTabClick = (e: Event, tab: TabInfo) => {
  emit("tab-click", tab);
};

const contextmenuTab = ref<TabInfo | null>(null);

const isContextmenuClosable = computed(() => {
  if (!contextmenuTab.value) return false;
  return contextmenuTab.value.closable ?? true;
});
const isContextmenuRightClosable = computed(() => {
  if (!contextmenuTab.value) return false;
  return props.tabs.indexOf(contextmenuTab.value) < props.tabs.length - 1;
});
const isContextmenuOtherClosable = computed(() => {
  if (!contextmenuTab.value) return false;
  return props.tabs.length > 1;
});
const handleTabContextmenu = (e: Event, tab: TabInfo) => {
  e.preventDefault();
  contextmenuTab.value = tab;
};
type contextMenuItemKey = "close" | "closeOther" | "closeRight";
const handleContextMenuItemClick = ({ key }: { key: contextMenuItemKey }) => {
  const tab = contextmenuTab.value;
  if (!tab) return;
  switch (key) {
    case "close":
      close(tab.key);
      break;
    case "closeOther":
      closeOther(tab.key);
      break;
    case "closeRight":
      closeRight(tab.key);
      break;
  }
};

const onClose = (tab: TabInfo) => {
  close(tab.key);
  return false;
};

const tabsRef = ref<InstanceType<typeof Vue3TabsChrome> | null>(null);
defineExpose({
  addTab,
  removeTab,
});
</script>

<style lang="less" scoped>
@import "vue3-tabs-chrome/dist/vue3-tabs-chrome.css";

.vue3-tabs-chrome {
  background-color: inherit !important;

  :deep(.tabs-content) {
    .tabs-item {
      .tabs-close {
        right: 19px !important;
      }
      .tabs-main {
        margin: 0 19px !important;
      }
      .tabs-label {
        font-size: 14px;
        font-weight: 400;
        line-height: 16px;
        text-align: center;
        color: #ffffff;
        margin-right: 28px !important;
      }

      &.active {
        .tabs-label {
          color: rgba(0, 0, 0, 0.85);
        }

        .tabs-background-content {
          background-color: #ffffff;
        }

        .tabs-background-before,
        .tabs-background-after {
          fill: #ffffff;
        }
      }

      .tabs-close {
        background: none !important;
      }

      &:hover:not(.active) {
        .tabs-label {
          color: rgba(0, 0, 0, 0.85);
        }

        .tabs-background-content {
          background-color: #f2f3f5;
        }

        .tabs-background-before,
        .tabs-background-after {
          fill: #f2f3f5;
        }
      }
    }
  }
}
</style>
