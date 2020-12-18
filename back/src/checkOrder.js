const utils = require('./utils.js');

module.exports.checkNewOrder = async order => {
  // Check addresses
  if (!utils.isAddress(order.mooniswapOrdersAddress)) { return 'The order.mooniswapOrdersAddress its not an address: ' + order.mooniswapOrdersAddress; }
  if (!utils.isAddress(order.mooniswapPoolAddress)) { return 'The order.mooniswapPoolAddress its not an address: ' + order.mooniswapPoolAddress; }
  if (!utils.isAddress(order.fromToken)) { return 'The order.fromToken its not an address: ' + order.fromToken; }
  if (!utils.isAddress(order.toToken)) { return 'The order.toToken its not an address: ' + order.toToken; }
  if (!utils.isAddress(order.referral)) { return 'The order.referral its not an address: ' + order.referral; }
  // Bytes
  if (!utils.isBytes(order.salt)) { return 'The order.salt its not a bytes32: ' + order.salt; }
  // Uint256
  if (!utils.isBN(order.fromAmount)) { return 'The order.fromAmount its not a uint256: ' + order.fromAmount; }
  if (!utils.isBN(order.minReturn)) { return 'The order.minReturn its not a uint256: ' + order.minReturn; }
  if (!utils.isBN(order.maxLoss)) { return 'The order.maxLoss its not a uint256: ' + order.maxLoss; }
  if (!utils.isBN(order.expiry)) { return 'The order.expiry its not a uint256: ' + order.expiry; }

  return checkOrder(order);
};

async function checkOrder (order) {
  // Check expiry
  const now = utils.bn((await utils.getBlock()).timestamp);
  if (now.gt(utils.bn(order.expiry))) { return 'The order.expiry its expired: ' + order.expiry; }

  return 'OK';
}
