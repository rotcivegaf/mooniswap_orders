import axios from "axios";

//const local = "http://localhost:5000/";
const urlBase = "https://mooniswap-orders-back.herokuapp.com/";

async function getOrders() {
  try {
    const ret = await axios.get(urlBase + "orders/");
    return ret.data;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function getOrder(sig) {
  try {
    const ret = await axios.get(urlBase + "order/" + sig);
    return JSON.parse(ret.data);
  } catch (error) {
    console.log(error);
    return error;
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
