<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-sm-2" />

      <div class="col-sm-8">
        <form class="review-form" @submit.prevent="onSubmit">
          <div class="navbar-nav h1 text-center mb-4">
            Sign Order and Provide
          </div>
          <div
            class="form-group row"
            v-for="(i, index) in inputs"
            :key="index"
          >
            <label for="inputEmail3" class="col-sm-3 col-form-label">{{ i.text }}</label>
            <div class="col-sm-9">
              <input
                :class="
                  i.valid == null
                    ? 'form-control'
                    : i.valid
                    ? 'form-control text-success'
                    : 'form-control text-danger'
                "
                : ="i.items"
                :type="i.type"
                v-model="i.value"
                @change="onInputChange($event, i)"
              />
            </div>
          </div>
          <div class="form-group row">
            <div class="col-sm-10">
              <standard-button class="mt-3" type="submit" title="Sign & Provide" />
            </div>
          </div>
        </form>
      </div>

      <div class="col-sm-2" />
    </div>
  </div>
</template>

<script>
import web3Manager from "@/utils/web3Manager.js";
import api from "@/utils/api";
import StandardButton from "@/components/StandardButton";

export default {
  name: "ProvideOrder",

  components: { StandardButton },

  data() {
    return {
      web3: undefined,
      user: undefined,
      inputs: {
        fromToken:  { type: "address", text: "From Token",  valid: null, value: "0xc778417E063141139Fce010982780140Aa0cD5Ab" }, // WETH
        toToken:    { type: "address", text: "To Token",    valid: null, value: "0x99c1C36DEe5C3B62723DC4223F4352bBf1Da0BfF" }, // USDC
        fromAmount: { type: "number",  text: "From Amount", valid: null, value: "1" },
        minReturn:  { type: "number",  text: "Min Return",  valid: null, value: "1" },
        maxLoss:    { type: "number",  text: "Max Loss",    valid: null, value: "1" },
        referral:   { type: "address", text: "Referral",    valid: null, value: "0x225bEA75d0B4c0686597097d28d81DB86b42ee78" },
        expiry:     { type: "number",  text: "Expiry",      valid: null, value: "1610074847" },
        salt:       { type: "hex32",   text: "Salt",        valid: null, value: "0x225bEA1275d0B4c0686597097d28d81DB86b42ee781234567891234567891234" }
      }
    };
  },

  async created() {
    this.web3 = await web3Manager.instanceWeb3();
    this.user = await web3Manager.getUser(this.web3);
  },

  methods: {
    onInputChange(event, input) {
      if (event.target.value === "") {
        input.valid = null;
        return;
      }

      switch (input.type) {
        case "signature":
          input.valid =
            event.target.value.length === 132 &&
            this.web3.utils.isHexStrict(event.target.value);
          break;
        case "address":
          try {
            event.target.value = this.web3.utils.toChecksumAddress(
              event.target.value
            );
            input.valid = true;
          } catch (error) {
            input.valid = false;
          }
          break;
        case "number":
          try {
            input.valid = this.web3.utils.isBN(this.web3.utils.toBN(event.target.value));
          } catch (error) {
            input.valid = false;
          }
          break;
        case "hex32":
          input.valid = event.target.value.length === 66 && this.web3.utils.isHexStrict(event.target.value)
          break;
      }

      if (!input.valid) {
        window.alert("Invalid data");
      }
    },

    async onSubmit() {
      const args = {
        mooniswapOrdersAddress: web3Manager.mooniswapOrdersAddress,
        fromToken: this.inputs.fromToken.value,
        toToken: this.inputs.toToken.value,
        fromAmount: this.inputs.fromAmount.value,
        minReturn: this.inputs.minReturn.value,
        maxLoss: this.inputs.maxLoss.value,
        referral: this.inputs.referral.value,
        expiry: this.inputs.expiry.value,
        salt: this.inputs.salt.value,
      }
      args.mooniswapPoolAddress = await web3Manager.getPool(this.web3, args.fromToken, args.toToken);

      try {
        args.orderId = this.web3.utils.soliditySha3(
          { t: "address", v: args.mooniswapOrdersAddress },
          { t: "address", v: args.mooniswapPoolAddress },
          { t: "address", v: args.fromToken },
          { t: "address", v: args.toToken },
          { t: "uint256", v: args.fromAmount },
          { t: "uint256", v: args.minReturn },
          { t: "uint256", v: args.maxLoss },
          { t: "address", v: args.referral },
          { t: "uint256", v: args.expiry },
          { t: "bytes32", v: args.salt },
        );
      } catch (error) {
        window.alert("Invalid data");
      }

      args.signature = await this.web3.eth.personal.sign(args.orderId, this.user)

      args.owner = await this.web3.eth.personal.ecRecover(args.orderId, args.signature);
      args.owner = this.web3.utils.toChecksumAddress(args.owner)

      if (args.owner === this.user) {
        await api.saveOrder(args);
      } else {
        window.alert("Ownership error");
      }
    }
  }
};
</script>
