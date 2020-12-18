<template>
  <div class="container mt-5">
    <beat-loader
      class="text-center"
      :loading="isLoading"
      :color="'#428bca'"
      :size="50"
      :margin="'6px'"
    />
    <div v-if="!isLoading">
      <div class="row">
        <div class="col-sm-2" />

        <div class="col-sm-8">
          <div class="navbar-nav h1 text-center mt-2 mb-4">
            Order Detail
          </div>

          <dl class="row">
            <dt class="col-sm-3">Order Id: </dt>
            <dd class="col-sm-9">{{ order.orderId }}</dd>

            <dt class="col-sm-3">MooniswapPool: </dt>
            <dd class="col-sm-9">
              <a :href="`https://etherscan.io/address/${order.mooniswapPoolAddress}`" target="_blank">
                {{ order.mooniswapPoolAddress }}
              </a>
            </dd>

            <dt class="col-sm-3">From Token: </dt>
            <dd class="col-sm-9">
              <a :href="`https://etherscan.io/address/${order.fromToken}`" target="_blank">
                {{ order.fromTokenSymbol }}
              </a>
            </dd>

            <dt class="col-sm-3">To Token: </dt>
            <dd class="col-sm-9">
              <a :href="`https://etherscan.io/address/${order.toToken}`" target="_blank">
                {{ order.toTokenSymbol }}
              </a>
            </dd>

            <dt class="col-sm-3">From Amount: </dt>
            <dd class="col-sm-9">{{ order.fromAmount | toFormatPrice }}</dd>

            <dt class="col-sm-3">Min Return: </dt>
            <dd class="col-sm-9">{{ order.minReturn | toFormatPrice }}</dd>

            <dt class="col-sm-3">Max Loss: </dt>
            <dd class="col-sm-9">{{ order.maxLoss | toFormatPrice }}</dd>

            <dt class="col-sm-3">Referral: </dt>
            <dd class="col-sm-9">
              <a :href="`https://etherscan.io/address/${order.referral}`" target="_blank">
                {{ order.referral }}
              </a>
            </dd>

            <dt class="col-sm-3">Expiry: </dt>
            <dd class="col-sm-9">{{ order.expiry | toDate }}</dd>

            <dt class="col-sm-3">Salt: </dt>
            <dd class="col-sm-9">{{ order.salt }}</dd>

            <dt class="col-sm-3">Signature: </dt>
            <dd class="col-sm-9">{{ order.signature | shortBytes(32) }}</dd>
          </dl>
        </div>

        <div class="col-sm-2" />
      </div>
    </div>
  </div>
</template>

<script>
import api from "@/utils/api";

export default {
  name: "OrderDetail",

  data() {
    return {
      isLoading: false,
      order: {}
    };
  },

  created() {
    this.getOrder();
  },

  methods: {
    getOrder() {
      this.isLoading = true;
      const sig = this.$route.params.sig;
      api
        .getOrder(sig)
        .then(o => (this.order = o))
        .finally(() => (this.isLoading = false));
    }
  }
};
</script>
