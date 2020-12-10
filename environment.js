const nodes = {
  infura: {
    ropsten: 'https://ropsten.infura.io/v3/',
    mainnet: 'https://mainnet.infura.io/v3/',
  },
};

const redisUrl = "redis://127.0.0.1:6379";

module.exports = {
  main: {
    nodeEth: nodes.infura.mainnet,
    redisUrl: redisUrl,
  },
  ropsten: {
    BOT_PK: '0x0000000000000000000000000000000000000000000000000000000000000006',
    nodeEth: nodes.infura.ropsten,
    redisUrl: redisUrl,
  },
};
