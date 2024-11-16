// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

interface IRandomOracleCaller {
    function fulfillRandomness(uint time, uint[] calldata values) external;
}
