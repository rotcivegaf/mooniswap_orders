const RedisClient = require('./RedisClient.js');
const WalletManager = require('./WalletManager.js');
const SignerBot = require('../src/SignerBot.js');

const env = require('../environment.js');

const Web3 = require('web3');

module.exports = async () => {
  process.configDefault = initEnv();

  process.redis = await (new RedisClient()).init();
  process.web3 = new Web3(new Web3.providers.HttpProvider(process.configDefault.nodeEth));
  console.log('Connect Web3 to ' + process.web3.currentProvider.host);

  process.contracts = [];
  process.contracts.mooniswapOrders = new process.web3.eth.Contract(require('./abis/MooniswapOrders.json'));
  process.contracts.mooniswap = new process.web3.eth.Contract(require('./abis/Mooniswap.json'));
  process.contracts.erc20 = new process.web3.eth.Contract(require('./abis/ERC20.json'));

  process.walletManager = new WalletManager();

  process.signerBot = new SignerBot();
};

function initEnv () {
  return env.heroku;
}
