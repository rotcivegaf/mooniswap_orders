<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-sm-1" />

      <div class="col-sm-10 text-center">
      <beat-loader
        :loading="isLoading"
        :color="'#428bca'"
        :size="50"
        :margin="'6px'"
      />
        <order-table v-if="!isLoading" :orders="orders" />
      </div>

      <div class="col-sm-1" />
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
