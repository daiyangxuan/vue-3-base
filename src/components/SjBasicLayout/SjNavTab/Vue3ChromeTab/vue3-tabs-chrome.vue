<template>
  <div class="vue3-tabs-chrome">
    <div class="tabs-content" :ref="setContentRef">
      <div
        class="tabs-item"
        v-for="(tab, i) in tabs"
        :class="{ active: tab.key === modelValue }"
        :key="tab.key"
        :style="{ width: tabWidth + 'px' }"
        :ref="(e) => setTabRef(e, tab)"
        @contextmenu="(e) => handleContextMenu(e, tab, i)"
      >
        <div class="tabs-background">
          <div class="tabs-background-divider"></div>
          <div class="tabs-background-content"></div>
          <svg class="tabs-background-before" width="7" height="7">
            <path d="M 0 7 A 7 7 0 0 0 7 0 L 7 7 Z"></path>
          </svg>
          <svg class="tabs-background-after" width="7" height="7">
            <path d="M 0 0 A 7 7 0 0 0 7 7 L 0 7 Z"></path>
          </svg>
        </div>
        <div
          class="tabs-close"
          @click.stop="handleDelete(tab, i)"
          v-show="showTabCloseIcon(tab)"
        >
          <svg class="tabs-close-icon" width="16" height="16" stroke="#595959">
            <path d="M 4 4 L 12 12 M 12 4 L 4 12"></path>
          </svg>
        </div>
        <div class="tabs-main" :title="tab.label">
          <span v-if="tab.loading">
            <loading-outlined />
          </span>
          <template v-else>
            <span class="tabs-favico" v-if="tab.favico">
              <render-temp
                v-if="typeof tab.favico === 'function'"
                :render="tab.favico"
                :params="[tab, i]"
              />
              <img v-else-if="tab.favico" :src="tab.favico" alt="" />
            </span>
          </template>
          <span
            class="tabs-label"
            :class="{
              'no-close': !showTabCloseIcon(tab),
              'no-icon': !tab.favico,
            }"
            style="
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            "
          >
            <render-temp
              v-if="typeof renderLabel === 'function'"
              :render="renderLabel"
              :params="[tab, i]"
            />
            <template v-else>{{ tab.label }}</template>
          </span>
        </div>
      </div>
      <span
        class="tabs-after"
        :ref="setAfterRef"
        :style="{ left: (tabWidth - gap * 2) * tabs.length + gap * 2 + 'px' }"
      >
        <slot name="after" />
      </span>
    </div>
  </div>
</template>

<script lang="ts">
import { LoadingOutlined } from "@ant-design/icons-vue";
import RenderTemp from "./render-temp.vue";
import Draggabilly from "draggabilly";
import {
  ComponentPublicInstance,
  defineComponent,
  h,
  nextTick,
  onMounted,
  onUnmounted,
  PropType,
  reactive,
  ref,
} from "vue";

export interface Tab {
  /** ???????????? */
  label: string;
  /** ?????? key */
  key: string;
  favico?: string;
  /**
   * ???????????????
   */
  closable?: boolean;
  /**
   * ??????????????????
   */
  swappable?: boolean;
  /**
   * ???????????????
   */
  dragable?: boolean;
  $el?: HTMLElement;
  // eslint-disable-next-line
  _instance?: any;
  _x?: number;
  loading?: boolean;
}

export interface Refs {
  [key: string]: Element | null;
}

export default defineComponent({
  name: "VueTabsChrome",
  components: { RenderTemp, LoadingOutlined },
  emits: [
    "tab-click",
    "update:modelValue",
    "remove",
    "dragstart",
    "dragging",
    "dragend",
    "swap",
    "tab-contextmenu",
  ],
  props: {
    modelValue: {
      type: [String, Number],
      default: "",
    },
    tabs: {
      type: Array as PropType<Tab[]>,
      default: () => [],
    },
    /**
     * ????????????????????????????????????????????????????????????
     */
    autoHiddenCloseIconWidth: {
      type: Number,
      default: 120,
    },
    /**
     * tab ???????????????
     */
    minWidth: {
      type: Number,
      default: 40,
    },
    /**
     * tab ???????????????
     */
    maxWidth: {
      type: Number,
      default: 245,
    },
    /**
     * ??????????????? tab ???????????????
     */
    gap: {
      type: Number,
      default: 7,
    },
    /**
     * ????????????
     */
    onClose: {
      type: Function,
    },
    /**
     * ??? tab ????????????????????????????????? tab ??????
     */
    insertToAfter: {
      type: Boolean,
      default: false,
    },
    /**
     * ?????????????????????????????????????????? tab ?????????????????????
     */
    isMousedownActive: {
      type: Boolean,
      default: true,
    },
    /**
     * ??????????????? label
     */
    renderLabel: {
      type: Function,
    },
  },
  setup(props, context) {
    const $refs = reactive<Refs>({});
    const tabWidth = ref<number>(0);

    /**
     * ???????????? tab ?????????
     */
    const calcTabWidth = () => {
      const { tabs, minWidth, maxWidth, gap } = props;
      const { $content } = $refs;
      const afterWidth = $refs.$after?.getBoundingClientRect().width || 0;
      if (!$content) return Math.max(maxWidth, minWidth);
      const contentWidth: number = $content.clientWidth - gap * 3 - afterWidth;
      let width: number = contentWidth / tabs.length;
      width += gap * 2;
      if (width > maxWidth) width = maxWidth;
      if (width < minWidth) width = minWidth;
      tabWidth.value = width;
    };

    /**
     * ??????????????????
     * @param e ????????????
     * @param tab ????????????????????? tab
     * @param i ?????????????????????
     */
    const handlePointerDown = (e: Event, tab: Tab, i: number) => {
      const { emit } = context;
      const { isMousedownActive } = props;
      // ????????????????????? active????????????
      if (isMousedownActive) emit("update:modelValue", tab.key);
      // emit("update:modelValue", tab.key);
      emit("dragstart", e, tab, i);
    };

    /**
     * ??????????????????
     * @param e ????????????
     * @param tab ????????????????????? tab
     * @param i ?????????????????????
     */
    const handleDragMove = (e: Event, tab: Tab, i: number) => {
      const { tabs, gap } = props;
      const { emit } = context;

      if (tab.swappable === false) {
        return;
      }

      // ???????????? tab ??????
      const halfWidth = (tabWidth.value - gap) / 2;
      // ?????? tab ????????? x ???
      const { x } = tab._instance.position;
      let swapTab: Tab | null = null;
      for (let i = 0; i < tabs.length; i++) {
        const currentTab: Tab = tabs[i];
        const targetX: number = (currentTab._x || 1) - 1;

        // ??????????????????????????????????????????
        if (tab.key === currentTab.key) {
          // eslint-disable-next-line no-continue
          continue;
        }
        // ???????????????????????? tab?????????????????????????????????????????????
        if (targetX <= x && x < targetX + halfWidth) {
          swapTab = currentTab;
          swapTabs(tab, swapTab);
          break;
        }
      }
      emit("dragging", e, tab, i);
    };

    /**
     * ????????? tab
     * @param tab ?????? tab
     * @param swapTab ??????????????? tab
     */
    const swapTabs = (tab: Tab, swapTab: Tab) => {
      if (swapTab.swappable === false) {
        return;
      }
      const { tabs } = props;
      const { emit } = context;

      let index = -1;
      let swapIndex = -1;

      for (let i = 0; i < tabs.length; i++) {
        const obj: Tab = tabs[i];
        if (obj.key === tab.key) {
          index = i;
        }
        if (obj.key === swapTab.key) {
          swapIndex = i;
        }
      }

      if (index < 0 || swapIndex < 0 || index === swapIndex) {
        return;
      }

      // eslint-disable-next-line
      ;[tabs[index], tabs[swapIndex]] = [tabs[swapIndex], tabs[index]];

      // swap x
      const { _x } = tab;
      tab._x = swapTab._x;
      swapTab._x = _x;

      // swap position
      const { _instance } = swapTab;
      setTimeout(() => {
        _instance.element.classList.add("move");
        _instance.setPosition(_x, _instance.position.y);
      }, 50);
      setTimeout(() => {
        _instance.element.classList.remove("move");
        emit("swap", tab, swapTab);
      }, 200);
    };

    /**
     * ??????????????????
     * @param e ????????????
     * @param tab ????????? tab
     * @param i ?????????????????????
     */
    const handleDragEnd = (e: Event, tab: Tab, i: number) => {
      const { _instance } = tab;
      const { emit } = context;

      if (_instance.position.x === 0) return;
      setTimeout(() => {
        _instance.element.classList.add("move");
        _instance.setPosition(tab._x, 0);
      }, 50);
      setTimeout(() => {
        _instance.element.classList.remove("move");
        emit("dragend", e, tab, i);
      }, 200);
      return false;
    };

    /**
     * ??????????????????
     * @param e ????????????
     * @param tab ????????? tab
     * @param i ?????????????????????
     */
    const handleClick = (e: Event, tab: Tab, i: number) => {
      const { emit } = context;
      emit("tab-click", e, tab, i);
    };

    /**
     * ??????????????????
     * @param e ????????????
     * @param tab ????????? tab
     * @param i ?????????????????????
     */
    const handleContextMenu = (e: Event, tab: Tab, i: number) => {
      const { emit } = context;
      emit("tab-contextmenu", e, tab, i);
    };

    /**
     * ????????????
     * @param tab ???????????? tab
     * @param i ???????????? tab ?????????
     */
    const handleDelete = (tab: Tab, i: number) => {
      const { tabs, modelValue, onClose } = props;
      const { emit } = context;
      const index = tabs.findIndex((item) => item.key === modelValue);

      // ???????????? onClose ?????? false ?????????????????????
      if (typeof onClose === "function" && onClose(tab, tab.key, i) === false) {
        return false;
      }

      let after, before;
      if (i === index) {
        after = tabs[i + 1];
        before = tabs[i - 1];
      }

      if (after) {
        emit("update:modelValue", after.key);
      } else if (before) {
        emit("update:modelValue", before.key);
      } else if (tabs.length <= 1) {
        emit("update:modelValue", null);
      }
      tabs.splice(i, 1);
      emit("remove", tab, i);

      nextTick(() => {
        doLayout();
      });
    };

    /**
     * ???????????? tab
     * @param newTabs ????????????????????? tab
     */
    const addTab = (...newTabs: Array<Tab>) => {
      const { insertToAfter, modelValue, tabs } = props;
      if (insertToAfter) {
        const i = tabs.findIndex((tab) => tab.key === modelValue);
        tabs.splice(i + 1, 0, ...newTabs);
      } else {
        tabs.push(...newTabs);
      }

      nextTick(() => {
        init();
        doLayout();
      });
    };

    /**
     * ???????????? tab
     * @param tabKey ??????????????????????????????????????????
     */
    const removeTab = (tabKey: string | number) => {
      const { tabs } = props;

      if (typeof tabKey === "number") {
        const index: number = tabKey;
        const tab = tabs[index];
        handleDelete(tab, index);
      } else {
        const index: number = tabs.findIndex((item) => item.key === tabKey);
        const tab: Tab | undefined = tabs.find((item) => item.key === tabKey);
        if (tab) {
          handleDelete(tab, index);
        }
      }
    };

    // ?????????
    let timer: number;
    /**
     * ???????????????????????????
     */
    const handleResize = () => {
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        doLayout();
      }, 100);
    };

    /**
     * ??????????????????????????????
     */
    const showTabCloseIcon = (tab: Tab) => {
      const { modelValue, autoHiddenCloseIconWidth } = props;
      if (tab.closable === false) {
        return false;
      }

      if (tab.key === modelValue) {
        return true;
      }

      if (autoHiddenCloseIconWidth > tabWidth.value) {
        return false;
      }

      return true;
    };

    /**
     * ????????????
     */
    const renderLabelText = (tab: Tab) => {
      const { renderLabel } = props;
      if (renderLabel) {
        return renderLabel(tab);
      }
      return h("span", tab.label);
    };

    /**
     * ???????????? tab ??????
     */
    const doLayout = () => {
      calcTabWidth();
      const { tabs, gap } = props;
      tabs.forEach((tab, i) => {
        const instance = tab._instance;
        if (!instance) return;
        const _x = (tabWidth.value - gap * 2) * i;
        tab._x = _x;
        instance.setPosition(_x, 0);
      });
    };

    /**
     * ?????? tab ??????
     * @param tab ???????????? tab
     * @param i ???????????? tab ?????????
     */
    const addInstance = (tab: Tab, i: number) => {
      const { gap } = props;

      // ????????????????????????????????????????????????
      if (tab._instance) {
        tab._instance.setPosition(tab._x, 0);
        return;
      }
      // ??????????????? dom ????????????????????????
      if (!tab.$el || !$refs.$content) {
        return;
      }
      // ????????????
      tab._instance = new Draggabilly(tab.$el, {
        axis: "x",
        containment: $refs.$content as any,
        handle: ".tabs-main",
      });
      if (tab.dragable === false) {
        tab._instance.disable();
      }
      // ???????????? x ???
      const x = (tabWidth.value - gap * 2) * i;
      // ?????? x ????????? tab ???
      tab._x = x;
      // ????????????
      tab._instance.setPosition(x, 0);
      // ??????????????????
      tab._instance.on("pointerDown", (e: Event) =>
        handlePointerDown(e, tab, i)
      );
      tab._instance.on("dragMove", (e: Event) => handleDragMove(e, tab, i));
      tab._instance.on("dragEnd", (e: Event) => handleDragEnd(e, tab, i));
      tab._instance.on("staticClick", (e: Event) => handleClick(e, tab, i));
    };

    /**
     * ??????????????? tab ????????????
     */
    const init = () => {
      props.tabs.forEach((tab: Tab, i: number) => {
        addInstance(tab, i);
      });
    };

    /**
     * ??? Tab ?????? dom ??????
     * @param el ?????? tab ????????? dom ??????
     * @param tab ???????????? tab
     */
    const setTabRef = (
      el: Element | ComponentPublicInstance | null,
      tab: Tab
    ) => {
      if (el) {
        tab.$el = el as HTMLElement;
      }
    };

    /**
     * ???????????? dom ??????
     * @param el tab ????????? dom ?????????
     */
    const setContentRef = (el: Element | ComponentPublicInstance | null) => {
      if (el) {
        $refs.$content = el as any;
      }
    };

    /**
     * ?????????????????? dom ??????
     * @param el ??? tab ???????????????
     */
    const setAfterRef = (el: Element | ComponentPublicInstance | null) => {
      if (el) {
        $refs.$after = el as any;
      }
    };

    onMounted(() => {
      calcTabWidth();
      init();
      window.addEventListener("resize", handleResize);
    });

    onUnmounted(() => {
      window.removeEventListener("resize", handleResize);
      if (timer) window.clearTimeout(timer);
    });

    return {
      setTabRef,
      setContentRef,
      setAfterRef,
      tabWidth,
      handleDelete,
      handleContextMenu,
      showTabCloseIcon,
      renderLabelText,
      doLayout,
      addTab,
      removeTab,
    };
  },
});
</script>

<style lang="less">
.vue3-tabs-chrome {
  @bg: #dee1e6;
  @gap: 7px;
  @divider: #a9adb0;
  @speed: 150ms;

  padding-top: 10px;
  background-color: @bg;
  position: relative;

  .tabs-content {
    height: 34px;
    position: relative;
    overflow: hidden;
    & .tabs-item .tabs-label.no-close {
      margin-right: 0 !important;
    }
  }

  /* divider */

  .tabs-divider {
    left: 0;
    top: 50%;
    width: 1px;
    height: 20px;
    background-color: @divider;
    position: absolute;
    transform: translateY(-50%);
  }

  .tabs-item {
    height: 100%;
    display: flex;
    align-items: center;
    user-select: none;
    box-sizing: border-box;
    // transition: width @speed;
    position: absolute;

    &:hover {
      z-index: 1;

      .tabs-background-divider {
        display: none;
      }

      .tabs-background-content {
        background-color: #f2f3f5;
      }

      .tabs-background-before,
      .tabs-background-after {
        fill: #f2f3f5;
      }
    }

    &.move {
      transition: @speed;
    }

    &.is-dragging {
      z-index: 3;

      .tabs-background-content {
        background-color: #f2f3f5;
      }

      .tabs-background-divider {
        display: none;
      }

      .tabs-background-before,
      .tabs-background-after {
        fill: #f2f3f5;
      }
    }

    &.active {
      z-index: 2;

      .tabs-close {
        background-color: #fff;
      }

      .tabs-background-divider {
        display: none;
      }

      .tabs-background-content {
        background-color: #fff;
      }

      .tabs-background-before,
      .tabs-background-after {
        fill: #fff;
      }
    }

    &:first-of-type {
      .tabs-background-divider::before {
        display: none;
      }
    }
  }

  .tabs-main {
    height: 100%;
    left: 0;
    right: 0;
    margin: 0 @gap * 2;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    transition: @speed;
    display: flex;
    align-items: center;
    position: absolute;
    box-sizing: border-box;
    overflow: hidden;
    margin: 0 !important;
  }

  .tabs-close {
    top: 50%;
    right: @gap * 2;
    width: 16px;
    height: 16px;
    z-index: 1;
    position: absolute;
    transform: translateY(-50%);
  }

  .tabs-close-icon {
    width: 100%;
    height: 100%;
    border-radius: 50%;

    &:hover {
      stroke: #000;
      background-color: #e8eaed;
    }
  }

  .tabs-favico {
    height: 16px;
    margin-left: 3%;
    display: flex;
    align-items: center;
    overflow: hidden;

    img {
      height: 100%;
    }
  }

  .tabs-label {
    flex: 1;
    margin-left: 5%;
    margin-right: 16px;
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
    position: relative;

    &.no-close {
      margin-right: 0;
    }

    &.no-icon {
      margin-left: 0;
    }
  }

  .tabs-background {
    width: 100%;
    height: 100%;
    padding: 0 @gap - 1px;
    position: absolute;
    box-sizing: border-box;
  }

  .tabs-background-divider {
    left: 0;
    width: calc(100% - 14px);
    height: 100%;
    margin: 0 7px;
    position: absolute;

    &::before {
      content: "";
      top: 20%;
      right: 100%;
      width: 1px;
      height: 60%;
      background-color: #81878c;
      position: absolute;
    }

    &::after {
      content: "";
      top: 20%;
      left: calc(100% - 1px);
      width: 1px;
      height: 60%;
      background-color: #81878c;
      position: absolute;
    }
  }

  .tabs-background-content {
    height: 100%;
    border-top-left-radius: 5px;
    border-top-right-radius: 5px;
    transition: @speed;
  }

  .tabs-background-before,
  .tabs-background-after {
    bottom: -1px;
    position: absolute;
    fill: transparent;
    transition: @speed;
  }

  .tabs-background-before {
    left: -1px;
  }

  .tabs-background-after {
    right: -1px;
  }

  .tabs-footer {
    height: 4px;
    background-color: #fff;
  }

  .tabs-after {
    top: 50%;
    display: flex;
    position: absolute;
    overflow: hidden;
    transform: translateY(-50%);
  }

  @keyframes tab-show {
    from {
      transform: scaleX(0);
    }
    to {
      transform: scaleX(1);
    }
  }
}
</style>
