import Web3 from "web3";

const mooniswapOrdersAddress = "0x80E74A883d8A196E755B5e384cb9959beAFefb87";
const mooniFactoryAddress = "0xcdDB95AbF5Da5395F7De7936CE7Cf569aF891651";
const address0x = "0x0000000000000000000000000000000000000000";

const instanceWeb3 = async function() {
  let web3Instance = null;

  if (window.ethereum) {
    web3Instance = new Web3(window.ethereum);
    try {
      // Request account access if needed
      await window.ethereum.enable();
    } catch (error) {
      web3Instance = null;
      throw new Error("denied");
      // User denied account access...
    }
    return web3Instance;
  } else if (window.web3) {
    // Legacy dapp browsers...
    web3Instance = new Web3(window.web3.currentProvider);
    return web3Instance;
  }

  // Non-dapp browsers...
  console.log(
    "Non-Ethereum browser detected. You should consider trying MetaMask!"
  );
  throw new Error("MetaMask missing");
};

const getUser = async function(web3) {
  const accounts = await web3.eth.getAccounts((err, accounts) => {
    if (err) console.error("web3 error", err);
    return accounts;
  });

  return web3.utils.toChecksumAddress(accounts[0]);
};

async function getPool(web3, from, to) {
  try {
    const mooniFactory = new web3.eth.Contract(
      require("../abis/MooniFactory.json"),
      mooniFactoryAddress
    );

    const mooniswapPoolAddress = await mooniFactory.methods
      .pools(from, to)
      .call();
    if (mooniswapPoolAddress === address0x)
      throw new Error("The pool dont exists");

    return mooniswapPoolAddress;
  } catch (error) {
    console.log(error);
    return error;
  }
}

export default {
  instanceWeb3,
  getUser,
  mooniswapOrdersAddress,
  getPool
};
