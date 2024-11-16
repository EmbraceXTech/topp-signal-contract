// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IPriceOracle.sol";
import "../interfaces/IPriceOracleCaller.sol";

contract TestPriceOracle is IPriceOracle {
    IPriceOracleCaller public caller;

    function requestPrice(uint time) external override {
        
    }

    function fulfillPrice(uint time, uint price) external {
        caller.fulfillPrice(time, price);
    }

    function setCaller(address _caller) external {
        caller = IPriceOracleCaller(_caller);
    }
}
