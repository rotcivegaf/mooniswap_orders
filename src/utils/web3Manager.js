import Web3 from "web3";

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

export default {
  instanceWeb3,
  getUser
};
