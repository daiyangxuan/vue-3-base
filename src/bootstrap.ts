// import App from './App.vue'
// import {createApp} from 'vue'
//
// createApp(App).mount('#emp-root')
import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import Antd from './plugins/Antd/Antd'
import Iconfont from './plugins/Iconfont/Iconfont'
import "./assets/style/index.less";
import { createPinia } from "pinia";

createApp(App).use(createPinia()).use(Iconfont).use(Antd).use(router).mount('#emp-root')
