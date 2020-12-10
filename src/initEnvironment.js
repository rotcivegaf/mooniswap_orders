const RedisClient = require('./RedisClient.js');

const env = require('../environment.js');

const Web3 = require('web3');

module.exports = async () => {
  process.environment = initEnv();

  process.redis = await (new RedisClient()).init();
  process.web3 = new Web3(new Web3.providers.HttpProvider(process.environment.nodeEth));
  console.log('Connect Web3 to ' + process.web3.currentProvider.host);
};

function initEnv() {
  return env['ropsten'];
  //env[program.environment ? program.environment : 'main'];
}