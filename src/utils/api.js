import axios from "axios";

const urlBase = "";

async function getOrders() {
  try {
    //const ret = await axios.get(urlBase + "orders/");
    //return ret.data;
    return ordersMock;
  } catch (error) {
    console.log(error);
  }
}

async function getOrder(/*sig*/) {
  try {
    //const ret = await axios.get(urlBase + "order/" + sig);
    //return JSON.parse(ret.data);
    return orderMock;
  } catch (error) {
    console.log(error);
  }
}

async function saveOrder(order) {
  axios
    .post(urlBase + "addOrder/", order)
    .then(function(response) {
      console.log(response);
    })
    .catch(function(error) {
      console.log(error);
    });
}

export default {
  getOrders,
  getOrder,
  saveOrder
};

const orderMock = {
  orderId: "0x0000000000000000000000000000000000000000000000000000000000000008",
  mooniswapOrdersAddress: "0xc1A13F4B815f5362CA62D47ebdC4874dB3c4a2Ca",
  mooniswapPoolAddress: "0x0000000000000000000000000000000000000002",
  fromToken: "0x0000000000000000000000000000000000000003",
  toToken: "0x0000000000000000000000000000000000000004",
  fromAmount: "0x01",
  minReturn: "0x02",
  maxLoss: "0x03",
  referral: "0x0000000000000000000000000000000000000005",
  expiry: "0x7CE66C50E2840000",
  salt: "0x0000000000000000000000000000000000000000000000000000000000000006",
  signature:
    "0xb91467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c",
  owner: "0x0000000000000000000000000000000000000005",
  message: "OK",
  cancel: true,
};
const orderMock2 = {
  orderId: "0x0000000000000000000000000000000000000000000000000000000000000007",
  mooniswapOrdersAddress: "0xc1A13F4B815f5362CA62D47ebdC4874dB3c4a2Ca",
  mooniswapPoolAddress: "0x0000000000000000000000000000000000000002",
  fromToken: "0x0000000000000000000000000000000000000003",
  toToken: "0x0000000000000000000000000000000000000004",
  fromAmount: "0x01",
  minReturn: "0x02",
  maxLoss: "0x03",
  referral: "0x0000000000000000000000000000000000000005",
  expiry: "0x7CE66C50E2840000",
  salt: "0x0000000000000000000000000000000000000000000000000000000000000006",
  signature:
    "0x591467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c",
  owner: "0x0000000000000000000000000000000000000005",
  message: "OK",
  cancel: true,
};
const orderMock3 = {
  orderId: "0x0000000000000000000000000000000000000000000000000000000000000009",
  mooniswapOrdersAddress: "0xc1A13F4B815f5362CA62D47ebdC4874dB3c4a2Ca",
  mooniswapPoolAddress: "0x0000000000000000000000000000000000000002",
  fromToken: "0x0000000000000000000000000000000000000003",
  toToken: "0x0000000000000000000000000000000000000004",
  fromAmount: "0x01",
  minReturn: "0x02",
  maxLoss: "0x03",
  referral: "0x0000000000000000000000000000000000000005",
  expiry: "0x71f66C50",
  salt: "0x1000000000000000000000000000000000000000000000000000000000000006",
  signature:
    "0x391467e570a6466aa9e9876cbcd013baba02900b8979d43fe208a4a4f339f5fd6007e74cd82e037b800186422fc2da167c747ef045e5d18a5f5d4300f8e1a0291c",
  owner: "0x0000000000000000000000000000000000000005",
  message: "OK",
  cancel: false,
};
const ordersMock = [orderMock, orderMock2, orderMock3];