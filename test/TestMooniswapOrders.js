const TokenMock = artifacts.require('TokenMock.sol');
const MooniFactory = artifacts.require('MooniFactory');
const Mooniswap = artifacts.require('Mooniswap');

const MooniswapOrders = artifacts.require('MooniswapOrders');

const {
  expect,
  bn,
  address0x,
  random32,
  toETH,
  tryCatchRevert,
  toEvents,
} = require('./Helper.js');

contract('MooniswapOrders', function (accounts) {
  const signer = accounts[2];
  const sender = accounts[3];
  const referral = accounts[4];

  let DAI;
  let WETH;

  let mooniswapPool;
  let mooniFactory;
  let mooniswapOrders;

  function calcOrderId (mooniswapPoolAddress, fromToken, toToken, fromAmount, minReturn, maxLoss, referral, expiry, salt) {
    return web3.utils.soliditySha3(
      { t: 'address', v: mooniswapOrders.address },
      { t: 'address', v: mooniswapPoolAddress },
      { t: 'address', v: fromToken },
      { t: 'address', v: toToken },
      { t: 'uint256', v: fromAmount },
      { t: 'uint256', v: minReturn },
      { t: 'uint256', v: maxLoss },
      { t: 'address', v: referral },
      { t: 'uint256', v: expiry },
      { t: 'bytes32', v: salt },
    );
  }

  async function calcSig (mooniswapPoolAddress, fromToken, toToken, fromAmount, minReturn, maxLoss, referral, expiry, salt, signer) {
    const hash = calcOrderId(mooniswapPoolAddress, fromToken, toToken, fromAmount, minReturn, maxLoss, referral, expiry, salt);

    return web3.eth.sign(hash, signer);
  }

  before('Deploy contracts', async () => {
    DAI = await TokenMock.new('DAI', 'DAI', 18);
    WETH = await TokenMock.new('WETH', 'WETH', 18);

    mooniFactory = await MooniFactory.new();

    mooniswapOrders = await MooniswapOrders.new();

    await mooniFactory.deploy(WETH.address, DAI.address);
    mooniswapPool = await Mooniswap.at(await mooniFactory.pools(WETH.address, DAI.address));

    await WETH.mint(sender, toETH('1'));
    await WETH.approve(mooniswapPool.address, toETH('1'), { from: sender });

    await DAI.mint(sender, toETH('600'));
    await DAI.approve(mooniswapPool.address, toETH('600'), { from: sender });

    await mooniswapPool.deposit([toETH('600'), toETH('1')], [0, 0], { from: sender });
  });

  it('Function toOrderId', async () => {
    const fromAmount = bn(1);
    const minReturn = bn(12);
    const maxLoss = bn(123);
    const expiry = bn(1234);
    const salt = random32();

    const orderIdLocal = calcOrderId(mooniswapPool.address, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, referral, expiry, salt);
    const orderId = await mooniswapOrders.toOrderId(mooniswapPool.address, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, referral, expiry, salt);

    assert.equal(orderIdLocal, orderId);
  });
  it('Function signatureToOwner', async () => {
    const fromAmount = bn(1);
    const minReturn = bn(12);
    const maxLoss = bn(123);
    const expiry = bn(1234);
    const salt = random32();

    const signature = await calcSig(mooniswapPool.address, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, referral, expiry, salt, signer);

    const owner = await mooniswapOrders.signatureToOwner(mooniswapPool.address, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, referral, expiry, salt, signature);

    assert.equal(owner, signer);
  });
  it('Function cancelOrder', async () => {
    const fromAmount = bn(1);
    const minReturn = bn(12);
    const maxLoss = bn(123);
    const expiry = bn(1234);
    const salt = random32();

    const orderId = calcOrderId(sender, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, referral, expiry, salt);

    assert.isFalse(await mooniswapOrders.canceledOrders(signer, orderId));

    const CancelOrder = await toEvents(
      mooniswapOrders.cancelOrder(sender, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, referral, expiry, salt, { from: signer }),
      'CancelOrder',
    );

    assert.equal(CancelOrder._orderId, orderId);
    assert.equal(CancelOrder._mooniswapPool, sender);
    assert.equal(CancelOrder._fromToken, DAI.address);
    assert.equal(CancelOrder._toToken, WETH.address);
    expect(CancelOrder._fromAmount).to.eq.BN(fromAmount);
    expect(CancelOrder._minReturn).to.eq.BN(minReturn);
    expect(CancelOrder._maxLoss).to.eq.BN(maxLoss);
    assert.equal(CancelOrder._referral, referral);
    expect(CancelOrder._expiry).to.eq.BN(expiry);
    assert.equal(CancelOrder._salt, salt);

    assert.isTrue(await mooniswapOrders.canceledOrders(signer, orderId));
  });
  describe('Function executeOrder', async function () {
    it('Sign and execute an order', async function () {
      const fromAmount = bn(100000);
      const expiry = bn('9999999999999999999999999999999');
      const salt = random32();

      await DAI.mint(signer, fromAmount);
      await DAI.approve(mooniswapOrders.address, fromAmount, { from: signer });

      const prevSignerBalDAI = await DAI.balanceOf(signer);
      const prevSenderBalDAI = await DAI.balanceOf(sender);
      const prevMooniswapPoolBalDAI = await DAI.balanceOf(mooniswapPool.address);
      const prevMooniswapOrdersBalDAI = await DAI.balanceOf(mooniswapOrders.address);

      const prevSignerBalWETH = await WETH.balanceOf(signer);
      const prevSenderBalWETH = await WETH.balanceOf(sender);
      const prevMooniswapPoolBalWETH = await WETH.balanceOf(mooniswapPool.address);
      const prevMooniswapOrdersBalWETH = await WETH.balanceOf(mooniswapOrders.address);

      const toAmount = await mooniswapPool.getReturn(DAI.address, WETH.address, fromAmount);
      const minReturn = toAmount;
      const maxLoss = toAmount.add(bn(1));
      const signature = await calcSig(mooniswapPool.address, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, referral, expiry, salt, signer);

      const ExecuteOrder = await toEvents(
        mooniswapOrders.executeOrder(mooniswapPool.address, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, referral, expiry, salt, signature, { from: sender }),
        'ExecuteOrder',
      );

      const orderId = calcOrderId(mooniswapPool.address, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, referral, expiry, salt);
      assert.equal(ExecuteOrder._orderId, orderId);
      assert.equal(ExecuteOrder._fromToken, DAI.address);
      assert.equal(ExecuteOrder._toToken, WETH.address);
      expect(ExecuteOrder._fromAmount).to.eq.BN(fromAmount);
      expect(ExecuteOrder._minReturn).to.eq.BN(minReturn);
      expect(ExecuteOrder._maxLoss).to.eq.BN(maxLoss);
      assert.equal(ExecuteOrder._referral, referral);
      expect(ExecuteOrder._expiry).to.eq.BN(expiry);
      assert.equal(ExecuteOrder._salt, salt);
      assert.equal(ExecuteOrder._signature, signature);

      // check post balances
      expect(await DAI.balanceOf(signer)).to.eq.BN(prevSignerBalDAI.sub(fromAmount));
      expect(await DAI.balanceOf(mooniswapPool.address)).to.eq.BN(prevMooniswapPoolBalDAI.add(fromAmount));

      expect(await WETH.balanceOf(signer)).to.eq.BN(prevSignerBalWETH.add(toAmount));
      expect(await WETH.balanceOf(mooniswapPool.address)).to.eq.BN(prevMooniswapPoolBalWETH.sub(toAmount));

      // Equal balances
      expect(await DAI.balanceOf(sender)).to.eq.BN(prevSenderBalDAI);
      expect(await DAI.balanceOf(mooniswapOrders.address)).to.eq.BN(prevMooniswapOrdersBalDAI);
      expect(await WETH.balanceOf(sender)).to.eq.BN(prevSenderBalWETH);
      expect(await WETH.balanceOf(mooniswapOrders.address)).to.eq.BN(prevMooniswapOrdersBalWETH);
    });
    it('Try execute an expired order', async function () {
      const expiry = bn(100);
      const salt = random32();
      const signature = await calcSig(mooniswapPool.address, DAI.address, WETH.address, bn(1), bn(1), bn(1), address0x, expiry, salt, signer);

      await tryCatchRevert(
        () => mooniswapOrders.executeOrder(
          mooniswapPool.address, DAI.address, WETH.address, bn(1), bn(1), bn(1), address0x, expiry, salt, signature, { from: sender },
        ),
        'MooniswapOrders: The signature has expired',
      );
    });
    it('Try execute an order twice', async function () {
      const salt = random32();
      const signature = await calcSig(mooniswapPool.address, DAI.address, WETH.address, bn(1000), bn(0), bn(1000), address0x, bn('999999999999'), salt, signer);
      const orderId = calcOrderId(mooniswapPool.address, DAI.address, WETH.address, bn(1000), bn(0), bn(1000), address0x, bn('999999999999'), salt);

      assert.isFalse(await mooniswapOrders.canceledOrders(signer, orderId));

      await DAI.mint(signer, bn(1000));
      await DAI.approve(mooniswapOrders.address, bn(1000), { from: signer });

      await mooniswapOrders.executeOrder(mooniswapPool.address, DAI.address, WETH.address, bn(1000), bn(0), bn(1000), address0x, bn('999999999999'), salt, signature, { from: sender });

      assert.isTrue(await mooniswapOrders.canceledOrders(signer, orderId));

      await tryCatchRevert(
        () => mooniswapOrders.executeOrder(
          mooniswapPool.address, DAI.address, WETH.address, bn(1000), bn(0), bn(1000), address0x, bn('999999999999'), salt, signature, { from: sender },
        ),
        'MooniswapOrders: The order hash was canceled',
      );

      assert.isTrue(await mooniswapOrders.canceledOrders(signer, orderId));
    });
    // TODO: test with fake mooniswapPool
    it.skip('Try execute an order with high price', async function () {
      const fromAmount = bn(100000);
      const toAmount = await mooniswapPool.getReturn(DAI.address, WETH.address, fromAmount);
      const minReturn = toAmount.add(bn(1));
      const maxLoss = toAmount;
      const salt = random32();
      const signature = await calcSig(mooniswapPool.address, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, address0x, bn('999999999999'), salt, signer);

      await DAI.mint(signer, fromAmount);
      await DAI.approve(mooniswapOrders.address, fromAmount, { from: signer });

      await tryCatchRevert(
        () => mooniswapOrders.executeOrder(
          mooniswapPool.address, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, address0x, bn('999999999999'), salt, signature, { from: sender },
        ),
        'MooniswapOrders: The swap return less tokens than _minReturn',
      );
    });
    it('Try execute a stop loss order with low price', async function () {
      const fromAmount = bn(100000);
      const toAmount = await mooniswapPool.getReturn(DAI.address, WETH.address, fromAmount);
      const minReturn = toAmount;
      const maxLoss = toAmount.sub(bn(1));
      const salt = random32();
      const signature = await calcSig(mooniswapPool.address, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, address0x, bn('999999999999'), salt, signer);

      await DAI.mint(signer, fromAmount);
      await DAI.approve(mooniswapOrders.address, fromAmount, { from: signer });

      await tryCatchRevert(
        () => mooniswapOrders.executeOrder(
          mooniswapPool.address, DAI.address, WETH.address, fromAmount, minReturn, maxLoss, address0x, bn('999999999999'), salt, signature, { from: sender },
        ),
        'MooniswapOrders: The swap return more tokens than _maxLoss',
      );
    });
  });
});
