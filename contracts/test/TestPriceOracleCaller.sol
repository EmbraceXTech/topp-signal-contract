// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IPriceOracle.sol";
import "../interfaces/IPriceOracleCaller.sol";

contract TestPriceOracleCaller is IPriceOracleCaller {
    IPriceOracle public oracle;
    uint public lastPrice;
    uint public lastTime;

    constructor(address _oracle) {
        oracle = IPriceOracle(_oracle);
    }

    function requestPrice(uint time) external {
        oracle.requestPrice(time);
    }

    function fulfillPrice(uint time, uint price) external override {
        require(msg.sender == address(oracle), "Only oracle can fulfill");
        lastTime = time;
        lastPrice = price;
    }

    function setOracle(address _oracle) external {
        oracle = IPriceOracle(_oracle);
    }
}
