<template>
  <a-select
    :id="dynamicId"
    ref="selectRef"
    allow-clear
    :value="value.name"
    :style="`width: ${width}px`"
    show-search
    :size="size"
    :dropdown-match-select-width="false"
    :dropdown-style="{
      'min-height': '50px',
      padding: '8px',
      overflow: tooltip ? 'visible' : 'hidden',
    }"
    :get-popup-container="getPopupContainer"
    @search="handleSearch"
    @change="$emit('change')"
  >
    <template #dropdownRender>
      <a-spin :spinning="loading">
        <div
          :style="{ width: `${tableW}px`, height: `${tableH}px` }"
          @mousedown="(e) => e.preventDefault()"
        >
          <SjTable
            ref="sjTableRef"
            :column-defs="columnsDefs"
            :row-data="showData"
            style="width: 100%; height: 100%"
            :default-col-def="defaultColDef"
            :row-height="30"
            :header-height="30"
            row-selection="single"
            :row-multi-select-with-click="true"
            :suppress-row-deselection="false"
            :suppress-cell-focus="true"
            :class="tooltip ? 'tooltip-table' : ''"
            overlay-no-rows-template="<div class='null-data'><div class='null-search-img'></div><p>暂无数据</p></div>"
            @selectionChanged="handleSelectionChange"
            @grid-ready="onGridReady"
          ></SjTable>
          <!-- <a-table
          class="select-table"
          :columns="columns"
          :loading="loading"
          :data-source="dataSource"
          size="small"
          :scroll="{ y: tableH }"
          :pagination="false"
          :bordered="false"
          :custom-row="handleCustomRow"
          :row-height="40"
        >
          <template #bodyCell="{ text }">{{ text || "-" }} </template>
          <template #emptyText>
            <div class="notFoundContent">
              <img src="@/assets/images/nullSearch.png" alt="未搜索到结果" />
              <p>未搜索到结果</p>
            </div>
          </template>
        </a-table> -->
        </div>
      </a-spin>
    </template>
  </a-select>
</template>
<script lang="ts">
import {
  defineComponent,
  watch,
  ref,
  onDeactivated,
  onMounted,
  computed,
} from "vue";
import SjTable from "./SjTable/SjTable.vue";
import {
  CellClickedEvent,
  GridApi,
  SelectionChangedEvent,
} from "ag-grid-community";
import { showTooltip } from "./SjTable/customTooltip";

export default defineComponent({
  name: "SjSelectForTable",
  components: {
    SjTable,
  },
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
    columns: {
      type: Array,
      default: () => [],
    },
    dataSource: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: "small",
    },
    width: {
      type: Number,
      default: 200,
    },
    tableW: {
      type: Number,
      default: 420,
    },
    tableH: {
      type: Number,
      default: 300,
    },
    highlight: {
      type: Boolean,
      default: false,
    },
    valueKey: {
      type: String,
      default: "id",
    },
    getPopupContainer: {
      type: Function,
      default: () => document.body,
    },
    maxLength: {
      type: String,
      default: "255",
    },
    maxShowNum: {
      type: Number,
      default: 0,
    },
    tooltip: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["change", "search"],
  setup(props, { emit }) {
    const dynamicId = ref("sj-select-table-" + new Date().valueOf());
    const selectRef = ref();
    const sjTableRef = ref();
    const gridApi = ref<GridApi>();
    const showData = computed(() => {
      return props.maxShowNum
        ? props.dataSource.slice(0, props.maxShowNum)
        : props.dataSource;
    });
    const onGridReady = (params: any) => {
      gridApi.value = params.api;
    };
    const addItem = (e = {}) => {
      emit("change", e);
    };
    const columnsDefs = computed(() => {
      return props.columns.map((el: any) => ({
        ...el,
        ...(props.tooltip
          ? showTooltip(el.field, {
              useFormatted: typeof el.valueFormatter === "function",
            })
          : {}),
      }));
    });

    const handleCustomRow = (record: any) => {
      // record RowItem
      return {
        rowClassName:
          props.highlight &&
          record[props.valueKey] === props.value?.[props.valueKey]
            ? "active-row"
            : "",
        onClick: () => {
          addItem(record);
        },
      };
    };

    const handleSearch = (e: string) => {
      emit("search", e);
    };

    const handleSelectionChange = (e: SelectionChangedEvent) => {
      if (e.type === "selectionChanged") {
        const rows = e.api.getSelectedRows();
        console.log("handleSelectionChange", rows);
        addItem(rows[0]);
      }
      // selectRef.value.blur();
    };
    watch(
      [() => props.value, gridApi],
      () => {
        gridApi.value?.forEachNode(function (node: any) {
          node.setSelected(
            node.data[props.valueKey] === props.value[props.valueKey]
          );
        });
      },
      {
        immediate: true,
      }
    );
    const handleClick = (e: CellClickedEvent) => {
      selectRef.value.blur();
    };

    onDeactivated(() => {
      console.log("onDeactivated", selectRef.value);
      selectRef.value.blur();
    });
    onMounted(() => {
      setTimeout(() => {
        setSelectMaxLengthById(dynamicId.value, props.maxLength);
      }, 100);
    });
    const setSelectMaxLengthById = (id = "", maxLength = "50") => {
      const selectEle = document.getElementById(id);
      selectEle?.setAttribute("maxLength", maxLength);
    };
    return {
      columnsDefs,
      dynamicId,
      selectRef,
      sjTableRef,
      showData,
      addItem,
      handleSearch,
      handleCustomRow,
      handleSelectionChange,
      onGridReady,
      defaultColDef: {
        resizable: false,
        sortable: false,
        filter: false,
        unSortIcon: true,
        menuTabs: [],
        onCellClicked: handleClick,
      },
    };
  },
});
</script>
<style lang="less" scoped>
.select-table {
  :deep(.ant-table) {
    border: 1px solid #e5e6eb;
    color: #221e1f;
    .notFoundContent {
      height: 242px;
      text-align: center;
      & img {
        margin-top: 71px;
        width: 114px;
        height: 70px;
      }
      & p {
        font-size: 14px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.25);
        line-height: 22px;
      }
    }
    &-thead {
      & > tr > th {
        background: #f6f7f9;
        border-color: #e5e6eb;
      }
    }
    &-row {
      cursor: pointer;
      border-color: #e5e6eb;

      &:nth-child(odd) {
        background: #f6f7f9;
      }
    }
    &.ant-table-small .ant-table-title,
    &.ant-table-small .ant-table-footer,
    &.ant-table-small .ant-table-thead > tr > th,
    &.ant-table-small .ant-table-tbody > tr > td,
    &.ant-table-small tfoot > tr > th,
    &.ant-table-small tfoot > tr > td {
      min-height: 30px;
      padding: 5px 8px;
    }
  }
}
</style>
