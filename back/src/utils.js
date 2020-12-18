module.exports.sleep = async ms => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

module.exports.bn = x => {
  return process.web3.utils.toBN(x);
};

module.exports.isBN = (x) => {
  try {
    x = this.bn(x);
    return process.web3.utils.isBN(x);
  } catch (error) {
    return false;
  }
};

module.exports.isBytes = (x, n = 66) => {
  return x.length === n && process.web3.utils.isHexStrict(x);
};

module.exports.getBlock = async (x = 'latest') => {
  try {
    let block = await process.web3.eth.getBlock(x);

    while (block === undefined) {
      block = await process.web3.eth.getBlock(x);

      console.log('Wait 500 ms for getBlock Error');
      await this.sleep(500);
    }
    return block;
  } catch (error) {
    console.log(error.message);
  }
};

module.exports.isAddress = address => {
  return process.web3.utils.isAddress(
    process.web3.utils.toChecksumAddress(address),
  );
};
