const { bn, sleepThread } = require('./utils.js');

module.exports = class WalletManager {
  constructor () {
    this.initWallet();
    this.busy = false;
  }

  initWallet () {
    const pk = process.configDefault.BOT_PK;

    if (pk.slice(0, 2) !== '0x') { throw new Error('Wallet Manager/ Wrong format: \n' + pk + ', use a hex bytes32 number(with 0x on the beginning)'); }

    if (process.web3.utils.isHexStrict(pk.slice(2))) { throw new Error('Wallet Manager/ There are no private keys to instance the signers: ' + pk); }

    const wallet = process.web3.eth.accounts.privateKeyToAccount(pk);
    process.web3.eth.accounts.wallet.add(wallet);

    console.log('# Wallet:', wallet.address);

    this.address = process.web3.eth.accounts.wallet[0].address;
  }

  async sendTx (func, txObj = { gas: undefined, gasPrice: undefined, value: 0 }) {
    while (this.busy) { await sleepThread(); }

    this.busy = true;

    if (!txObj.gas) { txObj.gas = await this.estimateGas(func); }

    if (txObj.gas instanceof Error) {
      this.busy = false;
      return txObj.gas;
    }

    let txHash;

    try {
      if (!txObj.gasPrice) { txObj.gasPrice = await process.web3.eth.getGasPrice(); }

      console.log(
        '# Wallet Manager Send { Address:', this.address, 'Gas:', txObj.gas.toString(), '}\n',
        '\t' + func._method.name + '(' + func.arguments + ')',
      );

      txHash = await func.send({
        from: this.address,
        gasPrice: txObj.gasPrice,
        gas: txObj.gas,
        value: txObj.value,
      });
    } catch (error) {
      this.busy = false;
      console.log(
        '# Wallet Manager Error on sendTx { Address:', this.address, '}\n',
        '\t' + func._method.name + '(' + func.arguments + ')\n',
        '\t' + error,
      );

      return error;
    }

    this.busy = false;
    console.log('# Wallet Manager Complete { Address:', this.address, 'Gas:', txObj.gas.toString(), '}\n',
      '\t' + func._method.name + '(' + func.arguments + ')\n',
      '\ttxHash:', txHash.transactionHash);

    return txHash;
  }

  async estimateGas (func) {
    try {
      const gas = await func.estimateGas({
        from: this.address,
        gas: (await process.web3.eth.getBlock('latest')).gasLimit,
      });

      return bn(gas).mul(bn(12000)).div(bn(10000));
    } catch (error) {
      console.log(
        '# Wallet Manager/', this.address, '/Error on estimateGas:\n',
        '\t' + func._method.name + '(' + func.arguments + ')\n',
        '\t' + error);
      return error;
    }
  }
};
