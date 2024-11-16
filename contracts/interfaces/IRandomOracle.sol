// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

interface IRandomOracle {
    function requestRandomness(uint time, uint amount) external;
}
