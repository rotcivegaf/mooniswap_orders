// Api
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');
const checkOrder = require('./checkOrder.js');

const PORT = process.env.PORT || 5000;

module.exports = async () => {
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(cors());

  app.listen(PORT, () => console.info(`Listening on ${PORT}`));

  app.get('/order/:order', async (req, res) => res.json(
    await process.redis.getValue(['order', req.params.order]),
  ));

  app.get('/orders', async (_, res) => res.json(
    await process.redis.getValues('order:*'),
  ));

  app.post('/addOrder', async (req, res) => {
    const order = req.body;

    order.message = await checkOrder.checkNewOrder(order);
    if (order.message !== 'OK') {
      res.status(201).send(order.message);
    }

    try {
      order.orderId = process.web3.utils.soliditySha3(
        { t: 'address', v: order.mooniswapOrdersAddress },
        { t: 'address', v: order.mooniswapPoolAddress },
        { t: 'address', v: order.fromToken },
        { t: 'address', v: order.toToken },
        { t: 'uint256', v: order.fromAmount },
        { t: 'uint256', v: order.minReturn },
        { t: 'uint256', v: order.maxLoss },
        { t: 'address', v: order.referral },
        { t: 'uint256', v: order.expiry },
        { t: 'bytes32', v: order.salt },
      );

      order.owner = process.web3.eth.accounts.recover({
        messageHash: order.orderId,
        r: '0x' + order.signature.substring(2).substring(0, 64),
        s: '0x' + order.signature.substring(2).substring(64, 128),
        signature: order.signature,
        v: '0x' + order.signature.substring(2).substring(128, 130),
      });
    } catch (e) {
      console.log(e);
      res.status(201).send(e.message);
      return;
    }

    const key = ['order', order.orderId].join(':');

    if (await process.redis.getValue(key)) {
      res.status(200).send('The order exists');
      return;
    }

    try {
      process.contracts.erc20._address = order.fromToken;
      order.fromTokenSymbol = await process.contracts.erc20.methods.symbol().call();
    } catch (e) {
      console.log(e);
      res.status(201).send(e.message);
      return;
    }

    try {
      process.contracts.erc20._address = order.toToken;
      order.toTokenSymbol = await process.contracts.erc20.methods.symbol().call();
    } catch (e) {
      console.log(e);
      res.status(201).send(e.message);
      return;
    }

    await process.redis.setAsync(key, JSON.stringify(order));
    res.status(200).send(order);
  });

  // Remove, only for tests
  app.get('/deleteAll', async (_, res) => res.json(
    await process.redis.clearAllData(),
  ));
};
