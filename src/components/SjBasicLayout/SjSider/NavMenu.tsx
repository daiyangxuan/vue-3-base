import { defineComponent, h, PropType, ref, watch, toRaw } from "vue";
import { MenuInfo } from "./types";
import "./styles.module.less";

export default defineComponent({
  name: "NavMenu",
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
        <div>
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
