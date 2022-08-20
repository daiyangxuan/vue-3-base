<template>
  <ag-grid-vue v-bind="defaultGridProperties" class="ag-theme-alpine" />
</template>

<script setup lang="ts">
import { LicenseManager } from "ag-grid-enterprise";
import { AgGridVue } from "ag-grid-vue3";
import { GridOptions } from "ag-grid-community";
import { useAttrs } from "vue";
import localeText from "./local.zh-cn";

LicenseManager.setLicenseKey(
  "[NDEwNDg5OTkwNzEwNw==]d7c4e74736794991c98e04aaa14bedec"
);
const defaultColDef: GridOptions["defaultColDef"] = {
  resizable: true,
  sortable: true,
  filter: true,
  unSortIcon: true,
  menuTabs: ["filterMenuTab", "generalMenuTab"],
};
const columnTypes: GridOptions["columnTypes"] = {
  numberColumn: {
    filter: "agNumberColumnFilter",
  },
  centerAligned: {
    headerClass: "ag-center-aligned-header",
    cellClass: "ag-center-aligned-cell",
  },
};
const attrs = useAttrs();
const defaultGridProperties: GridOptions = {
  enableCellTextSelection: true,
  suppressCellFocus: true,
  suppressContextMenu: true,
  suppressMenuHide: true,
  localeText,
  maintainColumnOrder: true,
  defaultColDef,
  columnTypes,
  ...attrs,
};
</script>

<style lang="scss">
@import "~ag-grid-community/src/styles/ag-grid.scss";
@import "~ag-grid-community/src/styles/ag-theme-alpine/sass/ag-theme-alpine-mixin.scss";

.ag-theme-alpine {
  $font-size: 12px;
  @include ag-theme-alpine(
    (
      // Background colour for all headers, including the grid header, panels etc
      header-background-color: #f5f7fa,
      odd-row-background-color: #f5f7fa,
      border-color: #e5e6eb,
      row-height: ag-derived(grid-size, $times: 6),
      header-height: ag-derived(grid-size, $times: 6),
      font-size: $font-size,
      header-column-resize-handle-color: #d9d9d9,
      header-column-resize-handle-height: 16px
    )
  );

  .ag-row {
    z-index: 1;
    font-size: $font-size;
  }

  @mixin remove-border {
    border-right: none;
    position: relative;
    z-index: 2;
  }

  @mixin left-shadow-border {
    @include remove-border;
    box-shadow: inset -1px 0 0px 0px rgb(140 140 140 / 25%),
      1px 0 3px 0 rgb(140 140 140 / 25%);
  }

  @mixin right-shadow-border {
    @include remove-border;
    box-shadow: -2px 0 3px 0 #d9d9d9;
  }

  .ag-pinned-left-header {
    @include left-shadow-border;
  }

  .ag-pinned-right-header {
    @include right-shadow-border;
  }

  .ag-cell.ag-cell-last-left-pinned:not(.ag-cell-range-right):not(.ag-cell-range-single-cell) {
    @include left-shadow-border;
  }

  .ag-cell.ag-cell-first-right-pinned:not(.ag-cell-range-left):not(.ag-cell-range-single-cell) {
    @include right-shadow-border;
  }

  .ag-center-aligned-header {
    .ag-header-cell-label {
      justify-content: center;
    }
  }

  .ag-center-aligned-cell {
    .ag-cell-wrapper {
      justify-content: center;
    }
  }
}
</style>
