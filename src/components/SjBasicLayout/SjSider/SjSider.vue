<template>
  <a-layout-sider
    v-model:collapsed="collapsed"
    class="sider"
    :collapsed-width="48"
    :trigger="null"
    collapsible
  >
    <a-space class="logo">
      <img :src="require('./assets/logo.png')" alt="" class="logo-image" />
      <img
        :src="require('./assets/banner.png')"
        alt=""
        :class="[
          'logo-banner',
          {
            'logo-banner-collapsed': collapsed,
          },
        ]"
      />
    </a-space>
    <nav-menu
      :menu="menu"
      :selected-keys="[selectedKey]"
      @update:selectedKeys="handleUpdateSelectedKeys"
    />
    <a-space>
      <component
        :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
        class="trigger"
        @click="onCollapseTrigger"
      />
    </a-space>
    <img
      :src="require('./assets/background.png')"
      alt=""
      class="background-img"
    />
  </a-layout-sider>
</template>
<script setup lang="ts">
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons-vue";
import { ref, defineProps, defineEmits } from "vue";
import NavMenu from "./NavMenu";
import { MenuInfo } from "./types";

// eslint-disable-next-line no-undef
const props = withDefaults(
  defineProps<{
    menu?: Array<MenuInfo>;
    selectedKey?: string | undefined;
    selectedKeyList?: string[] | undefined;
  }>(),
  {
    menu: () => [],
  }
);

const emit = defineEmits<{
  (e: "update:selectedKey", key: typeof props.selectedKey): void;
}>();

const handleUpdateSelectedKeys = (keys: string[]) => {
  console.log("handleUpdateSelectedKeys", keys)
  emit("update:selectedKey", keys[0] ?? null);
};

const collapsed = ref(false);
const onCollapseTrigger = () => {
  collapsed.value = !collapsed.value;
};
</script>

<style scoped lang="less">
.sider {
  height: 100%;
  width: 200px;
}

.logo {
  height: 40px;
  margin: 8px;
  &-image {
    height: 24px;
    margin: 4px;
  }
  &-banner {
    transition: 0.3s all;
    height: 20px;
    margin: 4px;
    &-collapsed {
      opacity: 0;
    }
  }
}

.trigger {
  position: absolute;
  color: #ffffff;
  font-size: 16px;
  left: 16px;
  bottom: 8px;
}

.background-img {
  align-self: flex-start;
  height: 175px;
  width: auto;
  position: absolute;
  left: 15px;
  bottom: 15px;
  pointer-events: none;
  user-select: none;
}
</style>
