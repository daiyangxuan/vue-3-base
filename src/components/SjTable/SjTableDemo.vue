<template>
  <SjTable
    :columnDefs="columnDefs"
    :rowData="rowData"
    style="width: 100%; height: 500px"
  />
</template>

<script setup lang="tsx">
import SjTable from "./SjTable.vue";
import { ColDef, ColGroupDef } from "ag-grid-community";
import DemoCellRenderer from "./DemoCellRenderer.vue";

const columnDefs: (ColDef | ColGroupDef)[] = [
  {
    headerName: "机构",
    field: "institution",
    minWidth: 100,
    flex: 100,
    pinned: "left",
  },
  { headerName: "用户名", field: "username", minWidth: 100, flex: 100 },
  { headerName: "部门", field: "department", minWidth: 100, flex: 100 },
  {
    headerName: "岗位",
    field: "position",
    minWidth: 100,
    flex: 100,
    filter: "agTextColumnFilter",
  },
  {
    headerName: "日期",
    field: "date",
    minWidth: 100,
    flex: 100,
    filter: "agDateColumnFilter",
    valueFormatter: (params) => {
      return params.value.toLocaleTimeString();
    },
  },
  {
    headerName: "数字",
    field: "number",
    width: 150,
    type: ["numberColumn"],
  },
  {
    headerName: "手机号",
    field: "mobile",
    width: 150,
    type: ["centerAligned"],
  },
  {
    headerName: "操作",
    field: "operation",
    minWidth: 300,
    flex: 200,
    cellRenderer: DemoCellRenderer,
    pinned: "right",
    type: ["centerAligned"],
  },
];
const rowData = Array.from(
  {
    length: 100,
  },
  (d, i) => {
    return {
      institution: `机构${i}`,
      username: `用户名${i}`,
      department: `部门${i}`,
      position: `岗位${i}`,
      date: new Date(i * 100000),
      number: i,
      mobile: `18321783963`,
      operation: i,
    };
  }
);
</script>

<style scoped></style>
