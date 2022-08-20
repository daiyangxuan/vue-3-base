<template>
  <div class="flex items-center">
    <a-popover
      v-model:visible="visible"
      trigger="click"
      :placement="placement"
      arrow-point-at-center
      :overlay-class-name="`_popover-classname ${popoverClass}`"
      :overlay-style="{
        '--width': width,
        animation: animation ? 'slideUpIn 0.1s 0.1s linear' : 'auto',
        animationPlayState: animationPause ? 'paused' : 'running',
      }"
      :destroyTooltipOnHide="true"
      :get-popup-container="getPopupContainer"
      :auto-adjust-overflow="autoAdjustOverflow"
      @visible-change="handleVisbleChange"
    >
      <slot name="trigger">
        <div
          v-if="tagsPlacement === 'normal'"
          class="input-trigger"
          :class="{
            'input-trigger--disabled': disabled,
          }"
          :style="{ width }"
        >
          <div style="flex: 1">
            <TagsView
              v-model:value="selectedRowKeys"
              :field-names="fieldNames"
              :closable="!disabled"
              :options="selectedRowKeys.map((key) => dataMap.get(key))"
              :get-show-value="getShowValue"
              tag-style="margin: 2px"
              @remove="handleTagRemove"
            />
            <div
              v-if="selectedRowKeys.length === 0"
              class="flex items-center leading-tight select-none"
              style="color: #bfbfbf"
            >
              {{ disabled ? "" : props.emptyText }}
            </div>
          </div>
          <div class="suffixIcon">
            <DownOutlined
              v-if="suffix === 'down'"
              style="font-size: 13px; color: #bfbfbf"
            />
            <icon-font
              v-else
              type="icon-sousuo"
              style="font-size: 13px; color: #bfbfbf"
            ></icon-font>
          </div>
        </div>
        <div
          v-else
          class="ant-dropdown-trigger"
          :style="{
            [`margin-${tagsPlacement === 'prefix' ? 'left' : 'right'}`]: '16px',
          }"
        >
          +
        </div>
      </slot>

      <template #content>
        <div
          v-if="!disabled"
          style="display: flex; flex-direction: column; background: #ffffff"
        >
          <a-row @click.stop>
            <a-input
              v-if="tableSearch"
              v-model:value="tableSearchVal"
              autocomplete="off"
              size="small"
              :placeholder="placeholder"
              style="width: 100%"
              allow-clear
            >
              <template v-if="!tableSearchVal" #suffix>
                <icon-font
                  type="icon-sousuo"
                  style="font-size: 13px; color: #bfbfbf"
                ></icon-font>
              </template>
            </a-input>
            <a-select
              v-else
              :search-value="searchValue"
              class="search-select"
              :value="[]"
              show-search
              mode="multiple"
              :placeholder="placeholder"
              :field-names="fieldNames"
              :options="flattedData"
              :filter-option="internalFilterOption"
              size="small"
              style="width: 100%"
              allow-clear
              :get-popup-container="getPopupContainer"
              @search="searchValue = $event"
              @select="handleSearchItemSelect"
              @dropdownVisibleChange="
                (visible: boolean) => visible || (searchValue = '')
              "
            >
              <template #tagRender="{ value: val, label }">
                <a-tag :closable="true" @close="handleTagRemove(val)">
                  {{ label }}haha&nbsp;&nbsp;
                </a-tag>
              </template>
              <template #option="option">
                <div style="display: flex; align-items: center">
                  <a-checkbox
                    :checked="selectedRowKeys.includes(getValue(option))"
                    :disabled="getDisabled(option)"
                  />
                  <span
                    style="margin-left: 12px"
                    v-html="replaceKeyword(getLabel(option), searchValue)"
                  >
                  </span>
                </div>
              </template>
            </a-select>
          </a-row>

          <a-row style="margin-top: 8px" @click.stop>
            <slot content="customOptions">
              <SjTable
                v-if="mode === 'table'"
                class="no-highlight"
                :class="{
                  'hidden-header': columns == null,
                  'tooltip-table': tooltip,
                }"
                :column-defs="internalColumns"
                :row-data="rowData"
                :row-height="30"
                :header-height="30"
                :default-col-def="{
                  resizable: false,
                  sortable: false,
                  filter: false,
                  unSortIcon: false,
                  menuTabs: [],
                }"
                :suppress-row-click-selection="true"
                row-selection="multiple"
                :style="{ width: '100%', height: tableHeight }"
                overlay-no-rows-template="<div class='null-data'><div class='null-search-img'></div><p>暂无数据</p></div>"
                @selection-changed="onSelectionChanged"
                @grid-ready="onGridReady"
              />
              <div v-else style="width: 100%">
                <TagsView
                  v-model:value="selectedRowKeys"
                  :field-names="fieldNames"
                  :options="data"
                  :closable="false"
                  :scroll="{ y: 460 }"
                  tag-style="cursor: pointer;"
                  :group-item-selectable="groupItemSelectable"
                  :group-item-anchorable="groupItemAnchorable"
                  :get-show-value="getShowValue"
                  @select="handleSearchItemSelect"
                />
              </div>
            </slot>
          </a-row>

          <slot name="footer">
            <a-row v-if="comfirm" justify="end" style="margin-top: 10px">
              <a-button size="small" @click="onCancel">取消</a-button>
              <a-button
                size="small"
                style="margin-left: 12px"
                type="primary"
                @click="handleConfirm"
                >确定</a-button
              >
            </a-row>
          </slot>
        </div>
      </template>
    </a-popover>
    <TagsView
      v-if="tagsPlacement === 'suffix'"
      v-model:value="selectedRowKeys"
      :field-names="fieldNames"
      :closable="!disabled"
      :options="
        selectedRowKeys.map((key) => ({
          ...dataMap.get(key),
          [fieldNames?.options || 'options']: null,
        }))
      "
      :get-show-value="getShowValue"
      @remove="handleSearchItemSelect"
    />

    <div
      v-if="tagsPlacement === 'suffix' && selectedRowKeys.length === 0"
      class="select-none"
    >
      {{ disabled ? "" : props.emptyText }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { DownOutlined } from "@ant-design/icons-vue";
import { ref, computed, watch, nextTick } from "vue";
import TagsView from "./TagsView.vue";
import SjTable from "../SjTable/SjTable.vue";
import { SelectionChangedEvent } from "ag-grid-community";
import { filterOptions, filterOptionsMultiKeywords } from "../../utils";
import { showTooltip } from "../SjTable/customTooltip";

export type Option = any;

const props = withDefaults(
  defineProps<{
    placement?: string;
    value?: string[];
    data: Option[];
    placeholder?: string;
    emptyText?: string;
    columns?: unknown[];
    fieldNames?: {
      value?: string;
      label?: string;
      options?: string;
      disabled?: string;
      selected?: string;
    };
    // 单个搜索 | 多关键词搜索
    filterType?: "single" | "multiple";
    // 匹配的字段名称
    filterKeys?: string[];
    // 搜索过滤的方法
    filterOption?: (inputValue: string, option: Option) => boolean;
    width?: string;
    tagsPlacement?: "normal" | "suffix" | "prefix";
    /**
     * 分组标题是否可以选中
     */
    groupItemSelectable?: boolean;
    /**
     * 分组标题是否可以快速定位
     */
    groupItemAnchorable?: boolean;
    mode?: "table" | "tag";
    disabled?: boolean;
    // 自动切换位置保证显示完整
    autoAdjustOverflow?: boolean;
    getPopupContainer?: () => HTMLElement;
    suffix?: string; // "search" | "down"
    tableSearch?: boolean;
    animation?: boolean;
    getShowValue?: ((val: any) => string) | undefined;
    tableHeight?: string;
    // 是否需要comfirm
    comfirm?: boolean;
    // popover className
    popoverClass?: string;
    maxShowNum?: number;
    highlight?: boolean;
    tooltip?: boolean;
  }>(),
  {
    width: "412px",
    tableHeight: "280px",
    tagsPlacement: "normal",
    placement: "bottom",
    mode: "table",
    groupItemSelectable: true,
    groupItemAnchorable: false,
    disabled: false,
    autoAdjustOverflow: true,
    getPopupContainer: () => document.body,
    suffix: "search",
    tableSearch: false,
    animation: false,
    getShowValue: undefined,
    comfirm: false,
    popoverClass: "",
    filterType: "multiple",
    filterKeys: () => [],
    highlight: false,
    tooltip: true,
  }
);

const visible = ref(false);
const emits = defineEmits<{
  (event: "onConfirm", value: any[]): void;
  (event: "visible", value: boolean): void;
  (event: "change"): void;
  (event: "update:value", values: string[]): void;
  (event: "row-selected", value: any): void;
}>();

const getValue = (item: Option) => {
  return item[props.fieldNames?.value || "value"];
};
const getLabel = (item: Option) => item[props.fieldNames?.label || "label"];
const getOptions = (item: Option) =>
  item[props.fieldNames?.options || "options"];
const getDisabled = (item: Option) =>
  item[props.fieldNames?.disabled || "disabled"] || false;
const getSelected = (item: Option) =>
  item[props.fieldNames?.selected || "selected"] || false;

const internalColumns = computed(() => {
  return (
    props.columns?.map((el: any) => ({
      ...el,
      ...(props.tooltip
        ? showTooltip(el.field, {
            useFormatted: typeof el.valueFormatter === "function",
          })
        : {}),
    })) || [
      {
        headerName: "名称",
        field: props.fieldNames?.label || "label",
        checkboxSelection: true,
        flex: 1,
        headerClass: (params: any) => {
          if (params.colDef.headerName === "名称") {
            return "!pl-[46px]";
          }
          return null;
        },
        ...(props.tooltip
          ? showTooltip(props.fieldNames?.label || "label")
          : {}),
      },
    ]
  );
});

/**
 * 将数组转换成键值对,方便根据key取值
 */
const dataMap = computed(() => {
  const result = new Map();

  const mapOptions = (options: Option[]) => {
    if (!Array.isArray(options)) return;
    options.forEach((option) => {
      result.set(getValue(option), option);
      if (getOptions(option)) {
        mapOptions(getOptions(option));
      }
      if (option?.child?.length > 0) {
        option?.child?.forEach((o: any) => {
          result.set(getValue(o), o);
        });
      }
    });
  };

  mapOptions(props.data);

  return result;
});

const flattedData = computed(() => {
  const result: Option[] = [];
  const flatOptions = (options: Option[], add = true) => {
    if (!Array.isArray(options)) return;
    options.forEach((option) => {
      const innerOptions = getOptions(option);
      const o = { ...option };
      delete o[props.fieldNames?.options || "options"];
      add && result.push(o);
      if (option.child?.length > 0) {
        option.child?.forEach((item: any) => {
          add && result.push(item);
        });
      }
      flatOptions(innerOptions);
    });
  };

  flatOptions(props.data, props.groupItemSelectable);

  return result;
});

const internalFilterOption = computed(() => {
  const labelName = props.fieldNames?.label || "label";
  const keys =
    props.filterKeys.length > 0
      ? props.filterKeys
      : props.tableSearch
      ? props.columns?.map((el: any) => el.field) || [labelName]
      : [labelName];
  return (
    props.filterOption ||
    (props.filterType === "single"
      ? (inputValue: string, option: Option) =>
          filterOptions(inputValue, option, labelName)
      : (inputValue: string, option: Option) =>
          filterOptionsMultiKeywords(inputValue, option, keys))
  );
});

/**
 * 当前的选中keys
 */
const internalValue = ref<string[]>([]);
const selectedRowKeys = computed({
  get: () => props.value || internalValue.value,
  set: (keys: string[]) => {
    const defaultKeys = props.data
      .filter((el) => getSelected(el))
      .map((el) => getValue(el));
    internalValue.value = Array.from(new Set([...defaultKeys, ...keys]));
    emits("update:value", internalValue.value);
  },
});

watch(
  () => selectedRowKeys,
  (n) => {
    console.log("selectedRowKeys change", n.value);
  },
  { deep: true }
);

watch(
  () => dataMap,
  (n) => {
    console.log("dataMap change", n.value);
  },
  { deep: true }
);

const searchValue = ref("");
const replaceKeyword = (str: string, keyword: string) => {
  return props.highlight
    ? str.replace(keyword, `<span style="color: #D9363E">${keyword}</span>`)
    : str;
};

const gridApi = ref<any>(null);
const gridColumnApi = ref(null);
const onGridReady = (params: any) => {
  gridApi.value = params.api;
  gridColumnApi.value = params.columnApi;
};

const rowSelected = (
  type: string,
  oldKeys: string[] | null,
  value?: string,
  selected?: boolean
) => {
  nextTick(() => {
    let item: any,
      isSelect = true,
      key: string[];
    if (type === "table" && oldKeys) {
      const len = selectedRowKeys.value.length;
      isSelect = oldKeys.length < len;
      key = isSelect
        ? selectedRowKeys.value.filter((el) => !oldKeys.includes(el))
        : oldKeys.filter((el) => !selectedRowKeys.value.includes(el));
    } else {
      key = [value as string];
      isSelect = selected || false;
    }
    if (key.length === 1) {
      item = props.data.find((el) => key.includes(getValue(el)));
      emits("row-selected", {
        item,
        isSelect: (getSelected(item) && getDisabled(item)) || isSelect,
      });
    }
  });
};

/**
 * 表格中选中item
 * @param _selectedRowKeys
 * @param selectedRows
 */
const onSelectionChanged = (e: SelectionChangedEvent) => {
  const oldSelectedVal = JSON.parse(JSON.stringify(selectedRowKeys.value));
  const selectedRows: any[] = gridApi.value?.getSelectedRows();
  // 表格筛选时，得加上未显示但已勾选的数据
  const selectedRowKeysCache: string[] = selectedRowKeys.value.filter(
    (el) => !rowData.value.some((ele) => getValue(ele) === el)
  );
  let currentSelected: string[] = [];
  if (selectedRows) {
    currentSelected = selectedRows.map((row) => getValue(row));
  }
  // 重新获取 selectedRowKeys - 避免表格筛选时出现tag标签位置顺序不一致的问题
  selectedRowKeys.value = props.data
    .filter(
      (el) =>
        selectedRowKeysCache.includes(getValue(el)) ||
        currentSelected.includes(getValue(el))
    )
    .map((row) => getValue(row));

  // console.log("selectedRows: ", selectedRows);

  rowSelected("table", oldSelectedVal);
};

/**
 * 搜索框选中item
 * @param value
 */
const handleSearchItemSelect = (value: string) => {
  if (selectedRowKeys.value.includes(value)) {
    handleTagRemove(value);
  } else {
    selectedRowKeys.value = [...selectedRowKeys.value, value];
    rowSelected("search", null, value, true);
  }
};
const tableSearchVal = ref("");
const rowData = computed(() => {
  let showData = [];
  // 判断 是否为表格筛选，及表格筛选关键词是否为空
  if (!props.tableSearch || !tableSearchVal.value) {
    showData = props.data;
  } else {
    const val = tableSearchVal.value.toLowerCase();
    showData = props.data.filter((el) => internalFilterOption.value(val, el));
  }
  return props.maxShowNum ? showData.slice(0, props.maxShowNum) : showData;
});
const selectedCache = ref<any[]>([]);
const animationPause = ref(false);
const handleVisbleChange = (val: boolean) => {
  tableSearchVal.value = "";
  if (props.animation) {
    setTimeout(() => {
      animationPause.value = val;
    }, 600);
  }
  emits("visible", val);
  if (val) {
    selectedCache.value = JSON.parse(JSON.stringify(selectedRowKeys.value));
  } else {
    selectedCache.value = [];
  }
};

watch(
  [selectedRowKeys, gridApi, rowData],
  () => {
    nextTick(() => {
      gridApi.value?.forEachNode(function (node: any) {
        node.setSelected(selectedRowKeys.value.includes(getValue(node.data)));
      });
    });
  },
  {
    immediate: true,
  }
);

const handleTagRemove = (value: string) => {
  if (props.disabled) {
    return;
  }
  const oldKeys = [...selectedRowKeys.value];
  const index = oldKeys.indexOf(value);
  if (index !== -1) {
    oldKeys.splice(index, 1);
    selectedRowKeys.value = oldKeys;
    rowSelected("search", null, value, false);
  }
};

const getSelectedOptions = () => {
  return selectedRowKeys.value.map((key) => {
    const option = dataMap.value.get(key);
    return {
      value: getValue(option),
      label: getLabel(option),
      option: option,
    };
  });
};

const onCancel = () => {
  emits("update:value", selectedCache.value);
  visible.value = false;
};
const handleConfirm = () => {
  const currentSelected: any[] = props.data.filter((el) =>
    selectedRowKeys.value.includes(getValue(el))
  );
  emits("onConfirm", currentSelected);
  emits("update:value", selectedRowKeys.value);
  visible.value = false;
};

defineExpose({
  getSelectedOptions,
});
</script>

<style lang="less" scoped>
:global(._popover-classname .ant-popover-inner-content) {
  padding: 8px;
  width: var(--width);
  margin-top: 2px;
}

:deep(.ant-table) {
  border: 1px solid #f0f0f0;
}

.ant-dropdown-trigger {
  display: flex;
  flex-shrink: 0;
  //align-items: center;
  justify-content: center;
  margin-top: 6px;
  margin-bottom: 6px;
  line-height: 1;
  width: 18px;
  height: 18px;
  border-radius: 100%;
  border: 1px solid #096dd9;
  color: #096dd9;
  font-size: 14px;
  cursor: pointer;
}

.input-trigger {
  display: flex;
  align-items: center;
  min-height: 32px;
  border-radius: 2px;
  padding: 4px 7px;
  /* border: 1px solid rgba(0, 0, 0, 0.15); */
  border: 1px solid #e5e6eb;
}

.input-trigger--disabled {
  color: rgba(0, 0, 0, 0.25);
  background: #f5f5f5;
  cursor: not-allowed;
}

.suffixIcon {
  width: 16px;
  height: 16px;
  margin-right: 2px;
  margin-left: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.hidden-header {
  :deep(.ag-header) {
    display: none;
  }
}
</style>
<style lang="less">
.search-select {
  .ant-select-selection-search {
    height: 24px !important;
    line-height: 24px !important;
    input {
      text-align: center;
      height: 24px !important;
    }
  }
}
.ag-theme-alpine {
  .force-selected {
    .ag-cell-wrapper {
      .ag-selection-checkbox.ag-invisible {
        visibility: visible !important;
        .ag-checkbox-input-wrapper {
          cursor: not-allowed;
          &.ag-checked:after {
            color: #999;
          }
          .ag-checkbox-input {
            pointer-events: none;
          }
        }
      }
    }
  }
}
@keyframes slideUpIn {
  0% {
    transform: scaleY(0.8);
    transform-origin: 0% 0%;
    opacity: 0;
  }
  100% {
    transform: scaleY(1);
    transform-origin: 0% 0%;
    opacity: 1;
  }
}
</style>
