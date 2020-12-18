import Vue from "vue";
import Router from "vue-router";
import Home from "@/views/Home";
import About from "@/views/About";
import OrderDetail from "@/views/OrderDetail";
import ProvideOrder from "@/views/ProvideOrder";
import Error from "@/views/Error";

Vue.use(Router);

export default new Router({
  mode: "history",

  routes: [
    {
      path: "/",
      name: "Home",
      component: Home
    },
    {
      path: "/mooniswap_orders",
      name: "mooniswap_orders",
      component: Home
    },
    {
      path: "/about",
      name: "About",
      component: About
    },
    {
      path: "/order-detail/:sig",
      name: "OrderDetail",
      component: OrderDetail
    },
    {
      path: "/provide-order",
      name: "ProvideOrder",
      component: ProvideOrder
    },
    {
      path: "*",
      name: "Error",
      component: Error
    }
  ]
});
