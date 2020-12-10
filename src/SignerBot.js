const { sleep } = require('./utils.js');

module.exports = class SignerBot {
  constructor () {
    this.ordersKeys = [];
  }

  async process () {
    for (;;) {
      const keys = await process.redis.getKeysAsync('order:*');

      for (let i = 0; i < keys.length; i++) {
        const order = JSON.parse(await process.redis.getValue(keys[i]));

        if (order.message !== 'OK') {
          break;
        }

        process.contracts.mooniswapOrders._address = order.mooniswapOrdersAddress;
        const orderTx = process.contracts.mooniswapOrders.methods.executeOrder(
          order.mooniswapPoolAddress,
          order.fromToken,
          order.toToken,
          order.fromAmount,
          order.minReturn,
          order.maxLoss,
          order.referral,
          order.expiry,
          order.salt,
          order.signature,
        );

        if (await this.canExecuteTx(orderTx)) {
          await this.executeTx(orderTx);
        }
      }

      await sleep(5000);
    }
  }

  async canExecuteTx (orderTx) {
    try {
      const gas = await process.walletManager.estimateGas(orderTx);

      if (gas instanceof Error) {
        return false;
      } else {
        return gas;
      }
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async executeTx (orderTx) {
    const tx = await process.walletManager.sendTx(
      orderTx,
      {
        gas: await process.walletManager.estimateGas(orderTx),
        gasPrice: await process.web3.eth.getGasPrice(),
      },
    );

    if (tx instanceof Error) {
      console.log(tx);
    }
  }
};
