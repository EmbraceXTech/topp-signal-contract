// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ToppSignalPool.sol";
import "./bkcsdk/ISDKTransferRouter.sol";
import "./token/KKUB.sol";

contract KUBTopSignalPool is ToppSignalPool {

    KKUB public currency;
    ISDKTransferRouter public sdkTransferRouter;
    address public sdkCallHelperRouter;

    constructor(
        address _ticket,
        address _priceOracle,
        address _randomOracle,
        address _feeCollector,
        address _reservePool,
        uint _maxTicketPerSlot,
        uint _ticketPrice,
        address payable _currency,
        address _sdkTransferRouter,
        address _sdkCallHelperRouter
    ) ToppSignalPool(_ticket, _priceOracle, _randomOracle, _feeCollector, _reservePool, _maxTicketPerSlot, _ticketPrice) {
        currency = KKUB(_currency);
        sdkTransferRouter = ISDKTransferRouter(_sdkTransferRouter);
        sdkCallHelperRouter = _sdkCallHelperRouter;
    }

    function placeBidNext(uint time, uint price, uint amount, address sender) external payable {
        return _placeBid(time, price, amount, sender);
    }

    function settleNext(uint time, address sender) external {
        return _settle(time, sender);
    }

    function claimPrizesNext(uint time, uint price, uint amount, address sender) external {
        return _claimPrizes(time, price, amount, sender);
    }

    // Virtual functions
    function _transferIn(uint amount, address sender) internal override returns (bool) {
        if (sender == sdkCallHelperRouter) {
            sdkTransferRouter.transferKAP20(address(currency), address(this), amount, sdkCallHelperRouter);
        } else {
            require(msg.value == amount, "KUBToppSignalPool: invalid amount");
            currency.deposit{value: amount}();
        }
        return true;
    }

    function _transferOut(uint amount, address recipient) internal override returns (bool) {
        currency.transfer(recipient, amount);
        return true;
    }
}
