// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IRandomOracle.sol";
import "../interfaces/IRandomOracleCaller.sol";

contract TestRandomOracle is IRandomOracle {
    IRandomOracleCaller public caller;

    function requestRandomness(uint time) external override {
        
    }

    function fulfillRandomness(uint time, uint[] calldata values) external {
        caller.fulfillRandomness(time, values);
    }

    function setCaller(address _caller) external {
        caller = IRandomOracleCaller(_caller);
    }
}
