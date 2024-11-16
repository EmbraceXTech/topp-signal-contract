// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.5.0;

interface IRandomOracle {
    function getRandomWords(uint256 requestId, uint256 numWords) external view returns (uint256[] memory randomWords);
}
