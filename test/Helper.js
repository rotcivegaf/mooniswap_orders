const BN = web3.utils.BN;

const expect = require('chai')
  .use(require('bn-chai')(BN))
  .expect;

module.exports.expect = expect;

module.exports.bn = (number) => {
  return web3.utils.toBN(number);
};

module.exports.random32 = () => {
  return web3.utils.randomHex(32);
};

module.exports.toETH = (amount = 1) => {
  return this.bn(web3.utils.toWei(amount.toString()));
};

module.exports.toEvents = async (tx, ...events) => {
  if (tx instanceof Promise) {
    tx = await tx;
  }

  const logs = tx.logs;

  let eventObjs = [].concat.apply(
    [],
    events.map(
      event => logs.filter(
        log => log.event === event
      )
    )
  );

  if (eventObjs.length === 0 || eventObjs.some(x => x === undefined)) {
    console.log('\t\u001b[91m\u001b[2m\u001b[1mError: The event dont find');
    assert.fail();
  }
  eventObjs = eventObjs.map(x => x.args);
  return (eventObjs.length === 1) ? eventObjs[0] : eventObjs;
};
