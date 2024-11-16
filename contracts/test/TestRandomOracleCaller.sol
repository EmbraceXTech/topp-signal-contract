// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IRandomOracle.sol";
import "../interfaces/IRandomOracleCaller.sol";

contract TestRandomOracleCaller is IRandomOracleCaller {
    IRandomOracle public oracle;
    uint[] public lastValues;
    uint public lastTime;

    constructor(address _oracle) {
        oracle = IRandomOracle(_oracle);
    }

    function requestRandomness(uint time) external {
        oracle.requestRandomness(time, 3);
    }

    function fulfillRandomness(uint time, uint[] calldata values) external override {
        require(msg.sender == address(oracle), "Only oracle can fulfill");
        lastTime = time;
        lastValues = values;
    }

    function setOracle(address _oracle) external {
        oracle = IRandomOracle(_oracle);
    }
}
