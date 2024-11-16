// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

interface IPriceOracle {
    function getPrice(string memory symbol) external view returns (uint price, uint confidence);
}
