<template>
  <div class="container-fluid mt-5">
    <div class="row">

      <div class="col-sm-12 text-center">
      <beat-loader
        :loading="isLoading"
        :color="'#428bca'"
        :size="50"
        :margin="'6px'"
      />
        <order-table v-if="!isLoading" :orders="orders" />
      </div>
    </div>
  </div>
</template>

<script>
import OrderTable from "@/components/OrderTable";
import api from "@/utils/api";

export default {
  name: "Home",

  components: { OrderTable },

  data() {
    return {
      isLoading: false,
      orders: []
    };
  },

  created() {
    this.isLoading = true;
    api
      .getOrders()
      .then(o => (this.orders = o))
      .finally(() => (this.isLoading = false));
  }
};
</script>
