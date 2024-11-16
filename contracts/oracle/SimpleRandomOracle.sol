// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IRandomOracle.sol";
import "../interfaces/IRandomOracleCaller.sol";

// Disclaimer: this contract is for demonstration purposes only. In production, randomness should come from a decentralized oracle.

contract SimpleRandomOracle is IRandomOracle {
    IRandomOracleCaller public caller;
    uint[] public latestRandomness;
    uint public latestTimestamp;

    event RandomnessRequested(uint time);
    event RandomnessUpdated(uint timestamp, uint[] randomness);

    function requestRandomness(uint time) external override {
        require(caller != IRandomOracleCaller(msg.sender), "Unauthorized");
        caller.fulfillRandomness(time, latestRandomness);
        emit RandomnessRequested(time);
    }

    function updateRandomness(uint[] calldata randomness) external {
        latestRandomness = randomness;
        latestTimestamp = block.timestamp;
        emit RandomnessUpdated(block.timestamp, randomness);
    }

    function setCaller(address _caller) external {
        caller = IRandomOracleCaller(_caller);
    }
}
