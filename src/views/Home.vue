<template>
  <SjBasicLayout :menu="menu" />
</template>
<script lang="ts" setup>
import SjBasicLayout from '../components/SjBasicLayout/SjBasicLayout.vue'
import {reactive} from 'vue'
import {DesktopOutlined, PieChartOutlined} from '@ant-design/icons-vue'
import {MenuInfo} from '../components/SjBasicLayout/SjSider/types'

const menu = reactive<Array<MenuInfo>>([
  {
    title: 'About',
    icon: PieChartOutlined,
    type: 'menu-item',
    id: 'about',
    fullPath: '/about',
  },
  {
    title: 'About1',
    icon: DesktopOutlined,
    id: 'about1',
    type: 'menu-item',
    fullPath: '/about1',
  },
  {
    title: 'About2',
    icon: DesktopOutlined,
    id: 'about2',
    type: 'menu-item',
    fullPath: '/about2',
  },
  {
    title: 'Test',
    icon: DesktopOutlined,
    id: 'test',
    type: 'sub-menu',
    children: [
      {
        title: 'group1',
        id: 'group1',
        type: 'menu-group',
        children: [
          {
            title: 'Test1',
            icon: DesktopOutlined,
            id: 'test1',
            type: 'menu-item',
            fullPath: '/test/1',
          },
          {
            title: 'Test2',
            icon: DesktopOutlined,
            id: 'test2',
            type: 'menu-item',
            fullPath: '/test/2',
          },
        ],
      },
      {
        title: 'group2',
        id: 'group2',
        type: 'menu-group',
        children: [
          {
            title: 'Test3',
            icon: DesktopOutlined,
            id: 'test3',
            type: 'menu-item',
            fullPath: '/test/3',
          },
          {
            title: 'Test4',
            icon: DesktopOutlined,
            id: 'test4',
            type: 'menu-item',
            fullPath: '/test/4',
          },
        ],
      },
    ],
  },
])
</script>
<style lang="less"></style>
