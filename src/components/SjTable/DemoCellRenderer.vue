<template>
  <a-space>
    <a-button type="link">修改密码</a-button>
    <a-button type="link">编辑</a-button>
    <a-button type="link" :disabled="isLeft">离职</a-button>
  </a-space>
</template>

<script setup lang="ts">
import { ICellRendererParams } from "ag-grid-community";

const props = defineProps<{
  params: ICellRendererParams;
}>();

const isLeft = props.params.value % 2 === 0;
</script>

<style scoped></style>
