[![Lint Status](https://github.com/rotcivegaf/mooniswap_orders/workflows/Lint/badge.svg)](https://github.com/rotcivegaf/mooniswap_orders/actions?query=workflow%3ALint)
[![Test Status](https://github.com/rotcivegaf/mooniswap_orders/workflows/Test/badge.svg)](https://github.com/rotcivegaf/mooniswap_orders/actions?query=workflow%3ATest)
[![Coverage Status](https://github.com/rotcivegaf/mooniswap_orders/workflows/Coverage/badge.svg)](https://github.com/rotcivegaf/mooniswap_orders/actions?query=workflow%3ACoverage)

[![Coverage](https://codecov.io/gh/rotcivegaf/mooniswap_orders/graph/badge.svg)](https://codecov.io/gh/rotcivegaf/mooniswap_orders)

# Mooniswap Orders

## Contracts

  ### The Mooniswap Orders Contract:
  This contract has 2 important function:
```solidity
function cancelOrder(
  Mooniswap _mooniswapPool, // Mooniswap Pool Address
  IERC20 _fromToken,        // From Token Address
  IERC20 _toToken,          // To Token Address
  uint256 _fromAmount,      // From Amount
  uint256 _minReturn,       // Minimum To Amount Return
  uint256 _maxLoss,         // Maximum Loss in To Amount
  address _referral,        // Referral for Mooniswap
  uint256 _expiry,          // The expiry of signature
  bytes32 _salt             // Add entropy to the hash id
) external;
```
This function uses to cancel a signed Order.
        
```solidity
function executeOrder(
  Mooniswap _mooniswapPool, // Mooniswap Pool Address
  IERC20 _fromToken,        // From Token Address
  IERC20 _toToken,          // To Token Address
  uint256 _fromAmount,      // From Amount
  uint256 _minReturn,       // Minimum To Amount Return
  uint256 _maxLoss,         // Maximum Loss in To Amount
  address _referral,        // Referral for Mooniswap
  uint256 _expiry,          // The expiry of signature
  bytes32 _salt,            // Add entropy to the hash id
  bytes calldata _signature // Signature
) external;
```
This function uses to execute a signed Order.

When an user sign a order swap on Mooniswap should be specify address of the `poll`, the `from token`, `to token` and the`from token amount`, also the `expiry` and a `salt`.
The `minReturn` is used for the amount of To Token to be received for the amount of From Token.
The `maxLoss` is used for order type, if is greater than To Token Amount is a 'Take Profit Order' else is a "Stop Loss Limit Order". 
Another observation of masLoss parameter its if is a Take Profit order the minLoss can be really hight.

The contract require this: `minReturn <= To Token Amount <= maxLoss`

| MinReturn | To Amount | MaxLoss | Order Type         | Execute | Range change To Amount
|---------- |---------- |---------|------------------- |-------- |-----------------------
| 900       | 1000      | 1100    | Market / Stop Loss | Ok      | 900  to 1100
| 1100      | 1000      | 1200    | Market             | Wait    | 1100 to 1200 (1)
| 800       | 1000      | 900     | Stop Loss          | Wait    | 800  to  900 (2)
| 900       | 1000      | 800     | -                  | Never   | -
| 1100      | 1000      | 900     | -                  | Never   | -
| 1200      | 1000      | 1100    | -                  | Never   | -

1. If the amount goes up the 1100(minReturn) To Token the order was execute and accept as maximum 1200(maxLoss) To Token
2. If the amount goes down the 900(maxLoss) To Token the order was execute and accept as minimum 800(minReturn) To Token

Finally, there an another issue, if we have a Stop Loss Limit Order, somebody can manipulate the price to execute this order(Front Running).

### Ropsten Contracts Addresses

  - MooniswapOrders: [0x80E74A883d8A196E755B5e384cb9959beAFefb87](https://ropsten.etherscan.io/address/0x80E74A883d8A196E755B5e384cb9959beAFefb87)

  - MooniFactory: [0xcdDB95AbF5Da5395F7De7936CE7Cf569aF891651](https://ropsten.etherscan.io/address/0xcdDB95AbF5Da5395F7De7936CE7Cf569aF891651)
  - Pool(WETH/USDC): [0xd4fd72E859380B33E742bb7eBe633aa432628411](https://ropsten.etherscan.io/address/0xd4fd72E859380B33E742bb7eBe633aa432628411)
  
  - WETH9: [0xc778417E063141139Fce010982780140Aa0cD5Ab](https://ropsten.etherscan.io/address/0xc778417E063141139Fce010982780140Aa0cD5Ab)  
  - Test USDC: [0x99c1C36DEe5C3B62723DC4223F4352bBf1Da0BfF](https://ropsten.etherscan.io/address/0x99c1C36DEe5C3B62723DC4223F4352bBf1Da0BfF)

### The front
  
  The front provide the signatures to the back and show a table with all signatures.

  - [https://rotcivegaf.github.io/mooniswap_orders/](https://rotcivegaf.github.io/mooniswap_orders/)

### The Back and Bot Signer
  
  In the back storage all the signatures provide by the front.
  The signer bot consult the back and execute the orders when can.
  
  - Api: [https://mooniswap-orders-back.herokuapp.com/orders](https://mooniswap-orders-back.herokuapp.com/orders)
