import Vue from "vue";
import App from "./App.vue";
import { VueSpinners } from "@saeris/vue-spinners";

import router from "@/router";
import filters from "@/utils/filters";

import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

Vue.use(VueSpinners);

Vue.filter("shortBytes", filters.toShortBytes);
Vue.filter("basePorcent", filters.toBasePorcent);
Vue.filter("toFormatId", filters.toFormatId);
Vue.filter("toFormatPrice", filters.toFormatPrice);
Vue.filter("toDate", filters.toDate);

Vue.config.productionTip = false;

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
