// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./ToppSignalPool.sol";

contract ERC20ToppSignalPool is ToppSignalPool {

    IERC20 public currency;

    constructor(
        address _ticket,
        address _priceOracle,
        address _randomOracle,
        address _feeCollector,
        address _reservePool,
        uint _maxTicketPerSlot,
        uint _ticketPrice,
        address _currency
    ) ToppSignalPool(_ticket, _priceOracle, _randomOracle, _feeCollector, _reservePool, _maxTicketPerSlot, _ticketPrice) {
        currency = IERC20(_currency);
    }

    // Virtual functions
    function _transferIn(uint amount, address sender) internal override returns (bool) {
        IERC20(currency).transferFrom(sender, address(this), amount);
        return true;
    }

    function _transferOut(uint amount, address recipient) internal override returns (bool) {
        IERC20(currency).transfer(recipient, amount);
        return true;
    }
}
