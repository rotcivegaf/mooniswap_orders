<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-sm-2" />

      <div class="col-sm-8">
        <form class="review-form" @submit.prevent="onSubmit">
          <div class="navbar-nav h1 text-center mb-3">
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
                :id="i.items"
                :type="i.type"
                v-model="i.value"
                @change="onInputChange($event, i)"
              />
            </div>
          </div>
          <div class="form-group row">
            <div class="col-sm-10">
              <standard-button class="mt-3" type="submit" :title="buttonName" />
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
      optionSelected: "Sign Order and Provide",
      options: ["Sign Order and Provide", "Provide an Order"],
      buttonName: "Sign & Provide",
      inputs: {
        mooniswapOrdersAddress: { type: "address", text: "MooniswapOrders", valid: null },
        mooniswapPoolAddress: { type: "address", text: "MooniswapPool", valid: null },
        fromToken: { type: "address", text: "From Token", valid: null },
        toToken: { type: "address", text: "To Token", valid: null },
        fromAmount: { type: "hex32", text: "From Amount", valid: null },
        minReturn: { type: "hex32", text: "Min Return", valid: null },
        maxLoss: { type: "hex32", text: "Max Loss", valid: null },
        referral: { type: "address", text: "Referral", valid: null },
        expiry: { type: "hex32", text: "Expiry", valid: null },
        salt: { type: "hex32", text: "Salt", valid: null }
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
        case "hex32":
          // TODO check expiry and fee
          input.valid = true;
          break;
      }

      if (!input.valid) {
        window.alert("Invalid data");
      }
    },

    onSelect(event) {
      Object.keys(this.inputs).forEach(i => (this.inputs[i].show = true));
      this.optionSelected = event.target.value;

      this.inputs.sig.show = false;
      this.buttonName = "Sign & Provide";
    },

    async onSubmit() {
      const args = {};
      try {
        args.mooniswapOrdersAddress = this.inputs.mooniswapOrdersAddress.value;
        args.mooniswapPoolAddress = this.inputs.mooniswapPoolAddress.value;
        args.fromToken = this.inputs.fromToken.value;
        args.toToken = this.inputs.toToken.value;
        args.fromAmount = this.inputs.fromAmount.value;
        args.minReturn = this.inputs.minReturn.value;
        args.maxLoss = this.inputs.maxLoss.value;
        args.referral = this.inputs.referral.value;
        args.expiry = this.inputs.expiry.value;
        args.salt = this.inputs.salt.value;

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

      args.signature = await this.web3.eth.sign(args.orderId, this.user);

      args.owner = this.web3.eth.accounts.recover({
        messageHash: args.orderId,
        r: '0x' + args.signature.substring(2).substring(0, 64),
        s: '0x' + args.signature.substring(2).substring(64, 128),
        signature: args.signature,
        v: '0x' + args.signature.substring(2).substring(128, 130)
      });

      if (args.owner === this.user) {
        await api.saveOrder(args);
      } else {
        window.alert("Ownership error");
      }
    }
  }
};
</script>
