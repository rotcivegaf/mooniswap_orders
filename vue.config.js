const path = require('path');

module.exports = {
  publicPath: '/mooniswap_orders/',
  chainWebpack: config => {
    config
      .entry('app')
      .clear()
      .add('./front/src/main.js')
      .end();
    config.resolve.alias
      .set('@', path.join(__dirname, './front/src/'));
  },
};
