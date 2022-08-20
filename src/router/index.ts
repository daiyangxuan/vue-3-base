import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/Home.vue";
import About from "../views/About.vue";
import View404 from "../views/404.vue";
import Test from "../views/Test.vue";
import createAsyncRouterView from "../components/SjBasicLayout/createAsyncRouterView";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/home",
    name: "home",
    component: HomeView,
    children: [
      {
        path: "/about",
        name: "about",
        component: About,
      },
      {
        path: "/about1",
        name: "about1",
        // component: About1View,
        component: Test,
      },
    ],
  },

  {
    path: "/:pathMatch(.*)*",
    component: View404,
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
