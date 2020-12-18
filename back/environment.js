const nodes = {
  infura: {
    ropsten: 'https://ropsten.infura.io/v3/' + process.env.ROPSTEN_NODE_KEY,
    mainnet: 'https://mainnet.infura.io/v3/',
  },
};

const redisUrlLocal = 'redis://127.0.0.1:6379';
const redisUrlHeroku = process.env.REDISCLOUD_URL;

module.exports = {
  local: {
    redisUrl: redisUrlLocal,
  },
  heroku: {
    BOT_PK: process.env.ROPSTEN_BOT_PK,
    nodeEth: nodes.infura.ropsten,
    redisUrl: redisUrlHeroku,
  },
};
