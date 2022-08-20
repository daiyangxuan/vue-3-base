import { App } from "vue";
import Antd from "ant-design-vue";
import "./antd-theme.less";

export default function (app: App) {
  app.use(Antd);
}
