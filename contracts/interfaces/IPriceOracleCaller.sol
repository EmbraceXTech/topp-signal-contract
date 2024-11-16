// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

interface IPriceOracleCaller {
    function fulfillPrice(uint time, uint price) external;
}
