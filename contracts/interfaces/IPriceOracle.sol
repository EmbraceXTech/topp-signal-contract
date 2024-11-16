// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

interface IPriceOracle {
    function requestPrice(uint time) external;
}
