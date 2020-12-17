pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./mooniswap/Mooniswap.sol";

contract MooniswapOrders {
    using SafeERC20 for IERC20;

    event ExecuteOrder(
        bytes32 indexed _orderId,
        Mooniswap _mooniswapPool,
        IERC20 _fromToken,
        IERC20 _toToken,
        uint256 _fromAmount,
        uint256 _minReturn,
        uint256 _maxLoss,
        address _referral,
        uint256 _expiry,
        bytes32 _salt,
        bytes _signature
    );

    event CancelOrder(
        bytes32 indexed _orderId,
        Mooniswap _mooniswapPool,
        IERC20 _fromToken,
        IERC20 _toToken,
        uint256 _fromAmount,
        uint256 _minReturn,
        uint256 _maxLoss,
        address _referral,
        uint256 _expiry,
        bytes32 _salt
    );

    mapping(address => mapping(bytes32 => bool)) public canceledOrders;

    function cancelOrder(
        Mooniswap _mooniswapPool,
        IERC20 _fromToken,
        IERC20 _toToken,
        uint256 _fromAmount,
        uint256 _minReturn,
        uint256 _maxLoss,
        address _referral,
        uint256 _expiry,
        bytes32 _salt
    ) external {
        bytes32 orderId = _toOrder(_mooniswapPool, _fromToken, _toToken, _fromAmount, _minReturn, _maxLoss, _referral, _expiry, _salt);

        canceledOrders[msg.sender][orderId] = true;

        emit CancelOrder(orderId, _mooniswapPool, _fromToken, _toToken, _fromAmount, _minReturn, _maxLoss, _referral, _expiry, _salt);
    }

    function executeOrder(
        Mooniswap _mooniswapPool,
        IERC20 _fromToken,
        IERC20 _toToken,
        uint256 _fromAmount,
        uint256 _minReturn,
        uint256 _maxLoss,
        address _referral,
        uint256 _expiry,
        bytes32 _salt,
        bytes calldata _signature
    ) external {
        // solium-disable-next-line
        require(now <= _expiry, "MooniswapOrders: The signature has expired");

        bytes32 orderId = _toOrder(_mooniswapPool, _fromToken, _toToken, _fromAmount, _minReturn, _maxLoss, _referral, _expiry, _salt);
        address owner = recoveryOwner(orderId, _signature);

        require(!canceledOrders[owner][orderId], "MooniswapOrders: The order hash was canceled");
        canceledOrders[owner][orderId] = true;

        // Take the owner from tokens and approve the Mooniswap contract
        _fromToken.safeTransferFrom(owner, address(this), _fromAmount);
        _fromToken.safeApprove(address(_mooniswapPool), _fromAmount);

        // Swap(fromToken -> toToken)
        uint256 toAmount = _mooniswapPool.swap(_fromToken, _toToken, _fromAmount, _minReturn, _referral);

        // Checks
        require(toAmount >= _minReturn, "MooniswapOrders: The swap return less tokens than _minReturn");
        // Stoploss check
        require(toAmount <= _maxLoss, "MooniswapOrders: The swap return more tokens than _maxLoss");

        // Send the to tokens to the owner
        _toToken.safeTransfer(owner, _toToken.balanceOf(address(this)));

        emit ExecuteOrder(orderId, _mooniswapPool, _fromToken, _toToken, _fromAmount, _minReturn, _maxLoss, _referral, _expiry, _salt, _signature);
    }

    function recoveryOwner(bytes32 _orderId, bytes memory _signature) internal pure returns (address) {
        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := and(mload(add(_signature, 65)), 255)
        }

        if (v < 27) v += 27;

        return ecrecover(
            keccak256(
                abi.encodePacked(
                    "\x19Ethereum Signed Message:\n32",
                    _orderId
                )
            ),
            v,
            r,
            s
        );
    }

    function _toOrder(
        Mooniswap _mooniswapPool,
        IERC20 _fromToken,
        IERC20 _toToken,
        uint256 _fromAmount,
        uint256 _minReturn,
        uint256 _maxLoss,
        address _referral,
        uint256 _expiry,
        bytes32 _salt
    ) internal view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                address(this),
                _mooniswapPool,
                _fromToken,
                _toToken,
                _fromAmount,
                _minReturn,
                _maxLoss,
                _referral,
                _expiry,
                _salt
            )
        );
    }

    function toOrderId(
        Mooniswap _mooniswapPool,
        IERC20 _fromToken,
        IERC20 _toToken,
        uint256 _fromAmount,
        uint256 _minReturn,
        uint256 _maxLoss,
        address _referral,
        uint256 _expiry,
        bytes32 _salt
    ) external view returns (bytes32) {
        return _toOrder(_mooniswapPool, _fromToken, _toToken, _fromAmount, _minReturn, _maxLoss, _referral, _expiry, _salt);
    }

    function signatureToOwner(
        Mooniswap _mooniswapPool,
        IERC20 _fromToken,
        IERC20 _toToken,
        uint256 _fromAmount,
        uint256 _minReturn,
        uint256 _maxLoss,
        address _referral,
        uint256 _expiry,
        bytes32 _salt,
        bytes calldata _signature
    ) external view returns(address) {
        bytes32 orderId = _toOrder(_mooniswapPool, _fromToken, _toToken, _fromAmount, _minReturn, _maxLoss, _referral, _expiry, _salt);
        return recoveryOwner(orderId, _signature);
    }
}