<script lang="tsx">
import { defineComponent, h, PropType, ref, watch, toRaw } from "vue";
import { MenuInfo } from "./types";

export default defineComponent({
  props: {
    menu: {
      type: Array as PropType<Array<MenuInfo>>,
      default: () => [],
    },
    selectedKeys: {
      type: Array as PropType<Array<string | undefined>>,
      required: false,
    },
  },
  emits: ["update:selectedKeys"],
  setup(props, context) {
    return () => {
      const getMenuList = (menu: Array<MenuInfo>) => {
        return menu.map((menuInfo) => {
          switch (menuInfo.type) {
            case "menu-item":
              return (
                <a-menu-item
                  key={menuInfo.id}
                  v-slots={{
                    default: () => (
                      <router-link to={menuInfo.fullPath}>
                        {menuInfo.title}
                      </router-link>
                    ),
                    icon: () => h(menuInfo.icon!),
                  }}
                />
              );
            case "menu-group":
              return (
                <a-menu-item-group
                  key={menuInfo.id}
                  v-slots={{
                    default: () => getMenuList(menuInfo.children),
                    title: () => menuInfo.title,
                  }}
                />
              );
            case "sub-menu":
              return (
                <a-sub-menu
                  key={menuInfo.id}
                  v-slots={{
                    default: () => getMenuList(menuInfo.children),
                    title: () => menuInfo.title,
                    icon: () => h(menuInfo.icon),
                  }}
                />
              );
          }
        });
      };
      return (
        <div class="nav-menu">
          <a-menu
            theme="dark"
            mode="vertical"
            selectable={true}
            selectedKeys={props.selectedKeys}
            onUpdate:selectedKeys={(keys: string[]) => {
              // console.log(keys);
              // selectKeys.value = keys;
              context.emit("update:selectedKeys", keys);
            }}
          >
            {getMenuList(props.menu)}
          </a-menu>
        </div>
      );
    };
  },
});
</script>
<!--<style lang="less">-->
<!--.menu-item() {-->
<!--  padding: 0 16px !important;-->
<!--  opacity: 0.8;-->
<!--  &:hover {-->
<!--    background: #3f495c !important;-->
<!--    opacity: 0.96;-->
<!--    backdrop-filter: blur(15px);-->
<!--    &:after {-->
<!--      width: 3px;-->
<!--      background: #0091ff;-->
<!--      transform: none !important;-->
<!--      opacity: 0.96 !important;-->
<!--      backdrop-filter: blur(15px);-->
<!--      opacity: 0 !important;-->
<!--    }-->
<!--  }-->

<!--  transition: background 0s !important;-->
<!--  font-weight: 500;-->
<!--}-->

<!--.ant-menu-item,-->
<!--.ant-menu-submenu-title {-->
<!--  .menu-item();-->
<!--}-->
<!--& .ant-menu-item-group-list,-->
<!--& .ant-menu-sub {-->
<!--  display: flex;-->
<!--  width: 384px;-->
<!--  flex-flow: wrap;-->
<!--  padding: 8px 16px !important;-->
<!--  & .ant-menu-item {-->
<!--    width: 160px;-->
<!--    margin-right: 16px;-->
<!--    margin-bottom: 8px;-->
<!--  }-->
<!--}-->
<!--</style>-->
