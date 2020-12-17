<template>
  <div class="table-responsive">
    <table class="table table-striped text-center">
      <thead>
        <tr class="text-primary">
          <th scope="col">Order Id</th>
          <th scope="col">MooniswapPool</th>
          <th scope="col">From</th>
          <th scope="col">To</th>
          <th scope="col">From Amount</th>
          <th scope="col">Min Return</th>
          <th scope="col">Max Loss</th>
          <th scope="col">Referral</th>
          <th scope="col">Expiry</th>
          <th scope="col">Salt</th>
          <th scope="col">Signature</th>
          <th scope="col">Tx Hash</th>
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
            <a :href="`https://etherscan.io/address/${o.mooniswapPoolAddress}`" target="_blank">{{
              o.mooniswapPoolAddress | shortBytes
            }}</a>
          </td>
          <td>
            <a :href="`https://etherscan.io/address/${o.fromToken}`" target="_blank">{{
              o.fromTokenSymbol
            }}</a>
          </td>
          <td>
            <a :href="`https://etherscan.io/address/${o.toToken}`" target="_blank">{{
              o.toTokenSymbol
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

          <td v-if="o.message.length === 66">
            <a :href="`https://etherscan.io/address/${o.message}`" target="_blank">{{
              o.message | shortBytes
            }}</a>
          </td>
          <td v-else>{{ o.message }}</td>

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
