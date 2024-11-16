// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IPriceOracle.sol";
import "../interfaces/IPriceOracleCaller.sol";

// Disclaimer: this contract is for demonstration purposes only. In production, asset price data should come from a decentralized oracle.

contract SimplePriceOracle is IPriceOracle {
    IPriceOracleCaller public caller;
    mapping(uint => uint) public prices;

    event PriceRequested(uint time);
    event PriceUpdated(uint timestamp, uint price);

    function requestPrice(uint time) external override {
        require(caller == IPriceOracleCaller(msg.sender), "Unauthorized");
        emit PriceRequested(time);
    }

    function fulfillPrice(uint time, uint price) external {
        prices[time] = price;
        caller.fulfillPrice(time, price);
        emit PriceUpdated(time, price);
    }

    function setCaller(address _caller) external {
        caller = IPriceOracleCaller(_caller);
    }
}
