<template>
  <div class="table-responsive">
    <table class="table table-striped text-center">
      <thead>
        <tr class="text-primary">
          <th scope="col">Order Id</th>
          <th scope="col">MooniswapOrders</th>
          <th scope="col">MooniswapPool</th>
          <th scope="col">From Token</th>
          <th scope="col">To Token</th>
          <th scope="col">From Amount</th>
          <th scope="col">Min Return</th>
          <th scope="col">Max Loss</th>
          <th scope="col">Referral</th>
          <th scope="col">Expiry</th>
          <th scope="col">Salt</th>
          <th scope="col">Signature</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="o in orders" :key="o.orderId" class="text-primary">
          <td>
            <router-link :to="{ name: 'OrderDetail', params: { sig: o.orderId } }">{{
              o.orderId | shortBytes
            }}</router-link>
          </td>
          <td>
            <a :href="`https://etherscan.io/address/${o.mooniswapOrdersAddress}`" target="_blank">{{
              o.mooniswapOrdersAddress | shortBytes
            }}</a>
          </td>
          <td>
            <a :href="`https://etherscan.io/address/${o.mooniswapPoolAddress}`" target="_blank">{{
              o.mooniswapPoolAddress | shortBytes
            }}</a>
          </td>
          <td>
            <a :href="`https://etherscan.io/address/${o.fromToken}`" target="_blank">{{
              o.fromToken | shortBytes
            }}</a>
          </td>
          <td>
            <a :href="`https://etherscan.io/address/${o.toToken}`" target="_blank">{{
              o.toToken | shortBytes
            }}</a>
          </td>
          <td>{{ o.fromAmount | toFormatPrice }}</td>
          <td>{{ o.minReturn | toFormatPrice }}</td>
          <td>{{ o.maxLoss | toFormatPrice }}</td>
          <td>
            <a :href="`https://etherscan.io/address/${o.referral}`" target="_blank">{{
              o.referral | shortBytes
            }}</a>
          </td>
          <td>{{ o.expiry | toDate }}</td>
          <td>{{ o.salt | shortBytes }}</td>
          <td>{{ o.signature | shortBytes }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

export default {
  name: "OrderTable",

  props: {
    orders: {
      type: Array,
      default: () => []
    }
  }
};
</script>
