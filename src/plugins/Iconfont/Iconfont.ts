import { createFromIconfontCN } from "@ant-design/icons-vue";
import { App } from "vue";

export const IconFont = createFromIconfontCN({
  scriptUrl: "//at.alicdn.com/t/font_3286101_aonl5vn6a3b.js",
});
export default function (app: App) {
  app.component("icon-font", IconFont);
}
